const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// In-memory storage
let currentPoll = null;
let students = new Map(); // studentId -> {name, socketId, answered}
let teachers = new Map(); // teacherId -> socketId
let answers = new Map(); // studentName -> answer
let pollResults = [];
let pollTimer = null;
let pollHistory = []; // Store past polls

// Helper functions
const generatePollResults = () => {
  if (!currentPoll) return [];
  
  const results = currentPoll.options.map(option => ({
    option,
    count: 0,
    students: []
  }));
  
  answers.forEach((answer, studentName) => {
    const resultIndex = results.findIndex(r => r.option === answer);
    if (resultIndex !== -1) {
      results[resultIndex].count++;
      results[resultIndex].students.push(studentName);
    }
  });
  
  return results;
};

const checkAllStudentsAnswered = () => {
  const totalStudents = students.size;
  const answeredStudents = answers.size;
  return totalStudents > 0 && answeredStudents === totalStudents;
};

const endPoll = () => {
  if (!currentPoll) return;
  
  const results = generatePollResults();
  
  // Store in history
  pollHistory.push({
    ...currentPoll,
    results,
    endedAt: new Date(),
    totalStudents: students.size,
    totalResponses: answers.size
  });
  
  // Emit final results
  io.emit('poll_results', results);
  io.emit('poll_ended', results);
  
  // Clear timer
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  
  // Reset poll state
  currentPoll = null;
  answers.clear();
  students.forEach(student => {
    student.answered = false;
  });
  
  // Notify teachers about poll completion
  teachers.forEach((socketId) => {
    io.to(socketId).emit('poll_completed', results);
  });
};

const startPollTimer = (timeLimit) => {
  let timeLeft = timeLimit;
  
  if (pollTimer) {
    clearInterval(pollTimer);
  }
  
  pollTimer = setInterval(() => {
    timeLeft--;
    io.emit('time_update', timeLeft);
    
    if (timeLeft <= 0) {
      endPoll();
    }
  }, 1000);
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Handle user joining
  socket.on('join', (data) => {
    const { role, name } = data;
    
    if (role === 'teacher') {
      teachers.set(socket.id, socket.id);
      socket.join('teachers');
      
      // Send current poll state to teacher
      socket.emit('poll_state', {
        currentPoll,
        students: Array.from(students.values()).map(s => ({
          name: s.name,
          answered: s.answered
        })),
        pollHistory: pollHistory.slice(-10) // Last 10 polls
      });
      
      console.log('Teacher joined:', socket.id);
    } else if (role === 'student' && name) {
      students.set(socket.id, {
        name,
        socketId: socket.id,
        answered: false
      });
      socket.join('students');
      
      // Send current question if active
      if (currentPoll) {
        socket.emit('new_question', currentPoll);
      }
      
      // Update teachers about new student
      socket.to('teachers').emit('student_joined', {
        name,
        totalStudents: students.size
      });
      
      console.log('Student joined:', name, socket.id);
    }
  });
  
  // Handle new poll creation from teacher
  socket.on('create_poll', (pollData) => {
    if (!teachers.has(socket.id)) {
      socket.emit('error', { message: 'Only teachers can create polls' });
      return;
    }
    
    // Check if previous poll is complete
    if (currentPoll && !checkAllStudentsAnswered()) {
      socket.emit('error', { message: 'Previous poll is still active' });
      return;
    }
    
    // Create new poll
    currentPoll = {
      id: Date.now(),
      question: pollData.question,
      options: pollData.options,
      timeLimit: pollData.timeLimit || 60,
      createdAt: new Date(),
      questionNumber: pollHistory.length + 1
    };
    
    // Reset answers and student states
    answers.clear();
    students.forEach(student => {
      student.answered = false;
    });
    
    // Start timer
    startPollTimer(currentPoll.timeLimit);
    
    // Emit to all students
    io.to('students').emit('new_question', currentPoll);
    
    // Notify teachers
    socket.to('teachers').emit('poll_created', currentPoll);
    
    console.log('New poll created:', currentPoll.question);
  });
  
  // Handle answer submission from student
  socket.on('submit_answer', (data) => {
    const student = students.get(socket.id);
    
    if (!student) {
      socket.emit('error', { message: 'Student not found' });
      return;
    }
    
    if (!currentPoll) {
      socket.emit('error', { message: 'No active poll' });
      return;
    }
    
    if (student.answered) {
      socket.emit('error', { message: 'Answer already submitted' });
      return;
    }
    
    // Validate answer option
    if (!currentPoll.options.includes(data.answer)) {
      socket.emit('error', { message: 'Invalid answer option' });
      return;
    }
    
    // Store answer
    answers.set(student.name, data.answer);
    student.answered = true;
    
    // Generate and send updated results
    const results = generatePollResults();
    io.emit('poll_results', results);
    
    // Notify teachers about answer submission
    socket.to('teachers').emit('answer_submitted', {
      studentName: student.name,
      answer: data.answer,
      totalAnswered: answers.size,
      totalStudents: students.size
    });
    
    // Check if all students answered
    if (checkAllStudentsAnswered()) {
      setTimeout(() => endPoll(), 1000); // Small delay to ensure UI updates
    }
    
    console.log('Answer submitted:', student.name, data.answer);
  });
  
  // Handle teacher requesting current results
  socket.on('get_results', () => {
    if (teachers.has(socket.id)) {
      const results = generatePollResults();
      socket.emit('poll_results', results);
    }
  });
  
  // Handle teacher ending poll early
  socket.on('end_poll', () => {
    if (teachers.has(socket.id) && currentPoll) {
      endPoll();
    }
  });
  
  // Handle teacher removing student
  socket.on('remove_student', (studentName) => {
    if (!teachers.has(socket.id)) return;
    
    // Find and remove student
    for (let [socketId, student] of students.entries()) {
      if (student.name === studentName) {
        students.delete(socketId);
        answers.delete(studentName);
        
        // Disconnect the student
        const studentSocket = io.sockets.sockets.get(socketId);
        if (studentSocket) {
          studentSocket.emit('removed_by_teacher');
          studentSocket.disconnect();
        }
        
        // Update results if poll is active
        if (currentPoll) {
          const results = generatePollResults();
          io.emit('poll_results', results);
        }
        
        // Notify teachers
        socket.to('teachers').emit('student_removed', {
          studentName,
          totalStudents: students.size
        });
        
        break;
      }
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove from teachers
    if (teachers.has(socket.id)) {
      teachers.delete(socket.id);
      console.log('Teacher disconnected:', socket.id);
    }
    
    // Remove from students
    const student = students.get(socket.id);
    if (student) {
      students.delete(socket.id);
      answers.delete(student.name);
      
      // Notify teachers
      io.to('teachers').emit('student_left', {
        studentName: student.name,
        totalStudents: students.size
      });
      
      // Update results if poll is active
      if (currentPoll) {
        const results = generatePollResults();
        io.emit('poll_results', results);
        
        // Check if all remaining students answered
        if (checkAllStudentsAnswered()) {
          setTimeout(() => endPoll(), 1000);
        }
      }
      
      console.log('Student disconnected:', student.name);
    }
  });
});

// REST API endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    activeStudents: students.size,
    activeTeachers: teachers.size,
    currentPoll: currentPoll ? currentPoll.question : null
  });
});

app.get('/api/poll/history', (req, res) => {
  res.json(pollHistory.slice(-20)); // Last 20 polls
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});