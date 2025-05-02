import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit
} from 'firebase/firestore';

// Check if Firebase is properly initialized
const isFirebaseInitialized = () => {
  if (!db) {
    console.error('Firebase is not initialized. Check your .env.local file for Firebase configuration.');
    return false;
  }
  return true;
};

// Simulate data for development if Firebase is not initialized
const mockPlayers = [
  { id: 'player1', name: 'Player 1', scores: { 1: 4, 2: 5, 3: 4 } },
  { id: 'player2', name: 'Player 2', scores: { 1: 5, 2: 4, 3: 5 } },
  { id: 'player3', name: 'Player 3', scores: { 1: 3, 2: 4, 3: 3 } },
  { id: 'player4', name: 'Player 4', scores: { 1: 4, 2: 5, 3: 4 } },
  { id: 'player5', name: 'Player 5', scores: { 1: 5, 2: 4, 3: 5 } },
  { id: 'player6', name: 'Player 6', scores: { 1: 3, 2: 4, 3: 3 } },
  { id: 'player7', name: 'Player 7', scores: { 1: 4, 2: 5, 3: 4 } },
  { id: 'player8', name: 'Player 8', scores: { 1: 5, 2: 4, 3: 5 } },
];

const mockGames = [
  { 
    id: 'game1',
    name: 'Test Game',
    date: { seconds: Date.now() / 1000 },
    topGroup: ['player1', 'player2', 'player3', 'player4'],
    bottomGroup: ['player5', 'player6', 'player7', 'player8'],
    selectedScores: {}
  }
];

// Game operations
export const createGame = async (gameName, players) => {
  try {
    if (!isFirebaseInitialized()) {
      console.log('Using mock data for createGame');
      return 'game1';
    }

    console.log('Creating game:', gameName, 'with players:', players);

    // Validate data before creating
    if (!gameName || !players || players.length !== 8) {
      throw new Error(`Invalid data: gameName=${gameName}, players.length=${players?.length}`);
    }

    // Create player documents first
    console.log('Creating player documents...');
    const playerRefs = [];
    for (const player of players) {
      console.log('Creating player:', player);
      try {
        const playerRef = await addDoc(collection(db, 'players'), {
          name: player,
          scores: Array(18).fill(0).reduce((acc, _, index) => {
            acc[index + 1] = 0;
            return acc;
          }, {})
        });
        console.log('Player created with ID:', playerRef.id);
        playerRefs.push(playerRef.id);
      } catch (playerError) {
        console.error('Error creating player:', player, playerError);
        throw new Error(`Failed to create player "${player}": ${playerError.message}`);
      }
    }

    // Create the game document
    console.log('Creating game document with player refs:', playerRefs);
    try {
      const gameRef = await addDoc(collection(db, 'games'), {
        name: gameName,
        date: serverTimestamp(),
        topGroup: playerRefs.slice(0, 4),
        bottomGroup: playerRefs.slice(4, 8),
        selectedScores: Array(18).fill(0).reduce((acc, _, index) => {
          acc[index + 1] = { top: null, bottom: null };
          return acc;
        }, {})
      });

      console.log('Game created with ID:', gameRef.id);
      return gameRef.id;
    } catch (gameError) {
      console.error('Error creating game document:', gameError);
      throw new Error(`Failed to create game document: ${gameError.message}`);
    }
  } catch (error) {
    console.error('Error creating game:', error);
    throw error;
  }
};

export const getGame = async (gameId) => {
  try {
    if (!isFirebaseInitialized()) {
      console.log('Using mock data for getGame');
      return mockGames[0];
    }

    const gameDoc = await getDoc(doc(db, 'games', gameId));
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }
    return gameDoc.data();
  } catch (error) {
    console.error('Error getting game:', error);
    throw error;
  }
};

export const getRecentGames = async (count = 5) => {
  try {
    if (!isFirebaseInitialized()) {
      console.log('Using mock data for getRecentGames');
      return mockGames;
    }

    const gamesQuery = query(
      collection(db, 'games'),
      orderBy('date', 'desc'),
      limit(count)
    );
    
    const gamesSnapshot = await getDocs(gamesQuery);
    return gamesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting recent games:', error);
    throw error;
  }
};

// Player operations
export const getPlayer = async (playerId) => {
  try {
    if (!isFirebaseInitialized()) {
      console.log('Using mock data for getPlayer');
      return mockPlayers.find(p => p.id === playerId) || mockPlayers[0];
    }

    const playerDoc = await getDoc(doc(db, 'players', playerId));
    if (!playerDoc.exists()) {
      throw new Error('Player not found');
    }
    return playerDoc.data();
  } catch (error) {
    console.error('Error getting player:', error);
    throw error;
  }
};

export const updatePlayerName = async (playerId, name) => {
  try {
    if (!isFirebaseInitialized()) {
      console.log('Using mock data for updatePlayerName');
      return;
    }

    await updateDoc(doc(db, 'players', playerId), { name });
  } catch (error) {
    console.error('Error updating player name:', error);
    throw error;
  }
};

export const updatePlayerScore = async (playerId, hole, score) => {
  try {
    if (!isFirebaseInitialized()) {
      console.log('Using mock data for updatePlayerScore');
      return;
    }

    await updateDoc(doc(db, 'players', playerId), { 
      [`scores.${hole}`]: parseInt(score) || 0
    });
  } catch (error) {
    console.error('Error updating player score:', error);
    throw error;
  }
};

// Selection operations
export const updateSelectedScore = async (gameId, hole, group, playerId) => {
  try {
    if (!isFirebaseInitialized()) {
      console.log('Using mock data for updateSelectedScore');
      return;
    }

    await updateDoc(doc(db, 'games', gameId), { 
      [`selectedScores.${hole}.${group}`]: playerId
    });
  } catch (error) {
    console.error('Error updating selected score:', error);
    throw error;
  }
};

// Helper functions
export const calculateTotalScore = (scores) => {
  return Object.values(scores).reduce((total, score) => total + (parseInt(score) || 0), 0);
};

export const getSelectedTotalScore = async (game) => {
  const result = { top: 0, bottom: 0, total: 0 };
  
  for (let hole = 1; hole <= 18; hole++) {
    const topPlayerId = game.selectedScores[hole]?.top;
    const bottomPlayerId = game.selectedScores[hole]?.bottom;
    
    if (topPlayerId) {
      const player = await getPlayer(topPlayerId);
      result.top += parseInt(player.scores[hole]) || 0;
    }
    
    if (bottomPlayerId) {
      const player = await getPlayer(bottomPlayerId);
      result.bottom += parseInt(player.scores[hole]) || 0;
    }
  }
  
  result.total = result.top + result.bottom;
  return result;
}; 