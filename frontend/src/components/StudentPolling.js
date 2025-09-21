import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const StudentPolling = ({ studentName, onQuestionEnded, onBack, onKickedOut }) => {
  const [socket, setSocket] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [pollResults, setPollResults] = useState([]);
  const [isConnected, setIsConnected] = useState(true);
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

    newSocket.on('new_question', (questionData) => {
      setCurrentQuestion(questionData);
      setHasAnswered(false);
      setSelectedAnswer('');
      setTimeLeft(questionData.timeLimit || 60);
      setShowResults(false);
      setPollResults([]);
    });

    newSocket.on('poll_results', (results) => {
      console.log('Received poll results:', results); 
      setPollResults(results);
      setShowResults(true);
    });

        newSocket.on('time_update', (time) => {
          setTimeLeft(time);
        });

    newSocket.on('student_kicked', (data) => {
      console.log('Student has been kicked out');
      sessionStorage.removeItem('studentName');
      if (onKickedOut) {
        onKickedOut();
      }
    });

    newSocket.on('poll_ended', (results) => {
    console.log('Poll completed with results:', results); 
    setPollResults(results);
    setShowResults(true);
      setCurrentQuestion(null);
      
      setTimeout(() => {
        if (onQuestionEnded) {
          onQuestionEnded();
        }
      }, 5000);
    });

    newSocket.on('participants_update', (participantsList) => {
  setParticipants(participantsList);
});

    return () => {
      newSocket.disconnect();
    };
  }, [studentName]);

  const handleAnswerSubmit = () => {
    if (selectedAnswer && socket) {
      socket.emit('submit_answer', {
        studentName,
        answer: selectedAnswer,
        questionId: currentQuestion.id
      });
      setHasAnswered(true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
      <div className="max-w-2xl mx-auto px-8 py-12 flex flex-col justify-center min-h-screen">
        {!currentQuestion && !showResults && (
          <div className="flex flex-col items-center justify-center">
            <div className="mb-12">
              <div className="bg-gradient-to-r from-[#7765DA] to-[#5767D0] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5z"/>
                </svg>
                <span>Intervue Poll</span>
              </div>
            </div>

            <div className="mb-12">
              <div className="w-16 h-16 border-4 border-[#E5E5E5] border-t-[#7765DA] rounded-full animate-spin"></div>
            </div>

            <div className="text-center">
              <h1 className="text-4xl font-bold text-black mb-4">
                Wait for the teacher to ask questions..
              </h1>
            </div>

            <div className="fixed bottom-8 right-8">
            <button 
              onClick={() => setShowChat(!showChat)}
              className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg"
        style={{ background: 'linear-gradient(135deg,  #5A66D1 100%)' }}
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
        )}

        {currentQuestion && !showResults && (
          <div className="max-w-2xl mx-auto w-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-black">
                  Question {currentQuestion.questionNumber || 1}
                </h2>
                <div className="flex items-center gap-2 text-red-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C10.343 2 9 3.343 9 5v1.05C6.715 6.686 5 8.771 5 11.25c0 3.45 2.8 6.25 6.25 6.25s6.25-2.8 6.25-6.25c0-2.479-1.715-4.564-4-5.2V5c0-1.657-1.343-3-3-3zm0 2c.552 0 1 .448 1 1v1.32a.5.5 0 00.352.479c1.724.517 2.898 2.089 2.898 3.95 0 2.345-1.905 4.25-4.25 4.25s-4.25-1.905-4.25-4.25c0-1.861 1.174-3.433 2.898-3.95a.5.5 0 00.352-.479V5c0-.552.448-1 1-1z"/>
                    <circle cx="12" cy="11.25" r="1.25"/>
                  </svg>
                  <span className="font-medium">{formatTime(timeLeft)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-xl overflow-hidden mb-8" style={{ borderColor: '#B8A5E8' }}>
              <div className="bg-gradient-to-r from-[#343434] to-[#6E6E6E] px-6 py-4">
                <h3 className="text-white font-medium text-lg">
                  {currentQuestion.question}
                </h3>
              </div>

              <div className="p-6 space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedAnswer === option
                        ? 'border-[#8F64E1] bg-[#7765DA]/5'
                        : 'border-[#F2F2F2] hover:border-[#7765DA] bg-[#F5F5F5]'
                    } ${hasAnswered ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{ height: '60px', borderColor: selectedAnswer === option ? '#7765DA' : '#F2F2F2' }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                           style={{ 
                             background: selectedAnswer === option 
                               ? 'linear-gradient(135deg, #8F64E1 0%, #4E377B 100%)' 
                               : '#6E6E6E',
                             color: 'white'
                           }}>
                        {index + 1}
                      </div>
                      <span 
                        className="font-medium text-lg"
                        style={{ color: selectedAnswer === option ? '#000000' : '#6E6E6E' }}
                      >
                        {option}
                      </span>
                    </div>
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={selectedAnswer === option}
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                      disabled={hasAnswered}
                      className="sr-only"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAnswerSubmit}
                disabled={!selectedAnswer || hasAnswered}
                className={`px-12 py-4 rounded-full font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl ${
                  !selectedAnswer || hasAnswered
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#7765DA] to-[#5767D0]  hover:from-[#6654C9] hover:to-[#4656BF]'
                }`}
              >
                {hasAnswered ? 'Answer Submitted' : 'Submit'}
              </button>
            </div>

            <div className="fixed bottom-8 right-8">
            <button 
              onClick={() => setShowChat(!showChat)}
              className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg"
        style={{ background: 'linear-gradient(135deg,  #5A66D1 100%)' }}
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
        )}

    {showResults && pollResults.length > 0 && (
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-black">
              Question 1
            </h2>
            <div className="flex items-center gap-2 text-black-800">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C10.343 2 9 3.343 9 5v1.05C6.715 6.686 5 8.771 5 11.25c0 3.45 2.8 6.25 6.25 6.25s6.25-2.8 6.25-6.25c0-2.479-1.715-4.564-4-5.2V5c0-1.657-1.343-3-3-3zm0 2c.552 0 1 .448 1 1v1.32a.5.5 0 00.352.479c1.724.517 2.898 2.089 2.898 3.95 0 2.345-1.905 4.25-4.25 4.25s-4.25-1.905-4.25-4.25c0-1.861 1.174-3.433 2.898-3.95a.5.5 0 00.352-.479V5c0-.552.448-1 1-1z"/>
                <circle cx="12" cy="11.25" r="1.25"/>
              </svg>
              <span className="font-medium text-red-500">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

    <div className="bg-white rounded-lg border-2 mb-6" style={{ borderColor: '#7765DA' }}>
      <div className="bg-gradient-to-r from-[#343434] to-[#6E6E6E] text-white p-4 rounded-t-lg">
        <h3 className="font-medium">{currentQuestion?.question}</h3>
      </div>
      
      <div className="p-6 space-y-4">
        {pollResults.map((result, index) => {
        const totalVotes = pollResults.reduce((sum, r) => sum + (r.count || 0), 0);
        const count = result.count || 0;
        const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
        
        return (
          <div key={index} className="relative rounded-lg border overflow-hidden" style={{ borderColor: '#F2F2F2', height: '60px' }}>
            <div 
              className="absolute left-0 top-0 h-full transition-all duration-1000 ease-out"
              style={{ 
                width: `${percentage}%`,
                background: 'linear-gradient(135deg,  #6766D5 100%)'
              }}
            ></div>
            
            <div className="relative z-10 flex items-center justify-between h-full px-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-sm font-bold"
                    style={{ color: '#8F64E1' }}>
                  {index + 1}
                </div>
                <span className="font-medium" style={{ color: percentage > 0 ? 'white' : '#7765DA' }}>
                  {result.option}
                </span>
              </div>
              <span className="font-bold text-lg text-black">
                {percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        );
      })}
      </div>
    </div>

    <div className="text-center">
      <h2 className="text-2xl font-bold text-black">
        Wait for the teacher to ask a new question..
      </h2>
    </div>

    <div className="fixed bottom-8 right-8">
      <button 
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg,  #5A66D1 100%)' }}
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
    )}
      </div>
    </div>
  );
};

export default StudentPolling;