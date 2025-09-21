// KickedOut.js
import React from 'react';

const KickedOut = ({ onRetry }) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Purple Badge */}
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-r from-[#7765DA] to-[#5767D0] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5z"/>
            </svg>
            <span>Intervue Poll</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-6">
            You've been Kicked out !
          </h1>
          <p className="text-[#6E6E6E] text-lg leading-relaxed">
            Looks like the teacher had removed you from the poll system .Please<br />
            Try again sometime.
          </p>
        </div>

        {/* Optional Retry Button */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-8 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-[#7765DA] via-[#5767D0] to-[#4F0DCE] hover:from-[#6654C9] hover:via-[#4656BF] hover:to-[#3E0CBD] transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default KickedOut;