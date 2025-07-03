import React from 'react';

const EnglishGamePage = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="text-8xl mb-8">🪙</div>
        <h1 className="text-5xl font-bold mb-8">නිධානය ග්‍රහලෝකය</h1>
        <p className="text-2xl mb-12">නිධානය ක්‍රීඩා මෙහි නිර්මාණය වනු ඇත</p>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">ක්‍රීඩා ප්‍රදේශය</h2>
          <p className="text-lg mb-6">ක්‍රීඩාව ඉදිරියේදී මෙහි එකතු කරනු ඇත</p>
          
          <button
            onClick={onBack}
            className="bg-white text-blue-600 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors duration-300"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnglishGamePage;