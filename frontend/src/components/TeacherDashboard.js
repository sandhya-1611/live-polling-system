import React, { useState } from 'react';

const TeacherDashboard = () => {
  const [question, setQuestion] = useState('');
  const [timeLimit, setTimeLimit] = useState('60 seconds');
  const [options, setOptions] = useState([
    { id: 1, text: 'Rahul Bajaj', isCorrect: true },
    { id: 2, text: 'Rahul Bajaj', isCorrect: false }
  ]);
  const [nextId, setNextId] = useState(3);

  const handleAddOption = () => {
    setOptions([...options, { id: nextId, text: '', isCorrect: false }]);
    setNextId(nextId + 1);
  };

  const handleOptionChange = (id, newText) => {
    setOptions(options.map(option => 
      option.id === id ? { ...option, text: newText } : option
    ));
  };

  const handleCorrectChange = (id) => {
    setOptions(options.map(option => 
      option.id === id ? { ...option, isCorrect: !option.isCorrect } : option
    ));
  };

  const handleAskQuestion = () => {
    console.log('Asking question:', { question, timeLimit, options });
    alert('Poll created successfully!');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F2F2F2' }}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-lg mb-6" style={{
            backgroundColor: '#7765DA'
          }}>
            <div className="w-5 h-5 mr-2">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="white"/>
                <path d="M19 15L19.68 17.32L22 18L19.68 18.68L19 21L18.32 18.68L16 18L18.32 17.32L19 15Z" fill="white"/>
                <path d="M5 15L5.68 17.32L8 18L5.68 18.68L5 21L4.32 18.68L2 18L4.32 17.32L5 15Z" fill="white"/>
              </svg>
            </div>
            <span className="text-white font-medium">Intervue Poll</span>
          </div>
          
          <h1 className="text-3xl font-bold mb-4" style={{ color: '#373737' }}>
            Let's Get Started
          </h1>
          
          <p className="text-base" style={{ color: '#6E6E6E' }}>
            You'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
          </p>
        </div>

        {/* Question Input Box */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border-2" style={{ borderColor: '#7765DA' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#E5E7EB' }}>
              <span className="font-medium" style={{ color: '#373737' }}>
                Enter your question
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: '#6E6E6E' }}>{timeLimit}</span>
                <select 
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className="text-sm border-none outline-none"
                  style={{ color: '#6E6E6E', backgroundColor: 'transparent' }}
                >
                  <option>30 seconds</option>
                  <option>60 seconds</option>
                  <option>90 seconds</option>
                  <option>2 minutes</option>
                </select>
                <svg className="w-4 h-4" fill="none" stroke="#6E6E6E" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* Question Input */}
            <div className="p-4">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question here..."
                className="w-full h-24 border-none outline-none resize-none text-base"
                style={{ color: '#373737' }}
              />
              <div className="flex justify-end mt-2">
                <span className="text-sm" style={{ color: '#6E6E6E' }}>
                  {question.length}/100
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Options Section */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Edit Options */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#373737' }}>
              Edit Options
            </h3>
            
            <div className="space-y-4 mb-6">
              {options.map((option, index) => (
                <div key={option.id} className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: '#7765DA' }}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(option.id, e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg outline-none"
                    style={{ 
                      borderColor: '#E5E7EB',
                      color: '#373737'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#7765DA'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleAddOption}
              className="px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
              style={{ 
                borderColor: '#7765DA',
                color: '#7765DA',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#7765DA';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#7765DA';
              }}
            >
              + Add More option
            </button>
          </div>

          {/* Is It Correct */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#373737' }}>
              Is It Correct?
            </h3>
            
            <div className="space-y-4">
              {options.map((option, index) => (
                <div key={option.id} className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id={`yes-${option.id}`}
                      name={`correct-${option.id}`}
                      checked={option.isCorrect}
                      onChange={() => handleCorrectChange(option.id)}
                      className="w-4 h-4"
                      style={{ accentColor: '#7765DA' }}
                    />
                    <label htmlFor={`yes-${option.id}`} className="text-sm" style={{ color: '#373737' }}>
                      Yes
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id={`no-${option.id}`}
                      name={`correct-${option.id}`}
                      checked={!option.isCorrect}
                      onChange={() => handleCorrectChange(option.id)}
                      className="w-4 h-4"
                      style={{ accentColor: '#6E6E6E' }}
                    />
                    <label htmlFor={`no-${option.id}`} className="text-sm" style={{ color: '#373737' }}>
                      No
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ask Question Button */}
        <div className="flex justify-end mt-8">
          <button
            onClick={handleAskQuestion}
            disabled={!question.trim() || options.every(opt => !opt.text.trim())}
            className="px-8 py-3 rounded-full text-white font-semibold text-base transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: '#7765DA',
              boxShadow: '0 4px 15px rgba(119, 101, 218, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!e.target.disabled) {
                e.target.style.backgroundColor = '#5767D0';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.target.disabled) {
                e.target.style.backgroundColor = '#7765DA';
              }
            }}
          >
            Ask Question
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;