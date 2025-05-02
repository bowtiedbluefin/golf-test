import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getGame, getPlayer, calculateTotalScore, getSelectedTotalScore } from '../../../lib/dataService';
import Scorecard from '../../../components/Scorecard';
import GameSummary from '../../../components/GameSummary';

export default function GamePage() {
  const router = useRouter();
  const { id: gameId } = router.query;
  
  const [game, setGame] = useState(null);
  const [topGroupPlayers, setTopGroupPlayers] = useState([]);
  const [bottomGroupPlayers, setBottomGroupPlayers] = useState([]);
  const [selectedTotalScore, setSelectedTotalScore] = useState({ top: 0, bottom: 0, total: 0 });
  const [totalScores, setTotalScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  const loadGame = async () => {
    // If gameId is not yet available (during initial SSR), don't try to load
    if (!gameId) {
      setDebugInfo('Waiting for gameId from router...');
      return;
    }
    
    try {
      setLoading(true);
      setDebugInfo(`Loading game with ID: ${gameId}`);
      
      // Fetch game data
      const gameData = await getGame(gameId);
      setGame(gameData);
      setDebugInfo(`Game data loaded: ${JSON.stringify(gameData.name)}`);
      
      // Fetch players for top group
      setDebugInfo(`Loading top group players: ${JSON.stringify(gameData.topGroup)}`);
      const topPlayers = await Promise.all(
        gameData.topGroup.map(async (playerId) => {
          const player = await getPlayer(playerId);
          return { id: playerId, ...player };
        })
      );
      setTopGroupPlayers(topPlayers);
      
      // Fetch players for bottom group
      setDebugInfo(`Loading bottom group players: ${JSON.stringify(gameData.bottomGroup)}`);
      const bottomPlayers = await Promise.all(
        gameData.bottomGroup.map(async (playerId) => {
          const player = await getPlayer(playerId);
          return { id: playerId, ...player };
        })
      );
      setBottomGroupPlayers(bottomPlayers);
      
      // Calculate selected scores
      setDebugInfo('Calculating selected scores');
      const selectedScore = await getSelectedTotalScore(gameData);
      setSelectedTotalScore(selectedScore);
      
      // Calculate total scores for all players
      setDebugInfo('Calculating total scores');
      const scores = {};
      [...topPlayers, ...bottomPlayers].forEach(player => {
        scores[player.id] = {
          name: player.name,
          total: calculateTotalScore(player.scores)
        };
      });
      setTotalScores(scores);
      setDebugInfo('Game loaded successfully');
    } catch (error) {
      console.error('Error loading game:', error);
      setError(`Failed to load game data: ${error.message || 'Unknown error'}`);
      setDebugInfo(`Error details: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // When router.isReady is true, we can safely read router.query
    if (router.isReady) {
      loadGame();
    }
  }, [router.isReady, gameId]);

  if (!router.isReady) {
    return <div className="text-center p-8">Initializing...</div>;
  }

  if (loading) {
    return (
      <div className="text-center p-8">
        <p className="mb-4">Loading game data...</p>
        <p className="text-sm text-gray-500">{debugInfo}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded text-red-700 mb-4">
        <p className="font-bold">Error: {error}</p>
        {debugInfo && (
          <details className="mt-2">
            <summary>Technical Details</summary>
            <pre className="mt-2 text-xs whitespace-pre-wrap bg-gray-100 p-2 rounded">
              {debugInfo}
            </pre>
          </details>
        )}
        <Link href="/" className="text-blue-500 hover:underline mt-4 inline-block">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Link href="/" className="text-blue-500 hover:underline mb-2 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold">{game?.name || 'Golf Game'}</h1>
        </div>
        <button 
          onClick={loadGame} 
          className="btn-secondary"
        >
          Refresh
        </button>
      </div>
      
      <GameSummary 
        selectedTotalScore={selectedTotalScore} 
        totalScores={totalScores} 
      />
      
      <Scorecard 
        gameId={gameId}
        players={topGroupPlayers} 
        group="Top" 
        selectedScores={
          Object.entries(game?.selectedScores || {})
            .filter(([_, data]) => data.top)
            .reduce((acc, [hole, data]) => {
              acc[hole] = data.top;
              return acc;
            }, {})
        }
        onRefresh={loadGame}
      />
      
      <Scorecard 
        gameId={gameId}
        players={bottomGroupPlayers} 
        group="Bottom" 
        selectedScores={
          Object.entries(game?.selectedScores || {})
            .filter(([_, data]) => data.bottom)
            .reduce((acc, [hole, data]) => {
              acc[hole] = data.bottom;
              return acc;
            }, {})
        }
        onRefresh={loadGame}
      />
    </div>
  );
} 