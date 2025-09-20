import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const WelcomePage = () => {
  const [selectedRole, setSelectedRole] = useState("student");
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole === "teacher") {
      navigate("/teacher");
    } else if (selectedRole === "student") {
      navigate("/student"); // later when you add StudentDashboard
    } else {
      alert("Please select a role!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      background: 'linear-gradient(135deg, #F2F2F2 0%, #E8E8E8 100%)'
    }}>
      <div className="w-full max-w-2xl mx-auto px-6">
        {/* Header with Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-lg mb-6" style={{
            background: 'linear-gradient(135deg, #7765DA 0%, #5767D0 50%, #4F0DCE 100%)'
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
          
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#373737' }}>
            Welcome to the <span style={{ color: '#373737' }}>Live Polling System</span>
          </h1>
          
          <p className="text-lg" style={{ color: '#6E6E6E' }}>
            Please select the role that best describes you to begin using the live polling system
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Student Card */}
          <div 
            className={`flex-1 p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedRole === 'student' 
                ? 'border-2' 
                : 'border border-gray-200 hover:border-gray-300'
            }`}
            style={{
              backgroundColor: 'white',
              borderColor: selectedRole === 'student' ? '#7765DA' : '#E5E7EB'
            }}
            onClick={() => handleRoleSelect('student')}
          >
            <h3 className="text-xl font-semibold mb-3" style={{ color: '#373737' }}>
              I'm a Student
            </h3>
            <p style={{ color: '#6E6E6E' }}>
              Lorem Ipsum is simply dummy text of the printing and typesetting industry
            </p>
          </div>

          {/* Teacher Card */}
          <div 
            className={`flex-1 p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedRole === 'teacher' 
                ? 'border-2' 
                : 'border border-gray-200 hover:border-gray-300'
            }`}
            style={{
              backgroundColor: 'white',
              borderColor: selectedRole === 'teacher' ? '#7765DA' : '#E5E7EB'
            }}
            onClick={() => handleRoleSelect('teacher')}
          >
            <h3 className="text-xl font-semibold mb-3" style={{ color: '#373737' }}>
              I'm a Teacher
            </h3>
            <p style={{ color: '#6E6E6E' }}>
              Submit answers and view live poll results in real-time.
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            className="px-12 py-3 rounded-full text-white font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:transform hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #7765DA 0%, #5767D0 50%, #4F0DCE 100%)',
              boxShadow: '0 4px 15px rgba(119, 101, 218, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #5767D0 0%, #4F0DCE 50%, #7765DA 100%)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #7765DA 0%, #5767D0 50%, #4F0DCE 100%)';
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;