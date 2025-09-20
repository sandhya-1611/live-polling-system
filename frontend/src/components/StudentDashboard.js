import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const StudentDashboard = ({ studentName, onQuestionReceived, onBack }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000');
    setSocket(newSocket);

    // Join as student
    newSocket.emit('join', { role: 'student', name: studentName });

    // Socket event listeners
    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('new_question', (questionData) => {
      // Notify parent component that a question was received
      if (onQuestionReceived) {
        onQuestionReceived();
      }
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [studentName, onQuestionReceived]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7765DA] mx-auto mb-4"></div>
          <p className="text-[#6E6E6E]">Connecting to server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col items-center justify-center min-h-screen px-8">
        {/* Purple Badge */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-[#7765DA] to-[#5767D0] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5z"/>
            </svg>
            <span>Intervue Poll</span>
          </div>
        </div>

        {/* Loading Spinner */}
        <div className="mb-12">
          <div className="w-16 h-16 border-4 border-[#E5E5E5] border-t-[#7765DA] rounded-full animate-spin"></div>
        </div>

        {/* Main Message */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-black mb-4">
            Wait for the teacher to ask questions..
          </h1>
          <p className="text-[#6E6E6E] text-lg">
            Welcome, {studentName}!
          </p>
        </div>

        {/* Chat/Support Button - Bottom Right */}
        <div className="fixed bottom-8 right-8">
          <button className="w-14 h-14 bg-gradient-to-r from-[#7765DA] to-[#5767D0] rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;