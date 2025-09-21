import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const TeacherDashboard = ({ onBack }) => {
  const [socket, setSocket] = useState(null);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [correctAnswers, setCorrectAnswers] = useState([true, false]); 
  const [timeLimit, setTimeLimit] = useState(60);
  const [currentPoll, setCurrentPoll] = useState(null);
  const [students, setStudents] = useState([]);
  const [pollResults, setPollResults] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [pollHistory, setPollHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [showActivePoll, setShowActivePoll] = useState(false);
  
  const currentPollQuestionRef = useRef('');

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('join', { role: 'teacher' });

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
  console.log('Received poll results:', results); // Debug log
  setPollResults(results);
  setShowResults(true);
});

    newSocket.on('poll_completed', (results) => {
  console.log('Poll completed with results:', results); // Debug log
  setPollResults(results);
  setShowResults(true);
  setShowActivePoll(false); // Hide active poll, show results
  setTimeLeft(0);
  setCurrentPoll(null);
  currentPollQuestionRef.current = '';
});

    newSocket.on('time_update', (time) => {
      setTimeLeft(time);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (pollResults.length > 0 && currentPollQuestionRef.current && showResults) {
      setPollHistory(prev => {
        const exists = prev.some(poll => 
          poll.question === currentPollQuestionRef.current && 
          poll.results.length === pollResults.length
        );
        
        if (!exists) {
          return [...prev, {
            id: Date.now(),
            question: currentPollQuestionRef.current,
            results: pollResults,
            endedAt: new Date()
          }];
        }
        return prev;
      });
    }
  }, [pollResults, showResults]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCorrectAnswerChange = (index, isCorrect) => {
    const newCorrectAnswers = [...correctAnswers];
    newCorrectAnswers[index] = isCorrect;
    setCorrectAnswers(newCorrectAnswers);
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
      setCorrectAnswers([...correctAnswers, false]); 
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
      setCorrectAnswers(correctAnswers.filter((_, i) => i !== index));
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
    const pollData = {
      question: question.trim(),
      options: validOptions,
      timeLimit: timeLimit
    };
    
    currentPollQuestionRef.current = question.trim();
    
    socket.emit('create_poll', pollData);
    
    setCurrentPoll(pollData);
    setTimeLeft(timeLimit);
    setShowResults(false);
    setShowActivePoll(true); // Show the active poll view
    setPollResults([]);
  }
};

  const canCreateNewPoll = !currentPoll || (currentPoll && students.every(s => s.answered));

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" 
               style={{ borderColor: '#7765DA' }}></div>
          <p style={{ color: '#6E6E6E' }}>Connecting to server...</p>
        </div>
      </div>
    );
  }

  const ResultsChart = ({ results, question }) => (
    <div className="bg-white rounded-lg border mb-6" style={{ borderColor: '#F2F2F2' }}>
      <div className="bg-gray-600 text-white p-4 rounded-t-lg">
        <h3 className="font-medium">{question}</h3>
      </div>
      
      <div className="p-6 space-y-4">
        {results.map((result, index) => {
          const percentage = results.reduce((sum, r) => sum + r.count, 0) > 0 
            ? (result.count / results.reduce((sum, r) => sum + r.count, 0)) * 100 
            : 0;
          
          return (
            <div key={index} className="relative rounded-lg border overflow-hidden" style={{ borderColor: '#F2F2F2', height: '60px' }}>
              <div 
                className="absolute left-0 top-0 h-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${percentage}%`,
                  background: 'linear-gradient(135deg, #7765DA 0%, #4F0DCE 100%)'
                }}
              ></div>
              
              <div className="relative z-10 flex items-center justify-between h-full px-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-sm font-bold"
                       style={{ color: '#7765DA' }}>
                    {index + 1}
                  </div>
                  <span className="font-medium text-white">
                    {result.option}
                  </span>
                </div>
                <span className="font-bold text-lg text-white">
                  {percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b" style={{ borderColor: '#F2F2F2' }}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white" 
                   style={{ background: 'linear-gradient(135deg, #7765DA 0%, #4F0DCE 100%)' }}>
                <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                Interval Poll
              </div>
            </div>
            {(showResults || showHistory) && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-full font-medium"
                style={{ background: 'linear-gradient(135deg, #7765DA 0%, #4F0DCE 100%)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
                View Poll history
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {showHistory && (
          <div>
            <h1 className="text-3xl font-bold mb-8" style={{ color: '#373737' }}>
              View Poll History
            </h1>
            
            <div className="space-y-8">
              {pollHistory.map((poll, index) => (
                <div key={poll.id}>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#373737' }}>
                    Question {index + 1}
                  </h2>
                  
                  <div className="bg-white rounded-lg border-2" style={{ borderColor: '#7765DA' }}>
                    <div className="bg-gradient-to-r from-gray-800 to-gray-600 text-white p-4 rounded-t-lg">
                      <h3 className="font-medium">{poll.question}</h3>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      {poll.results.map((result, resultIndex) => {
                        const percentage = poll.results.reduce((sum, r) => sum + r.count, 0) > 0 
                          ? (result.count / poll.results.reduce((sum, r) => sum + r.count, 0)) * 100 
                          : 0;
                        
                        return (
                          <div key={resultIndex} className="relative rounded-lg border overflow-hidden" style={{ borderColor: '#F2F2F2', height: '60px' }}>
                            <div 
                              className="absolute left-0 top-0 h-full transition-all duration-1000 ease-out"
                              style={{ 
                                width: `${percentage}%`,
                                background: 'linear-gradient(135deg, #7765DA 0%, #4F0DCE 100%)'
                              }}
                            ></div>
                            
                            <div className="relative z-10 flex items-center justify-between h-full px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-sm font-bold"
                                     style={{ color: '#7765DA' }}>
                                  {resultIndex + 1}
                                </div>
                                <span className={`font-medium ${percentage > 0 ? 'text-white' : ''}`}
                                      style={{ color: percentage > 0 ? 'white' : '#7765DA' }}>
                                  {result.option}
                                </span>
                              </div>
                              <span className={`font-bold text-lg ${percentage > 0 ? 'text-white' : ''}`}
                                    style={{ color: percentage > 0 ? 'white' : '#7765DA' }}>
                                {percentage.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!currentPoll && !showResults && !showHistory && (
          <div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-3" style={{ color: '#373737' }}>
                Let's Get Started
              </h1>
              <p style={{ color: '#6E6E6E' }}>
                you'll have the ability to create and manage polls, ask questions, and monitor 
                your students' responses in real-time.
              </p>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <label className="text-lg font-semibold" style={{ color: '#373737' }}>
                  Enter your question
                </label>
                <select
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className="px-4 py-2 border rounded-lg"
                  style={{ borderColor: '#F2F2F2', color: '#373737', backgroundColor: 'white' }}
                >
                  <option value={10}>10 seconds</option>
                  <option value={20}>20 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>60 seconds</option>
                </select>
              </div>
              
              <div className="relative">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your question here..."
                  className="w-full p-4 border-0 rounded-xl resize-none focus:outline-none"
                  style={{ 
                    backgroundColor: '#F2F2F2',
                    color: '#373737'
                  }}
                  rows={4}
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  <span className="text-sm px-3 py-1 rounded-full text-white"
                        style={{ backgroundColor: '#6E6E6E' }}>
                    {question.length}/100
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#373737' }}>
                  Edit Options
                </h3>
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                           style={{ background: 'linear-gradient(135deg, #7765DA 0%, #4F0DCE 100%)' }}>
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1 p-3 border-0 rounded-lg focus:outline-none"
                        style={{ 
                          backgroundColor: '#F2F2F2',
                          color: '#373737'
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                      {options.length > 2 && (
                        <button
                          onClick={() => removeOption(index)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 text-xl"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {options.length < 6 && (
                  <button
                    onClick={addOption}
                    className="mt-4 px-4 py-2 text-sm font-medium border rounded-lg"
                    style={{ 
                      color: '#7765DA',
                      borderColor: '#7765DA',
                      backgroundColor: 'white'
                    }}
                  >
                    + Add More option
                  </button>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#373737' }}>
                  Is it Correct?
                </h3>
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center justify-between h-12">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                               style={{ borderColor: correctAnswers[index] === true ? '#7765DA' : '#6E6E6E' }}>
                            {correctAnswers[index] === true && (
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#7765DA' }}></div>
                            )}
                          </div>
                          <span style={{ color: '#373737' }}>Yes</span>
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            checked={correctAnswers[index] === true}
                            onChange={() => handleCorrectAnswerChange(index, true)}
                            className="hidden"
                          />
                        </label>
                        
                        <label className="flex items-center gap-2 cursor-pointer">
                          <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                               style={{ borderColor: correctAnswers[index] === false ? '#7765DA' : '#6E6E6E' }}>
                            {correctAnswers[index] === false && (
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#7765DA' }}></div>
                            )}
                          </div>
                          <span style={{ color: '#373737' }}>No</span>
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            checked={correctAnswers[index] === false}
                            onChange={() => handleCorrectAnswerChange(index, false)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleCreatePoll}
                disabled={!canCreateNewPoll}
                className="px-8 py-3 text-white font-semibold rounded-full transition-all"
                style={{ 
                  background: canCreateNewPoll 
                    ? 'linear-gradient(135deg, #7765DA 0%, #4F0DCE 100%)' 
                    : '#6E6E6E'
                }}
              >
                Ask Question
              </button>
            </div>
          </div>
        )}

        {/* Active Poll Display - Show question while poll is running */}
{showActivePoll && currentPoll && !showResults && !showHistory && (
  <div>
    <h1 className="text-3xl font-bold mb-8" style={{ color: '#373737' }}>
      Active Poll - Time Remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
    </h1>
    
    <div className="bg-white rounded-lg border-2 mb-6" style={{ borderColor: '#7765DA' }}>
      <div className="bg-gradient-to-r from-gray-800 to-gray-600 text-white p-4 rounded-t-lg">
        <h3 className="font-medium">{currentPoll.question}</h3>
      </div>
      
      <div className="p-6 space-y-4">
        {currentPoll.options.map((option, index) => (
          <div key={index} className="flex items-center p-4 border rounded-lg" style={{ borderColor: '#F2F2F2', height: '60px' }}>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-white border-2 flex items-center justify-center text-sm font-bold"
                   style={{ color: '#7765DA', borderColor: '#7765DA' }}>
                {index + 1}
              </div>
              <span className="font-medium" style={{ color: '#373737' }}>
                {option}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

        {showResults && !showHistory && pollResults.length > 0 && (
          <div>
            <h1 className="text-3xl font-bold mb-8" style={{ color: '#373737' }}>
              Question
            </h1>
            
            <div className="bg-white rounded-lg border-2 mb-6" style={{ borderColor: '#7765DA' }}>
              <div className="bg-gradient-to-r from-gray-800 to-gray-600 text-white p-4 rounded-t-lg">
                <h3 className="font-medium">{question || currentPoll?.question}</h3>
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
          background: 'linear-gradient(135deg, #7765DA 0%, #4F0DCE 100%)'
        }}
      ></div>
      
      <div className="relative z-10 flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-sm font-bold"
               style={{ color: '#7765DA' }}>
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
            
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowResults(false);
                  setCurrentPoll(null);
                  setQuestion('');
                  setOptions(['', '']);
                }}
                className="px-8 py-4 text-white font-semibold rounded-full"
                style={{ background: 'linear-gradient(135deg, #7765DA 0%, #4F0DCE 100%)' }}
              >
                + Ask a new question
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg"
        style={{ background: 'linear-gradient(135deg, #7765DA 0%, #4F0DCE 100%)' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v3c0 .6.4 1 1 1 .2 0 .5-.1.7-.3L14.6 18H20c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
      </button>

      {showChat && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-xl border shadow-lg p-6" style={{ borderColor: '#F2F2F2' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold" style={{ color: '#373737' }}>Participants</h3>
            <span className="text-sm" style={{ color: '#6E6E6E' }}>
              {students.length} users
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold" style={{ color: '#373737' }}>Name</span>
              <span className="font-semibold" style={{ color: '#373737' }}>Action</span>
            </div>
            
            {students.map((student, index) => (
              <div key={index} className="flex justify-between items-center py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                       style={{ background: 'linear-gradient(135deg, #7765DA 0%, #4F0DCE 100%)' }}>
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ color: '#373737' }}>{student.name}</span>
                </div>
                <button 
                  className="text-sm font-medium"
                  style={{ color: '#7765DA' }}
                  onClick={() => {
                    if (socket) {
                      socket.emit('remove_student', student.name);
                    }
                  }}
                >
                  Kick out
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;