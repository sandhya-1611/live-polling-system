import React, { useState } from 'react';

const StudentNameEntry = ({ onNameSubmit, onBack }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter your name');
      return;
    }
    
    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }
    
    if (trimmedName.length > 20) {
      setError('Name must be less than 20 characters');
      return;
    }
    
   const nameRegex = /^[a-zA-Z0-9\s\-_]+$/;
    if (!nameRegex.test(trimmedName)) {
      setError('Name can only contain letters, numbers, spaces, hyphens, and underscores');
      return;
    }

    setError('');
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onNameSubmit(trimmedName);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    handleSubmit(e);
  }
};

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-8 py-12 flex flex-col justify-center min-h-screen">
        <div className="flex justify-center mb-8">
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

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-black mb-6 leading-tight">
            <span className="font-semibold">Let's </span>
            <span className="font-bold">Get Started</span>
          </h1>
          <p className="text-[#6E6E6E] text-xl leading-relaxed">
            If you're a student, you'll be able to <span className="font-semibold text-black">submit your answers</span>, participate in live<br />
            polls, and see how your responses compare with your classmates
          </p>
        </div>

        <div className="max-w-md mx-auto w-full">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-black mb-4 text-left">Enter your Name</h2>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full p-4 bg-[#F5F5F5] rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-[#7765DA] text-black text-lg text-center"
                placeholder="Enter your name"
                disabled={isLoading}
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-600 text-center">
                  {error}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !name.trim()}
              className={`px-12 py-4 rounded-full text-white font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl ${
                (isLoading || !name.trim())
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#6654C9]  to-[#4656BF] hover:from-[#6654C9] hover:to-[#4656BF]  cursor-pointer'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Joining...
                </div>
              ) : (
                'Continue'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentNameEntry;