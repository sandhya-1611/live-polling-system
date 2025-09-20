import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const StudentPolling = ({ studentName, onQuestionEnded, onBack }) => {
  const [socket, setSocket] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [pollResults, setPollResults] = useState([]);
  const [isConnected, setIsConnected] = useState(true);

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
      setCurrentQuestion(questionData);
      setHasAnswered(false);
      setSelectedAnswer('');
      setTimeLeft(questionData.timeLimit || 60);
      setShowResults(false);
      setPollResults([]);
    });

    newSocket.on('poll_results', (results) => {
      setPollResults(results);
      setShowResults(true);
    });

    newSocket.on('time_update', (time) => {
      setTimeLeft(time);
    });

    newSocket.on('poll_ended', (results) => {
      setPollResults(results);
      setShowResults(true);
      setCurrentQuestion(null);
      
      // Notify parent component that question ended after showing results briefly
      setTimeout(() => {
        if (onQuestionEnded) {
          onQuestionEnded();
        }
      }, 5000); // Show results for 5 seconds before going back to dashboard
    });

    // Cleanup on unmount
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
        {/* Waiting State */}
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
              <button className="w-14 h-14 bg-gradient-to-r from-[#7765DA] to-[#5767D0] rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Active Question */}
        {currentQuestion && !showResults && (
          <div className="max-w-2xl mx-auto w-full">
            {/* Question Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-4">
                <h2 className="text-xl font-semibold text-black">
                  Question {currentQuestion.questionNumber || 1}
                </h2>
                <div className="flex items-center gap-2 text-red-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{formatTime(timeLeft)}</span>
                </div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden mb-8 shadow-sm">
              {/* Question Header */}
              <div className="bg-[#6E6E6E] px-6 py-4">
                <h3 className="text-white font-medium text-lg">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* Answer Options */}
              <div className="p-6 space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedAnswer === option
                        ? 'border-[#7765DA] bg-[#7765DA]/5'
                        : 'border-gray-200 hover:border-gray-300 bg-[#F5F5F5]'
                    } ${hasAnswered ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswer === option 
                          ? 'border-[#7765DA] bg-[#7765DA]' 
                          : 'border-gray-400 bg-white'
                      }`}>
                        {selectedAnswer === option && (
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className="text-black font-medium text-lg">{option}</span>
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

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                onClick={handleAnswerSubmit}
                disabled={!selectedAnswer || hasAnswered}
                className={`px-12 py-4 rounded-full font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl ${
                  !selectedAnswer || hasAnswered
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#7765DA] via-[#5767D0] to-[#4F0DCE] text-white hover:from-[#6654C9] hover:via-[#4656BF] hover:to-[#3E0CBD]'
                }`}
              >
                {hasAnswered ? 'Answer Submitted' : 'Submit'}
              </button>
            </div>

            {/* Chat Button */}
            <div className="fixed bottom-8 right-8">
              <button className="w-14 h-14 bg-gradient-to-r from-[#7765DA] to-[#5767D0] rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Results Display */}
        {showResults && pollResults.length > 0 && (
          <div className="max-w-2xl mx-auto w-full">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-black mb-6 text-center">Poll Results</h2>
              
              <div className="space-y-6">
                {pollResults.map((result, index) => {
                  const percentage = pollResults.reduce((sum, r) => sum + r.count, 0) > 0 
                    ? (result.count / pollResults.reduce((sum, r) => sum + r.count, 0)) * 100 
                    : 0;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-black text-lg">{result.option}</span>
                        <span className="text-[#6E6E6E] font-medium">
                          {result.count} votes ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-gradient-to-r from-[#7765DA] to-[#5767D0] h-4 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t-2 border-gray-200">
                <p className="text-[#6E6E6E] text-center font-medium">
                  Total responses: {pollResults.reduce((sum, r) => sum + r.count, 0)}
                </p>
              </div>
            </div>

            {/* Chat Button */}
            <div className="fixed bottom-8 right-8">
              <button className="w-14 h-14 bg-gradient-to-r from-[#7765DA] to-[#5767D0] rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03-8 9-8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPolling;