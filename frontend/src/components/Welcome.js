import React, { useState } from 'react';

const Welcome = ({ onRoleSelect }) => {
  const [selectedRole, setSelectedRole] = useState('student');

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole && onRoleSelect) {
      onRoleSelect(selectedRole);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-r from-[#7765DA] to-[#5767D0] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5z"/>
            </svg>
            <span>Intervue Poll</span>
          </div>
        </div>

        <div className="text-center mb-16">
          <h1 className="text-5xl text-[#373737] mb-6">
            <span className="font-semibold">Welcome to the </span>
            <span className="font-bold">Live Polling System</span>
          </h1>
          <p className="text-[#6E6E6E] text-xl leading-relaxed">
            Please select the role that best describes you to begin using the live polling<br />
            system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-5xl mx-auto">
          <div 
            onClick={() => handleRoleSelect('student')}
            className={`bg-white rounded-2xl border-2 p-12 cursor-pointer transition-all duration-200 ${
              selectedRole === 'student' 
                ? 'border-[#7765DA]' 
                : 'border-[#E5E5E5] hover:border-[#7765DA]'
            }`}
          >
            <h3 className="text-2xl font-bold text-[#373737] mb-4">
              I'm a Student
            </h3>
            <p className="text-[#6E6E6E] text-base leading-relaxed">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry
            </p>
          </div>

          <div 
            onClick={() => handleRoleSelect('teacher')}
            className={`bg-white rounded-2xl border-2 p-12 cursor-pointer transition-all duration-200 ${
              selectedRole === 'teacher' 
                ? 'border-[#7765DA]' 
                : 'border-[#E5E5E5] hover:border-[#7765DA]'
            }`}
          >
            <h3 className="text-2xl font-bold text-[#373737] mb-4">
              I'm a Teacher
            </h3>
            <p className="text-[#6E6E6E] text-base leading-relaxed">
              Submit answers and view live poll results in real-time.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className="px-16 py-4 rounded-full text-white font-semibold text-lg bg-gradient-to-r from-[#7765DA] via-[#5767D0] to-[#4F0DCE] hover:from-[#6654C9] hover:via-[#4656BF] hover:to-[#3E0CBD] cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;