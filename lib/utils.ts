import { v4 as uuidv4 } from 'uuid';
import { Player, Court, QueueItem, AppState } from '@/types';

// Generate a unique ID
export const generateId = (): string => uuidv4();

// Format timestamp to readable time
export const formatTime = (timestamp: string | null): string => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// Calculate elapsed time in minutes
export const calculateElapsedTime = (startTime: string | null): number => {
  if (!startTime) return 0;
  const start = new Date(startTime).getTime();
  const now = new Date().getTime();
  return Math.floor((now - start) / 60000); // Convert ms to minutes
};

// Format currency
export const formatCurrency = (amount: number, currency: string): string => {
  if (currency === 'PHP') {
    return `₱${amount.toFixed(2)}`;
  }
  
  const formatter = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency
  });
  
  return formatter.format(amount);
};

// Calculate fees for a game
export const calculateGameFees = (
  gameType: 'singles' | 'doubles', 
  playerCount: number, 
  singlesFee: number, 
  doublesFee: number
): number => {
  const feePerPlayer = gameType === 'singles' ? singlesFee : doublesFee;
  return feePerPlayer * playerCount;
};

// Player management functions
export const addPlayer = (state: AppState, name: string, skillLevel: Player['skillLevel']): AppState => {
  const newPlayer: Player = {
    id: generateId(),
    name,
    skillLevel,
    gamesPlayed: 0,
    inQueue: false,
    donePlaying: false,
    currentlyPlaying: false,
    totalFees: 0,
    paidFees: 0,
    unpaidFees: 0,
    feeHistory: []
  };
  
  return {
    ...state,
    players: [...state.players, newPlayer]
  };
};

// Court management functions
export const assignPlayersToCourt = (
  state: AppState, 
  courtId: number, 
  playerIds: string[]
): AppState => {
  const isDoubles = playerIds.length === 4;
  const court = state.courts.find(c => c.id === courtId);
  
  if (!court) return state;
  
  // Update court
  const updatedCourts = state.courts.map(court => 
    court.id === courtId 
      ? {
          ...court,
          status: 'occupied' as const,
          players: playerIds,
          startTime: new Date().toISOString(),
          isDoubles,
          currentGameId: generateId()
        }
      : court
  );
  
  // Update players
  const updatedPlayers = state.players.map(player => 
    playerIds.includes(player.id)
      ? { ...player, currentlyPlaying: true, inQueue: false }
      : player
  );
  
  return {
    ...state,
    courts: updatedCourts,
    players: updatedPlayers
  };
};

export const markCourtAvailable = (state: AppState, courtId: number): AppState => {
  const court = state.courts.find(c => c.id === courtId);
  
  if (!court) return state;
  
  // Update player stats
  const updatedPlayers = state.players.map(player => {
    if (court.players.includes(player.id)) {
      return {
        ...player,
        currentlyPlaying: false,
        gamesPlayed: player.gamesPlayed + 1
      };
    }
    return player;
  });
  
  // Update court
  const updatedCourts = state.courts.map(court => 
    court.id === courtId 
      ? {
          ...court,
          status: 'available' as const,
          players: [],
          startTime: null,
          isDoubles: false,
          currentGameId: null
        }
      : court
  );
  
  return {
    ...state,
    courts: updatedCourts,
    players: updatedPlayers
  };
};

// Queue management functions
export const addToQueue = (
  state: AppState, 
  playerIds: string[], 
  isDoubles: boolean
): AppState => {
  // Create queue item
  const newQueueItem: QueueItem = {
    id: generateId(),
    playerIds,
    requestedTime: new Date().toISOString(),
    isDoubles
  };
  
  // Update players
  const updatedPlayers = state.players.map(player => 
    playerIds.includes(player.id)
      ? { ...player, inQueue: true }
      : player
  );
  
  return {
    ...state,
    queue: [...state.queue, newQueueItem],
    players: updatedPlayers
  };
};

export const removeFromQueue = (state: AppState, queueId: string): AppState => {
  const queueItem = state.queue.find(item => item.id === queueId);
  
  if (!queueItem) return state;
  
  // Update players
  const updatedPlayers = state.players.map(player => 
    queueItem.playerIds.includes(player.id)
      ? { ...player, inQueue: false }
      : player
  );
  
  return {
    ...state,
    queue: state.queue.filter(item => item.id !== queueId),
    players: updatedPlayers
  };
};

// Simple FIFO queue suggestion
export const suggestNextMatch = (state: AppState): QueueItem | null => {
  // Get the first item in the queue
  return state.queue.length > 0 ? state.queue[0] : null;
};