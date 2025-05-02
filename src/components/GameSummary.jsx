import React from 'react';

const GameSummary = ({ selectedTotalScore, totalScores }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString();
  };

  // Sort players by score, lowest (best) to highest
  const sortedScores = totalScores ? 
    Object.entries(totalScores)
      .sort((a, b) => a[1].total - b[1].total) 
    : [];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Game Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Selected Scores</h3>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <p className="text-gray-600">Top Group:</p>
              <p className="text-2xl font-bold">{selectedTotalScore?.top || 0}</p>
            </div>
            <div>
              <p className="text-gray-600">Bottom Group:</p>
              <p className="text-2xl font-bold">{selectedTotalScore?.bottom || 0}</p>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <p className="text-gray-600">Total Combined Score:</p>
            <p className="text-3xl font-bold text-golf-green">{selectedTotalScore?.total || 0}</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Individual Scores</h3>
          <div className="space-y-2">
            {sortedScores.map(([playerId, data]) => (
              <div key={playerId} className="flex justify-between border-b border-gray-100 pb-1">
                <span>{data.name}:</span>
                <span className="font-bold">{data.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSummary; 