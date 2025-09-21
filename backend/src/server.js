const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"]
  }
});

let currentPoll = null;
let students = [];
let pollHistory = [];
let pollTimer = null; 

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (data) => {
    socket.role = data.role;
    if (data.role === 'teacher') {
      socket.join('teachers');
      socket.emit('poll_state', { currentPoll, students, pollHistory });
    } else {
      socket.studentName = data.name;
      socket.join('students');
      
      students = students.filter(s => s.name !== data.name);
      students.push({ name: data.name, answered: false, socketId: socket.id });
      
      console.log(`Student ${data.name} joined. Total students: ${students.length}`);
      
      io.to('teachers').emit('student_joined', { name: data.name });
      broadcastParticipants();
      if (currentPoll) {
        socket.emit('new_question', currentPoll);
      }
    }
  });

  socket.on('create_poll', (pollData) => {
    if (socket.role === 'teacher') {

      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
      
      currentPoll = {
        ...pollData,
        id: Date.now(),
        startTime: Date.now()
      };
      
      console.log('Creating new poll:', currentPoll.question);

      students = students.map(s => ({ ...s, answered: false, answer: null }));

      io.to('students').emit('new_question', currentPoll);

      io.to('teachers').emit('poll_state', { currentPoll, students, pollHistory });

      startPollTimer(pollData.timeLimit);
    }
  });

  socket.on('remove_student', (studentName) => {
    if (socket.role === 'teacher') {
      console.log(`Teacher removing student: ${studentName}`);
      
      const studentToKick = students.find(s => s.name === studentName);
      
      if (studentToKick) {
        students = students.filter(s => s.name !== studentName);
        
        const studentSocket = io.sockets.sockets.get(studentToKick.socketId);
        if (studentSocket) {
          studentSocket.emit('student_kicked', { studentName });
          studentSocket.disconnect(true);
        }
        
        io.to('teachers').emit('student_removed', { studentName });
        
        console.log(`Student ${studentName} has been kicked out`);
        broadcastParticipants();
      }
    }
  });

  socket.on('get_history', () => {
    if (socket.role === 'teacher') {
      console.log('Teacher requesting history, sending:', pollHistory.length, 'items');
      socket.emit('history_data', pollHistory);
    }
  });

  socket.on('submit_answer', (data) => {
    if (socket.role === 'student') {
      console.log(`Student ${data.studentName} submitted answer: ${data.answer}`);

      students = students.map(s => 
        s.name === data.studentName ? { ...s, answered: true, answer: data.answer } : s
      );

      io.to('teachers').emit('answer_submitted', { studentName: data.studentName });

      const totalStudents = students.length;
      const answeredStudents = students.filter(s => s.answered).length;
      
      console.log(`${answeredStudents}/${totalStudents} students have answered`);
      
      if (totalStudents > 0 && students.every(s => s.answered)) {
        console.log('All students answered, ending poll');
        endPoll();
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.role === 'student' && socket.studentName) {

      const studentName = socket.studentName;
      students = students.filter(s => s.socketId !== socket.id);
      
      console.log(`Student ${studentName} disconnected. Remaining: ${students.length}`);

      io.to('teachers').emit('student_left', { studentName });
       broadcastParticipants();
    }
  });
});

function startPollTimer(timeLimit) {
  let timeLeft = timeLimit;
  
  console.log(`Starting poll timer for ${timeLimit} seconds`);

  if (pollTimer) {
    clearInterval(pollTimer);
  }
  
  pollTimer = setInterval(() => {
    timeLeft--;
    io.emit('time_update', timeLeft);
    
    if (timeLeft <= 0) {
      console.log('Timer expired, ending poll');
      clearInterval(pollTimer);
      pollTimer = null;
      endPoll();
    }
  }, 1000);
}

function endPoll() {
  if (!currentPoll) {
    console.log('No active poll to end');
    return;
  }
  
  console.log('Ending poll:', currentPoll.question);
  

  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }

  const results = currentPoll.options.map(option => {
    const count = students.filter(s => s.answer === option).length;
    return {
      option: option,
      count: count
    };
  });
  
  console.log('Poll results:', results);

  const historyItem = {
    id: Date.now(),
    question: currentPoll.question,
    results: results,
    endedAt: new Date(),
    questionNumber: pollHistory.length + 1
  };
  
  pollHistory.push(historyItem);
  
  console.log('Poll completed, history now contains:', pollHistory.length, 'items');

  io.emit('poll_results', results);
  io.emit('poll_completed', results);
 
  io.to('teachers').emit('history_updated', pollHistory);

  currentPoll = null;

  students = students.map(s => ({ ...s, answered: false, answer: null }));
}

function broadcastParticipants() {
  const participantNames = students.map(s => s.name);
  io.emit('participants_update', participantNames);
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});