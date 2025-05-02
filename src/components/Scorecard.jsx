import React, { useState } from 'react';
import { updatePlayerScore, updatePlayerName, updateSelectedScore } from '../lib/dataService';

const Scorecard = ({ gameId, players, group, selectedScores, onRefresh }) => {
  const [editingName, setEditingName] = useState(null);
  const [editingNameValue, setEditingNameValue] = useState('');
  const [editingScore, setEditingScore] = useState(null);
  const [editingScoreValue, setEditingScoreValue] = useState('');

  const holes = Array.from({ length: 18 }, (_, i) => i + 1);
  const scoreOptions = Array.from({ length: 13 }, (_, i) => i); // 0 to 12

  const handleScoreEdit = (playerId, hole, currentValue) => {
    setEditingScore({ playerId, hole });
    setEditingScoreValue(currentValue || '0');
  };

  const handleScoreChange = async (e, playerId, hole) => {
    const value = e.target.value;
    
    if (!isNaN(value) && parseInt(value) >= 0) {
      await updatePlayerScore(playerId, hole, value);
      setEditingScore(null);
      if (onRefresh) onRefresh();
    }
  };

  const cancelScoreEdit = () => {
    setEditingScore(null);
  };

  const handleNameEdit = (playerId, currentName) => {
    setEditingName(playerId);
    setEditingNameValue(currentName);
  };

  const saveNameEdit = async (playerId) => {
    await updatePlayerName(playerId, editingNameValue);
    setEditingName(null);
    if (onRefresh) onRefresh();
  };

  const handleSelectScore = async (hole, playerId) => {
    await updateSelectedScore(gameId, hole, group.toLowerCase(), playerId);
    if (onRefresh) onRefresh();
  };

  // Calculate front nine, back nine, and total scores
  const calculateScores = (scores) => {
    if (!scores) return { front: 0, back: 0, total: 0 };
    
    const front = Object.entries(scores)
      .filter(([hole]) => parseInt(hole) <= 9)
      .reduce((sum, [_, score]) => sum + (parseInt(score) || 0), 0);
      
    const back = Object.entries(scores)
      .filter(([hole]) => parseInt(hole) > 9)
      .reduce((sum, [_, score]) => sum + (parseInt(score) || 0), 0);
      
    return {
      front,
      back,
      total: front + back
    };
  };

  // Find selected player's score for a hole
  const getSelectedScore = (hole) => {
    if (!selectedScores || !selectedScores[hole]) {
      return '–';
    }
    
    const selectedPlayerId = selectedScores[hole];
    const selectedPlayer = players.find(p => p.id === selectedPlayerId);
    
    if (!selectedPlayer || !selectedPlayer.scores || !selectedPlayer.scores[hole]) {
      return '–';
    }
    
    return selectedPlayer.scores[hole];
  };

  // Calculate final scores from selected players
  const calculateFinalScores = () => {
    const finalScores = {};
    
    holes.forEach(hole => {
      const score = getSelectedScore(hole);
      if (score !== '–') {
        finalScores[hole] = parseInt(score);
      }
    });
    
    return calculateScores(finalScores);
  };

  // Render function for a hole's score cell
  const renderScoreCell = (player, hole) => {
    const isEditing = editingScore && 
                     editingScore.playerId === player.id && 
                     editingScore.hole === hole;
    
    const isSelected = selectedScores && selectedScores[hole] === player.id;
    const currentScore = player.scores?.[hole] || '';
    
    return (
      <td 
        key={`${player.id}-${hole}`} 
        className={`scorecard-cell ${isSelected ? 'selected-score' : ''}`}
        onClick={() => !isEditing && handleScoreEdit(player.id, hole, currentScore)}
        style={{ cursor: 'pointer', minHeight: '30px', minWidth: '40px' }}
      >
        {isEditing ? (
          <div className="flex items-center justify-center w-full">
            <select
              value={editingScoreValue}
              onChange={(e) => handleScoreChange(e, player.id, hole)}
              className="score-input w-12"
              autoFocus
            >
              {scoreOptions.map(score => (
                <option key={score} value={score}>{score}</option>
              ))}
            </select>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                cancelScoreEdit();
              }}
              className="text-red-600 text-sm ml-1"
            >
              ✗
            </button>
          </div>
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ minHeight: '30px' }}
          >
            {currentScore === '' ? '–' : currentScore}
          </div>
        )}
      </td>
    );
  };

  // Render player selection buttons for a hole
  const renderSelectionCell = (hole) => {
    const selectedPlayerId = selectedScores?.[hole];
    
    return (
      <td 
        key={`select-${hole}`} 
        className="scorecard-cell"
        style={{ minHeight: '40px', minWidth: '40px' }}
      >
        <div className="flex flex-col items-center justify-center gap-1">
          {players.map(player => (
            <button
              key={`select-${hole}-${player.id}`}
              className={`w-6 h-6 text-xs rounded-full ${
                selectedPlayerId === player.id 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              onClick={() => handleSelectScore(hole, player.id)}
              title={`Select ${player.name}'s score`}
            >
              {player.name.charAt(0).toUpperCase()}
            </button>
          ))}
        </div>
      </td>
    );
  };

  const finalScores = calculateFinalScores();

  return (
    <div className="overflow-x-auto mb-8">
      <h2 className="text-xl font-bold mb-2">{group} Group</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="scorecard-cell scorecard-header">Player</th>
            {holes.slice(0, 9).map(hole => (
              <th key={`front-${hole}`} className="scorecard-cell scorecard-header w-12">
                {hole}
              </th>
            ))}
            <th className="scorecard-cell scorecard-header">Out</th>
            {holes.slice(9, 18).map(hole => (
              <th key={`back-${hole}`} className="scorecard-cell scorecard-header w-12">
                {hole}
              </th>
            ))}
            <th className="scorecard-cell scorecard-header">In</th>
            <th className="scorecard-cell scorecard-header">Total</th>
          </tr>
        </thead>
        <tbody>
          {players.map(player => {
            const scores = calculateScores(player.scores);
            return (
              <tr key={player.id} className="player-row">
                <td className="scorecard-cell">
                  {editingName === player.id ? (
                    <div className="flex">
                      <input
                        type="text"
                        value={editingNameValue}
                        onChange={(e) => setEditingNameValue(e.target.value)}
                        className="score-input"
                        autoFocus
                      />
                      <button 
                        onClick={() => saveNameEdit(player.id)}
                        className="ml-1 text-green-600"
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="cursor-pointer hover:underline" 
                      onClick={() => handleNameEdit(player.id, player.name)}
                    >
                      {player.name}
                    </div>
                  )}
                </td>
                
                {/* Front Nine - Editable cells */}
                {holes.slice(0, 9).map(hole => renderScoreCell(player, hole))}
                
                <td className="scorecard-cell font-bold">
                  {scores.front}
                </td>
                
                {/* Back Nine - Editable cells */}
                {holes.slice(9, 18).map(hole => renderScoreCell(player, hole))}
                
                <td className="scorecard-cell font-bold">
                  {scores.back}
                </td>
                
                <td className="scorecard-cell font-bold">
                  {scores.total}
                </td>
              </tr>
            );
          })}
          
          {/* Selection Row */}
          <tr className="player-row bg-gray-50">
            <td className="scorecard-cell font-bold">
              Selection
            </td>
            
            {/* Front Nine selection buttons */}
            {holes.slice(0, 9).map(hole => renderSelectionCell(hole))}
            
            <td className="scorecard-cell">
              {/* Empty cell for Out */}
            </td>
            
            {/* Back Nine selection buttons */}
            {holes.slice(9, 18).map(hole => renderSelectionCell(hole))}
            
            <td className="scorecard-cell">
              {/* Empty cell for In */}
            </td>
            
            <td className="scorecard-cell">
              {/* Empty cell for Total */}
            </td>
          </tr>
          
          {/* Final Scores Row */}
          <tr className="player-row bg-gray-100">
            <td className="scorecard-cell font-bold">
              Final
            </td>
            
            {/* Front Nine final scores */}
            {holes.slice(0, 9).map(hole => (
              <td key={`final-${hole}`} className="scorecard-cell font-bold">
                {getSelectedScore(hole)}
              </td>
            ))}
            
            <td className="scorecard-cell font-bold">
              {finalScores.front}
            </td>
            
            {/* Back Nine final scores */}
            {holes.slice(9, 18).map(hole => (
              <td key={`final-${hole}`} className="scorecard-cell font-bold">
                {getSelectedScore(hole)}
              </td>
            ))}
            
            <td className="scorecard-cell font-bold">
              {finalScores.back}
            </td>
            
            <td className="scorecard-cell font-bold">
              {finalScores.total}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Scorecard; 