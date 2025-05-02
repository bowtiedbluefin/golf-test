import React, { useState } from 'react';
import { createGame } from '../lib/dataService';
import { useRouter } from 'next/router';

const NewGameForm = () => {
  const router = useRouter();
  const [gameName, setGameName] = useState('');
  const [players, setPlayers] = useState(['', '', '', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  const handlePlayerNameChange = (index, value) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDebugInfo('');
    
    try {
      setLoading(true);
      
      // Validate form
      if (!gameName.trim()) {
        setError('Game name is required');
        setLoading(false);
        return;
      }
      
      if (players.some(player => !player.trim())) {
        setError('All player names are required');
        setLoading(false);
        return;
      }

      setDebugInfo('Creating game...');
      
      // Create game
      const gameId = await createGame(gameName, players);
      
      setDebugInfo(`Game created with ID: ${gameId}. Redirecting...`);
      
      // Force a small delay to ensure Firebase has time to process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to the game page
      if (gameId) {
        setDebugInfo(`Redirecting to /game/${gameId}`);
        router.push(`/game/${gameId}`);
      } else {
        throw new Error('No game ID returned from createGame');
      }
    } catch (error) {
      console.error('Error creating game:', error);
      setError(`Failed to create game: ${error.message || 'Unknown error'}`);
      setDebugInfo(`Error details: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle direct navigation for testing
  const handleManualNavigation = () => {
    try {
      router.push('/game/game1');
    } catch (error) {
      setError(`Navigation error: ${error.message}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create New Game</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          <p><strong>Error:</strong> {error}</p>
          {debugInfo && (
            <details className="mt-2">
              <summary>Technical Details</summary>
              <pre className="mt-2 text-xs whitespace-pre-wrap bg-gray-100 p-2 rounded">
                {debugInfo}
              </pre>
            </details>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="gameName">
            Game Name
          </label>
          <input
            id="gameName"
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="e.g., Sunday Tournament"
            required
          />
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Players</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Top Group</h4>
              {players.slice(0, 4).map((player, index) => (
                <div key={`top-${index}`} className="mb-2">
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={player}
                    onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                    placeholder={`Player ${index + 1}`}
                    required
                  />
                </div>
              ))}
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Bottom Group</h4>
              {players.slice(4, 8).map((player, index) => (
                <div key={`bottom-${index}`} className="mb-2">
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={player}
                    onChange={(e) => handlePlayerNameChange(index + 4, e.target.value)}
                    placeholder={`Player ${index + 5}`}
                    required
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleManualNavigation}
          >
            Test Navigation
          </button>
          
          <button
            type="submit"
            className="btn"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Game'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewGameForm; 