// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Your React app URL
    methods: ["GET", "POST"]
  }
});

// Game state
let currentPoll = null;
let students = [];
let pollHistory = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (data) => {
    socket.role = data.role;
    if (data.role === 'teacher') {
      socket.join('teachers');
      // Send current state to teacher
      socket.emit('poll_state', { currentPoll, students, pollHistory });
    } else {
      socket.studentName = data.name;
      socket.join('students');
      
      // Add student to list
      students = students.filter(s => s.name !== data.name);
      students.push({ name: data.name, answered: false, socketId: socket.id });
      
      // Notify teacher
      io.to('teachers').emit('student_joined', { name: data.name });
      
      // If there's an active poll, send it to student
      if (currentPoll) {
        socket.emit('new_question', currentPoll);
      }
    }
  });

  // Handle poll creation
  socket.on('create_poll', (pollData) => {
    if (socket.role === 'teacher') {
      currentPoll = {
        ...pollData,
        id: Date.now(),
        startTime: Date.now()
      };
      
      // Reset student answered status
      students = students.map(s => ({ ...s, answered: false }));
      
      // Send to all students
      io.to('students').emit('new_question', currentPoll);
      
      // Start timer
      startPollTimer(pollData.timeLimit);
    }
  });

  // Handle answer submission
  socket.on('submit_answer', (data) => {
    if (socket.role === 'student') {
      // Update student status
      students = students.map(s => 
        s.name === data.studentName ? { ...s, answered: true, answer: data.answer } : s
      );
      
      // Notify teacher
      io.to('teachers').emit('answer_submitted', { studentName: data.studentName });
      
      // Check if all students answered
      if (students.every(s => s.answered)) {
        endPoll();
      }
    }
  });

  socket.on('disconnect', () => {
    if (socket.role === 'student' && socket.studentName) {
      students = students.filter(s => s.socketId !== socket.id);
      io.to('teachers').emit('student_left', { studentName: socket.studentName });
    }
  });
});

function startPollTimer(timeLimit) {
  let timeLeft = timeLimit;
  
  const timer = setInterval(() => {
    timeLeft--;
    io.emit('time_update', timeLeft);
    
    if (timeLeft <= 0) {
      clearInterval(timer);
      endPoll();
    }
  }, 1000);
}

function endPoll() {
  if (!currentPoll) return;
  
  // Calculate results - ensure count is properly calculated
  const results = currentPoll.options.map(option => {
    const count = students.filter(s => s.answer === option).length;
    return {
      option: option,
      count: count
    };
  });
  
  // Debug: Log results before sending
  console.log('Sending poll results:', results);
  console.log('Students data:', students);
  
  // Add to history
  pollHistory.push({
    question: currentPoll.question,
    results,
    endedAt: new Date()
  });
  
  // Send results to everyone
  io.emit('poll_results', results);
  io.emit('poll_completed', results);
  
  // Clear current poll
  currentPoll = null;
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});