import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRecentGames } from '../lib/dataService';
import NewGameForm from '../components/NewGameForm';

export default function Home() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewGameForm, setShowNewGameForm] = useState(false);
  const [error, setError] = useState(null);

  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString();
  };

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const recentGames = await getRecentGames();
        setGames(recentGames);
      } catch (error) {
        console.error('Error fetching games:', error);
        setError(error.message || 'Error loading games');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Golf Scorecard</h1>
        <button 
          className="btn"
          onClick={() => setShowNewGameForm(!showNewGameForm)}
        >
          {showNewGameForm ? 'Cancel' : 'New Game'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 p-4 rounded-lg text-red-700">
          <p><strong>Error:</strong> {error}</p>
          <p className="mt-2">Please check your Firebase configuration and network connection.</p>
        </div>
      )}

      {showNewGameForm ? (
        <NewGameForm />
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-4">Recent Games</h2>
          
          {loading ? (
            <p>Loading games...</p>
          ) : games.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <p className="text-gray-600 mb-4">No games found. Create your first game!</p>
              <button 
                className="btn"
                onClick={() => setShowNewGameForm(true)}
              >
                Create Game
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map((game) => (
                <Link 
                  href={`/game/${game.id}`} 
                  key={game.id}
                  className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold mb-2">{game.name}</h3>
                  <p className="text-gray-600">Date: {formatDate(game.date)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-8 p-4 bg-yellow-100 rounded-lg">
          <p className="font-bold">Having trouble with Firebase?</p>
          <Link 
            href="/firebase-test" 
            className="text-blue-500 hover:underline"
          >
            Run Firebase Connection Test
          </Link>
        </div>
      )}
    </div>
  );
} 