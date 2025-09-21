import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const StudentDashboard = ({ studentName, onQuestionReceived, onBack }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showChat, setShowChat] = useState(false);
const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('join', { role: 'student', name: studentName });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('participants_update', (participantsList) => {
  setParticipants(participantsList);
});

    newSocket.on('new_question', (questionData) => {
      if (onQuestionReceived) {
        onQuestionReceived();
      }
    });

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
        <div className="mb-12">
          <div className="bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5z"/>
            </svg>
            <span>Intervue Poll</span>
          </div>
        </div>

        <div className="mb-12">
          <div className="w-16 h-16 border-4 border-[#E5E5E5] border-t-[#500ECE] rounded-full animate-spin"></div>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-bold text-black mb-4">
            Wait for the teacher to ask questions..
          </h1>
          <p className="text-[#6E6E6E] text-lg">
            Welcome, {studentName}!
          </p>
        </div>

        <div className="fixed bottom-8 right-8">
          <button 
            onClick={() => setShowChat(!showChat)}
            className="w-14 h-14 bg-gradient-to-r from-[#7765DA] to-[#5767D0] rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v3c0 .6.4 1 1 1 .2 0 .5-.1.7-.3L14.6 18H20c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
          </button>
        </div>

        {showChat && (
          <div className="fixed bottom-24 right-6 w-80 bg-white rounded-xl border shadow-lg p-4" style={{ borderColor: '#F2F2F2' }}>

            <div className="flex border-b mb-4" style={{ borderColor: '#E5E5E5' }}>
              <button className="px-4 py-2 text-sm text-gray-500 border-b-2 border-transparent">
                Chat
              </button>
              <button className="px-4 py-2 text-sm font-semibold text-black border-b-2 border-purple-500">
                Participants
              </button>
            </div>

            <div>
              <div className="mb-3">
                <span className="text-sm font-medium text-gray-600">Name</span>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {participants.length > 0 ? (
                  participants.map((participant, index) => (
                    <div key={index} className="py-1">
                      <span className="text-sm font-medium text-black">{participant}</span>
                    </div>
                  ))
                ) : (
                  <div className="py-2">
                    <span className="text-sm text-gray-500">No participants yet</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;