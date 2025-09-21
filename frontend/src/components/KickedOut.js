import React from 'react';

const KickedOut = ({ onRetry }) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">

        <div className="flex justify-center mb-12">
          <div className="bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] text-white px-6 py-3 rounded-full text-base font-medium flex items-center space-x-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5z"/>
            </svg>
            <span>Intervue Poll</span>
          </div>
        </div>

        <div className="mb-12 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-8">
            You've been Kicked out !
          </h1>
          <p className="text-[#6E6E6E] text-xl md:text-2xl leading-relaxed px-4">
            Looks like the teacher had removed you from the poll system. Please
            Try again sometime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KickedOut;