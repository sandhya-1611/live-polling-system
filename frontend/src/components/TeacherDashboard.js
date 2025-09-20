import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const TeacherDashboard = ({ onBack }) => {
  const [socket, setSocket] = useState(null);
  const [question, setQuestion] = useState('Rahul Bajaj');
  const [options, setOptions] = useState(['Rahul Bajaj', 'Rahul Bajaj']);
  const [timeLimit, setTimeLimit] = useState(60);
  const [currentPoll, setCurrentPoll] = useState(null);
  const [students, setStudents] = useState([]);
  const [pollResults, setPollResults] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [pollHistory, setPollHistory] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState([0]);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000');
    setSocket(newSocket);

    // Join as teacher
    newSocket.emit('join', { role: 'teacher' });

    // Socket event listeners
    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('poll_state', (state) => {
      setCurrentPoll(state.currentPoll);
      setStudents(state.students || []);
      setPollHistory(state.pollHistory || []);
    });

    newSocket.on('student_joined', (data) => {
      setStudents(prev => [...prev.filter(s => s.name !== data.name), { name: data.name, answered: false }]);
    });

    newSocket.on('student_left', (data) => {
      setStudents(prev => prev.filter(s => s.name !== data.studentName));
    });

    newSocket.on('answer_submitted', (data) => {
      setStudents(prev => prev.map(s => 
        s.name === data.studentName ? { ...s, answered: true } : s
      ));
    });

    newSocket.on('poll_results', (results) => {
      setPollResults(results);
      setShowResults(true);
    });

    newSocket.on('poll_completed', (results) => {
      setPollResults(results);
      setShowResults(true);
      setCurrentPoll(null);
      setTimeLeft(0);
    });

    newSocket.on('time_update', (time) => {
      setTimeLeft(time);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const toggleCorrectAnswer = (index) => {
    if (correctAnswers.includes(index)) {
      setCorrectAnswers(correctAnswers.filter(i => i !== index));
    } else {
      setCorrectAnswers([...correctAnswers, index]);
    }
  };

  const handleCreatePoll = () => {
    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }

    const validOptions = options.filter(option => option.trim() !== '');
    if (validOptions.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }

    if (socket) {
      socket.emit('create_poll', {
        question: question.trim(),
        options: validOptions,
        timeLimit: timeLimit,
        correctAnswers: correctAnswers
      });
      
      setCurrentPoll({
        question: question.trim(),
        options: validOptions,
        timeLimit: timeLimit
      });
      setTimeLeft(timeLimit);
      setShowResults(false);
      setPollResults([]);
    }
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
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Purple Badge */}
        <div className="mb-8">
          <div className="inline-flex bg-gradient-to-r from-[#7765DA] to-[#5767D0] text-white px-4 py-2 rounded-full text-sm font-medium items-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5z"/>
            </svg>
            <span>Intervue Poll</span>
          </div>
        </div>

        {/* Main Title */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-black mb-6 leading-tight">
            Let's Get Started
          </h1>
          <p className="text-[#6E6E6E] text-xl leading-relaxed">
            you'll have the ability to create and manage polls, ask questions, and monitor<br />
            your students' responses in real-time.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Enter your question */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-black">Enter your question</h2>
                <div className="relative">
                  <select
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    className="appearance-none bg-[#F5F5F5] px-4 py-2 pr-10 rounded-lg text-black border-0 focus:outline-none focus:ring-2 focus:ring-[#7765DA] cursor-pointer"
                  >
                    <option value={30}>30 seconds</option>
                    <option value={60}>60 seconds</option>
                    <option value={120}>2 minutes</option>
                    <option value={300}>5 minutes</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full h-40 p-6 bg-[#F5F5F5] rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-[#7765DA] resize-none text-black text-lg"
                  placeholder="Enter your question here..."
                />
                <div className="absolute bottom-4 right-4 text-sm text-[#999999]">
                  0/100
                </div>
              </div>
            </div>

            {/* Edit Options */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-6">Edit Options</h2>
              <div className="space-y-4">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#7765DA] to-[#5767D0] rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 p-4 bg-[#F5F5F5] rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-[#7765DA] text-black text-lg"
                      placeholder={`Enter option ${index + 1}`}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={addOption}
                className="mt-6 px-6 py-3 border-2 border-[#7765DA] text-[#7765DA] rounded-xl hover:bg-[#7765DA] hover:text-white transition-all duration-200 font-medium text-sm"
              >
                + Add More option
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <h2 className="text-xl font-semibold text-black mb-6">Is it Correct?</h2>
            <div className="space-y-6">
              {options.map((option, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-black font-medium text-lg">
                    {correctAnswers.includes(index) ? 'Yes' : 'No'}
                  </span>
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <div 
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          correctAnswers.includes(index) 
                            ? 'border-[#7765DA] bg-[#7765DA]' 
                            : 'border-[#CCCCCC] bg-white'
                        }`}
                        onClick={() => {
                          if (!correctAnswers.includes(index)) {
                            toggleCorrectAnswer(index);
                          }
                        }}
                      >
                        {correctAnswers.includes(index) && (
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className="text-black font-medium">Yes</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <div 
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          !correctAnswers.includes(index) 
                            ? 'border-[#7765DA] bg-[#7765DA]' 
                            : 'border-[#CCCCCC] bg-white'
                        }`}
                        onClick={() => {
                          if (correctAnswers.includes(index)) {
                            toggleCorrectAnswer(index);
                          }
                        }}
                      >
                        {!correctAnswers.includes(index) && (
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className="text-black font-medium">No</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom section with Ask Question button */}
        <div className="mt-16 flex justify-end">
          <button
            onClick={handleCreatePoll}
            className="px-12 py-4 bg-gradient-to-r from-[#7765DA] via-[#5767D0] to-[#4F0DCE] text-white rounded-full font-semibold text-lg hover:from-[#6654C9] hover:via-[#4656BF] hover:to-[#3E0CBD] transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Ask Question
          </button>
        </div>

        {/* Current Poll Status (if active) */}
        {currentPoll && (
          <div className="mt-12 bg-[#F5F5F5] rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">Current Poll Active</h3>
              <span className="text-[#6E6E6E]">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} remaining
              </span>
            </div>
            <div className="bg-[#E0E0E0] rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-[#7765DA] to-[#5767D0] h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(timeLeft / currentPoll.timeLimit) * 100}%` }}
              ></div>
            </div>
            <p className="text-black font-medium">{currentPoll.question}</p>
            <p className="text-sm text-[#6E6E6E] mt-2">
              Responses: {students.filter(s => s.answered).length} / {students.length}
            </p>
          </div>
        )}

        {/* Poll Results */}
        {showResults && pollResults.length > 0 && (
          <div className="mt-8 bg-[#F5F5F5] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Poll Results</h3>
            <div className="space-y-4">
              {pollResults.map((result, index) => {
                const percentage = pollResults.reduce((sum, r) => sum + r.count, 0) > 0 
                  ? (result.count / pollResults.reduce((sum, r) => sum + r.count, 0)) * 100 
                  : 0;
                
                return (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-black">{result.option}</span>
                      <span className="text-[#6E6E6E]">{result.count} votes ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-[#E0E0E0] rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-[#7765DA] to-[#5767D0] h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;