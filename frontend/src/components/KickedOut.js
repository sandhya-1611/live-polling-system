import React from 'react';

const KickedOut = ({ onRetry }) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">

        <div className="flex justify-center mb-12">
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