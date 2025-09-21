import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const StudentDashboard = ({ studentName, onQuestionReceived, onBack }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [activeTab, setActiveTab] = useState('participants'); // 'chat' or 'participants'
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

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

    newSocket.on('chat_message', (messageData) => {
    setChatMessages(prev => [...prev, messageData]);
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

  const handleSendMessage = () => {
  if (newMessage.trim() && socket) {
    const messageData = {
      id: Date.now(),
      text: newMessage.trim(),
      sender: studentName,
      timestamp: new Date(),
      senderType: 'student'
    };

    socket.emit('send_chat_message', messageData);
    setNewMessage('');
  }
};

const handleKeyPress = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSendMessage();
  }
};
  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col items-center justify-center min-h-screen px-8">
        <div className="mb-12">
          <div className="bg-gradient-to-r from-[#7765D9] to-[#4D0ACD] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
                     <div className="relative w-4 h-4">
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L14.5 8.5L22 10L14.5 11.5L12 19L9.5 11.5L2 10L9.5 8.5L12 1Z"/>
              
              <path d="M18.5 3L19.2 6.2L22.5 7L19.2 7.8L18.5 11L17.8 7.8L14.5 7L17.8 6.2L18.5 3Z"/>
              
              <path d="M20.5 13L21 15.5L23.5 16L21 16.5L20.5 19L20 16.5L17.5 16L20 15.5L20.5 13Z"/>
            </svg>
          </div>
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
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg"
        style={{ background: 'linear-gradient(135deg,  #5A66D1 100%)' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v3c0 .6.4 1 1 1 .2 0 .5-.1.7-.3L14.6 18H20c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
      </button>
        </div>

        {showChat && (
  <div className="fixed bottom-24 right-6 w-80 bg-white rounded-xl border shadow-lg" style={{ borderColor: '#F2F2F2' }}>
    <div className="flex border-b" style={{ borderColor: '#F2F2F2' }}>
      <button
        onClick={() => setActiveTab('chat')}
        className={`flex-1 px-6 py-4 text-sm font-medium relative ${
          activeTab === 'chat' ? 'text-[#292929]' : 'text-[#292929] font-bold'
        }`}
      >
        Chat
        {activeTab === 'chat' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7765DA]"></div>
        )}
      </button>
      <button
        onClick={() => setActiveTab('participants')}
        className={`flex-1 px-6 py-4 text-sm font-medium relative ${
          activeTab === 'participants' ? 'text-[#292929]' : 'text-[#292929] font-bold'
        }`}
      >
        Participants
        {activeTab === 'participants' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7765DA]"></div>
        )}
      </button>
    </div>

    {activeTab === 'chat' && (
      <div className="flex flex-col h-80">
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {chatMessages.map((message, index) => (
            <div key={message.id} className="flex flex-col">
              <div className={`flex ${message.senderType === 'student' && message.sender === studentName ? 'justify-end' : 'justify-start'}`}>
                <div className="flex flex-col max-w-xs">
                  <span className={`text-xs font-medium mb-1 ${
                    message.senderType === 'student' && message.sender === studentName 
                      ? 'text-right text-[#7765DA]' 
                      : 'text-left text-[#373737]'
                  }`}>
                    {message.sender}
                  </span>
                  <div className={`px-3 py-2 rounded-lg text-sm ${
                    message.senderType === 'student' && message.sender === studentName
                      ? 'bg-[#7765DA] text-white' 
                      : message.senderType === 'teacher'
                      ? 'bg-[#4CAF50] text-white'
                      : 'bg-[#373737] text-white'
                  }`}>
                    {message.text}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {chatMessages.length === 0 && (
            <p className="text-center text-sm text-[#6E6E6E] mt-8">
              No messages yet. Start the conversation!
            </p>
          )}
        </div>

        <div className="p-4 border-t" style={{ borderColor: '#F2F2F2' }}>
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#7765DA]"
              style={{ borderColor: '#F2F2F2' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                newMessage.trim() 
                  ? 'bg-[#7765DA] text-white hover:bg-[#6654C9]' 
                  : 'bg-[#6E6E6E] text-white cursor-not-allowed'
              }`}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    )}

    {activeTab === 'participants' && (
      <div className="p-6">
        
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold" style={{ color: '#6E6E6E' }}>Name</span>
          </div>
          
          {participants.map((participant, index) => (
            <div key={`${participant}-${index}`} className="flex justify-between items-center py-2">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="font-semibold text-md text-gray-700">{participant}</span>
                </div>
              </div>
            </div>
          ))}
          
          {participants.length === 0 && (
            <p className="text-center text-sm" style={{ color: '#6E6E6E' }}>
              No participants connected yet
            </p>
          )}
        </div>
      </div>
    )}
  </div>
)}
      </div>
    </div>
  );
};

export default StudentDashboard;