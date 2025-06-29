'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Player, Court, QueueItem, FeeConfig, MatchRecord } from '@/types';
import { initialAppState } from '@/lib/initialData';
import { 
  loadAppState, 
  saveAppState, 
  resetAllData, 
} from '@/lib/localStorage';
import {
  addPlayer,
  suggestNextMatch,
  generateId
} from '@/lib/utils';
import { ref, set, remove, get, onDisconnect } from 'firebase/database';
import { database } from '@/lib/firebase';
import { nanoid } from 'nanoid';

interface DataContextType {
  state: AppState;
  addNewPlayer: (name: string, skillLevel: Player['skillLevel']) => void;
  assignToCourt: (courtId: number, playerIds: string[]) => { success: boolean; playersAlreadyPlaying?: Player[] };
  completeMatch: (courtId: number) => void;
  addPlayerToQueue: (playerIds: string[], isDoubles: boolean) => void;
  removePlayerFromQueue: (queueId: string) => void;
  getNextMatch: () => QueueItem | null;
  resetAll: () => void;
  // Fee management functions
  updateFeeConfig: (newConfig: FeeConfig) => void;
  updatePlayerFees: (playerId: string, amount: number) => void;
  markFeesAsPaid: (playerId: string, amount: number) => void;
  markPlayerAsDonePlaying: (playerId: string) => void;
  markPlayersAsDonePlaying: (playerIds: string[]) => void;
  isPlayerInQueue: (playerId: string) => boolean;
  // Sharing functions
  createShareableLink: () => Promise<string>;
  stopSharing: () => Promise<void>;
  isSharing: boolean;
  shareId: string | null;
  shareUrl: string | null;
  updateFirebaseQueue: () => Promise<boolean>;
  setInitialSharingState: (shareId: string, isSharing: boolean) => void;
  renameCourt: (courtId: number, newName: string) => void;
  addCourt: () => void;
  removeCourt: (courtId: number) => void;
  syncToFirebase: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(initialAppState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Sharing state - load from localStorage on initial render
  const [shareId, setShareId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('queueShareId');
    }
    return null;
  });
  
  const [isSharing, setIsSharing] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('queueIsSharing') === 'true';
    }
    return false;
  });

  // Calculate share URL based on shareId
  const shareUrl = shareId 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/shared-queue/${shareId}` 
    : null;

  // Load data from localStorage on first render
  useEffect(() => {
    const loadedState = loadAppState(initialAppState);
    setState(loadedState);
    setIsInitialized(true);
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      saveAppState(state);
    }
  }, [state, isInitialized]);

  // Persist sharing state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (shareId) {
        localStorage.setItem('queueShareId', shareId);
      } else {
        localStorage.removeItem('queueShareId');
      }
      
      localStorage.setItem('queueIsSharing', isSharing.toString());
    }
  }, [shareId, isSharing]);

  // Verify that the shared queue still exists in Firebase on initial load
  useEffect(() => {
    const verifySharedQueue = async () => {
      if (isSharing && shareId) {
        try {
          const queueRef = ref(database, `queues/${shareId}`);
          const snapshot = await get(queueRef);
          
          if (!snapshot.exists()) {
            // Queue no longer exists, reset sharing state
            setIsSharing(false);
            setShareId(null);
            localStorage.removeItem('queueShareId');
            localStorage.removeItem('queueIsSharing');
          } else {
            // Queue exists, make sure it stays updated with current data
            await set(queueRef, {
              queue: state.queue,
              players: state.players,
              courts: state.courts,
              lastUpdated: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error("Error verifying shared queue:", error);
          // Reset sharing state on error
          setIsSharing(false);
          setShareId(null);
          localStorage.removeItem('queueShareId');
          localStorage.removeItem('queueIsSharing');
        }
      }
    };
    
    if (isInitialized) {
      verifySharedQueue();
    }
  }, [isInitialized, isSharing, shareId, state]);

  // Function to update Firebase with current state
  const updateFirebaseQueue = async () => {
    if (isSharing && shareId) {
      try {
        const queueRef = ref(database, `queues/${shareId}`);
        await set(queueRef, {
          queue: state.queue,
          players: state.players,
          courts: state.courts,
          lastUpdated: new Date().toISOString()
        });
        console.log("Firebase queue updated successfully");
        return true;
      } catch (error) {
        console.error("Error updating shared queue:", error);
        return false;
      }
    }
    return false;
  };

  // Create a shareable link
  const createShareableLink = async () => {
    // Generate a short, unique ID
    const newShareId = nanoid(6);
    setShareId(newShareId);
    
    try {
      // Save current queue state to Firebase
      const queueRef = ref(database, `queues/${newShareId}`);
      await set(queueRef, {
        queue: state.queue,
        players: state.players,
        courts: state.courts,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
      
      // Setup auto-removal when disconnected (optional)
      // onDisconnect(queueRef).remove();
      
      setIsSharing(true);
      
      // Store in localStorage
      localStorage.setItem('queueShareId', newShareId);
      localStorage.setItem('queueIsSharing', 'true');
      
      return `${typeof window !== 'undefined' ? window.location.origin : ''}/shared-queue/${newShareId}`;
    } catch (error) {
      console.error("Error creating shareable link:", error);
      setShareId(null);
      throw error;
    }
  };
  
  // Stop sharing the queue
  const stopSharing = async () => {
    if (!shareId) return;
    
    try {
      // Remove the shared queue data from Firebase
      const queueRef = ref(database, `queues/${shareId}`);
      await remove(queueRef);
      
      setShareId(null);
      setIsSharing(false);
      
      // Clear from localStorage
      localStorage.removeItem('queueShareId');
      localStorage.removeItem('queueIsSharing');
    } catch (error) {
      console.error("Error stopping sharing:", error);
      throw error;
    }
  };

  // Player management
  const addNewPlayer = (name: string, skillLevel: Player['skillLevel']) => {
    setState(currentState => {
      const updatedState = addPlayer(currentState, name, skillLevel);
      return updatedState;
    });
    
    // If sharing, update Firebase
    if (isSharing) {
      setTimeout(() => {
        updateFirebaseQueue();
      }, 100);
    }
  };

  // Check if a player is in any queue
  const isPlayerInQueue = (playerId: string): boolean => {
    return state.queue.some(item => item.playerIds.includes(playerId));
  };

  // Court management
  const assignToCourt = (courtId: number, playerIds: string[]) => {
    // Check if any players are already playing
    const playersAlreadyPlaying = state.players.filter(
      player => playerIds.includes(player.id) && player.currentlyPlaying
    );
    
    // If any players are already playing, return error information
    if (playersAlreadyPlaying.length > 0) {
      return {
        success: false,
        playersAlreadyPlaying
      };
    }
    
    const isDoubles = playerIds.length === 4;
    const gameId = generateId();
    const currentTime = new Date().toISOString();

    // Calculate fee per player based on game type
    const feePerPlayer = isDoubles 
      ? state.feeConfig.doublesFee 
      : state.feeConfig.singlesFee;
    
    // Create new game session
    const newGameSession = {
      id: gameId,
      courtId,
      playerIds,
      gameType: isDoubles ? 'doubles' as const : 'singles' as const,
      startTime: currentTime,
      endTime: null,
      duration: 0,
      feePerPlayer,
      totalFees: feePerPlayer * playerIds.length,
      feesCollected: 0,
      status: 'active' as const
    };
    
    // Update players and court
    setState(currentState => {
      // Update court
      const updatedCourts = currentState.courts.map(court => 
        court.id === courtId 
          ? {
              ...court,
              status: 'occupied' as const,
              players: playerIds,
              startTime: currentTime,
              isDoubles,
              currentGameId: gameId
            }
          : court
      );
      
      // Update players - only set currentlyPlaying, don't change inQueue status
      const updatedPlayers = currentState.players.map(player => 
        playerIds.includes(player.id)
          ? { ...player, currentlyPlaying: true }
          : player
      );
      
      return {
        ...currentState,
        courts: updatedCourts,
        players: updatedPlayers,
        gameSessions: [...currentState.gameSessions, newGameSession]
      };
    });
    
    // If sharing, update Firebase
    if (isSharing) {
      setTimeout(() => {
        updateFirebaseQueue();
      }, 100);
    }
    
    return { success: true };
  };

  const completeMatch = (courtId: number) => {
    setState(currentState => {
      const court = currentState.courts.find(c => c.id === courtId);
      
      if (!court || !court.currentGameId) return currentState;
      
      const currentTime = new Date().toISOString();
      
      // Find the game session
      const gameSession = currentState.gameSessions.find(
        game => game.id === court.currentGameId
      );
      
      if (!gameSession) return currentState;
      
      // Calculate game duration
      const startTime = new Date(gameSession.startTime).getTime();
      const endTime = new Date(currentTime).getTime();
      const durationMinutes = Math.round((endTime - startTime) / 60000);
      
      // Update game session
      const updatedGameSessions = currentState.gameSessions.map(game =>
        game.id === court.currentGameId
          ? {
              ...game,
              endTime: currentTime,
              duration: durationMinutes,
              status: 'completed' as const,
            }
          : game
      );
      
      // Update players - increment games played and update fees if auto-calculate is on
      const updatedPlayers = currentState.players.map(player => {
        if (court.players.includes(player.id)) {
          // Basic update - mark as not playing and increment games
          let playerUpdate = {
            ...player,
            currentlyPlaying: false,
            gamesPlayed: player.gamesPlayed + 1
          };
          
          // Add fees if auto-calculate is enabled
          if (currentState.feeConfig.autoCalculate) {
            const feeAmount = gameSession.feePerPlayer;
            
            // Add fee history record
            const feeHistoryItem = {
              gameId: gameSession.id,
              courtId,
              gameType: gameSession.gameType,
              feeAmount,
              timestamp: currentTime,
              paid: false
            };
            
            playerUpdate = {
              ...playerUpdate,
              totalFees: playerUpdate.totalFees + feeAmount,
              unpaidFees: playerUpdate.unpaidFees + feeAmount,
              feeHistory: [...(playerUpdate.feeHistory || []), feeHistoryItem]
            };
          }
          
          return playerUpdate;
        }
        return player;
      });
      
      // Update court
      const updatedCourts = currentState.courts.map(court => 
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
      
      // Create a MatchRecord for the match history
      const matchRecord = {
        id: gameSession.id,
        courtId,
        playerIds: court.players,
        isDoubles: court.isDoubles,
        startTime: gameSession.startTime,
        endTime: currentTime,
        durationMinutes,
        feesCharged: gameSession.totalFees,
        // Cache player names for easier display/searching
        playerNames: court.players.map(id => {
          const player = currentState.players.find(p => p.id === id);
          return player ? player.name : 'Unknown Player';
        })
      };
      
      // IMPORTANT: Safely add to match history, handling the case where it might be undefined
      const currentMatchHistory = Array.isArray(currentState.matchHistory) 
        ? currentState.matchHistory 
        : [];
      
      return {
        ...currentState,
        courts: updatedCourts,
        players: updatedPlayers,
        gameSessions: updatedGameSessions,
        matchHistory: [...currentMatchHistory, matchRecord] // Safely add to match history
      };
    });
    
    // If sharing, update Firebase after state update completes
    if (isSharing) {
      setTimeout(() => {
        updateFirebaseQueue();
      }, 100);
    }
  };

  // Queue management - MODIFIED
  const addPlayerToQueue = (playerIds: string[], isDoubles: boolean) => {
    // Create a new queue item directly
    setState(currentState => {
      const newQueueItem: QueueItem = {
        id: generateId(),
        playerIds,
        requestedTime: new Date().toISOString(),
        isDoubles
      };
      
      // Update the inQueue property for the selected players
      const updatedPlayers = currentState.players.map(player => 
        playerIds.includes(player.id) 
          ? { ...player, inQueue: true }
          : player
      );
      
      return {
        ...currentState,
        queue: [...currentState.queue, newQueueItem],
        players: updatedPlayers  // Also update the player objects
      };
    });
    
    // If sharing, update Firebase
    if (isSharing) {
      setTimeout(() => {
        updateFirebaseQueue();
      }, 100);
    }
  };

  // MODIFIED - update to also update player inQueue status
  const removePlayerFromQueue = (queueId: string) => {
    setState(currentState => {
      // Find the queue item to be removed
      const queueItem = currentState.queue.find(item => item.id === queueId);
      if (!queueItem) return currentState;
      
      // Get the player IDs from the queue item
      const playerIdsToRemove = queueItem.playerIds;
      
      // Filter out the queue item
      const updatedQueue = currentState.queue.filter(item => item.id !== queueId);
      
      // Update inQueue status for players who are no longer in any queue
      const updatedPlayers = currentState.players.map(player => {
        if (playerIdsToRemove.includes(player.id)) {
          // Check if the player is still in any other queue
          const stillInQueue = updatedQueue.some(item => item.playerIds.includes(player.id));
          return {
            ...player,
            inQueue: stillInQueue
          };
        }
        return player;
      });
      
      return {
        ...currentState,
        queue: updatedQueue,
        players: updatedPlayers
      };
    });
    
    // If sharing, update Firebase
    if (isSharing) {
      setTimeout(() => {
        updateFirebaseQueue();
      }, 100);
    }
  };

  const getNextMatch = (): QueueItem | null => {
    return suggestNextMatch(state);
  };

  // Fee management
  const updateFeeConfig = (newConfig: FeeConfig) => {
    console.log('Updating fee config with:', newConfig);
  
    setState(currentState => {
      const updatedConfig = {
        ...newConfig,
        autoCalculate: true,
        requirePayment: false
      };
      
      console.log('New state fee config:', updatedConfig);
      
      return {
        ...currentState,
        feeConfig: updatedConfig
      };
    });
  };

  const updatePlayerFees = (playerId: string, amount: number) => {
    setState(currentState => {
      const updatedPlayers = currentState.players.map(player => {
        if (player.id === playerId) {
          return {
            ...player,
            totalFees: player.totalFees + amount,
            unpaidFees: player.unpaidFees + amount
          };
        }
        return player;
      });
      
      return {
        ...currentState,
        players: updatedPlayers
      };
    });
  };

  const markFeesAsPaid = (playerId: string, amount: number) => {
    setState(currentState => {
      const updatedPlayers = currentState.players.map(player => {
        if (player.id === playerId) {
          // Update fee history to mark appropriate fees as paid
          const updatedFeeHistory = [...player.feeHistory];
          let remainingAmount = amount;
          
          // Mark fee history items as paid until the amount is covered
          for (let i = 0; i < updatedFeeHistory.length; i++) {
            if (!updatedFeeHistory[i].paid && remainingAmount > 0) {
              const feeAmount = updatedFeeHistory[i].feeAmount;
              
              if (remainingAmount >= feeAmount) {
                updatedFeeHistory[i] = { ...updatedFeeHistory[i], paid: true };
                remainingAmount -= feeAmount;
              }
            }
          }
          
          return {
            ...player,
            paidFees: player.paidFees + amount,
            unpaidFees: Math.max(0, player.unpaidFees - amount),
            feeHistory: updatedFeeHistory
          };
        }
        return player;
      });
      
      return {
        ...currentState,
        players: updatedPlayers
      };
    });
  };

  // Reset functions
  const resetAll = () => {
    resetAllData();
    localStorage.removeItem('skipFeeWarning');
    localStorage.removeItem('hideQueueNotification');
    localStorage.removeItem('hideCourtNotification');
    localStorage.removeItem('queueShareId');
    localStorage.removeItem('queueIsSharing');
    setState(initialAppState);
    setIsSharing(false);
    setShareId(null);
  };

  // This is for marking a single player
  const markPlayerAsDonePlaying = (playerId: string) => {
    setState(currentState => {
      // Find the player
      const playerIndex = currentState.players.findIndex(p => p.id === playerId);
      
      if (playerIndex === -1) return currentState;
      
      // Check if player is available to be marked (not playing)
      const player = currentState.players[playerIndex];
      if (player.currentlyPlaying) {
        console.error("Cannot mark a player who is currently playing as done");
        return currentState;
      }
      
      // Create a new players array with the updated player
      const updatedPlayers = [...currentState.players];
      updatedPlayers[playerIndex] = {
        ...player,
        donePlaying: !player.donePlaying // Toggle the donePlaying status
      };
      
      return {
        ...currentState,
        players: updatedPlayers
      };
    });
  };

  // This is for marking multiple players at once - MODIFIED to allow marking players in queue
  const markPlayersAsDonePlaying = (playerIds: string[]) => {
    setState(currentState => {
      // Create a copy of players array
      const updatedPlayers = [...currentState.players];
      
      // Loop through all player IDs and mark them as done
      playerIds.forEach(playerId => {
        const playerIndex = updatedPlayers.findIndex(p => p.id === playerId);
        
        if (playerIndex !== -1) {
          const player = updatedPlayers[playerIndex];
          
          // Only mark if player is not currently playing (removed inQueue check)
          if (!player.currentlyPlaying) {
            updatedPlayers[playerIndex] = {
              ...player,
              donePlaying: true // Always set to true (not toggle)
            };
          }
        }
      });
      
      return {
        ...currentState,
        players: updatedPlayers
      };
    });
  };

  // Method to set initial sharing state from anywhere in the app
  const setInitialSharingState = (newShareId: string, newIsSharing: boolean) => {
    setShareId(newShareId);
    setIsSharing(newIsSharing);
  };

  const renameCourt = (courtId: number, newName: string) => {
     setState(currentState => {
      const updatedCourts = currentState.courts.map(court => 
        court.id === courtId ? { ...court, name: newName } : court
      );
      
      const updatedState = {
        ...currentState,
        courts: updatedCourts
      };
      
      // Save to localStorage
      saveAppState(updatedState);
      
      // If sharing is enabled, update Firebase
      if (isSharing && shareId) {
        const queueRef = ref(database, `queues/${shareId}`);
        set(queueRef, {
          queue: updatedState.queue,
          players: updatedState.players,
          courts: updatedState.courts,
          lastUpdated: new Date().toISOString()
        }).catch(error => console.error("Error updating court name in Firebase:", error));
      }
      
      return updatedState;
    });
  };

  const syncToFirebase = () => {
    if (isSharing && shareId) {
      const queueRef = ref(database, `queues/${shareId}`);
      set(queueRef, {
        queue: state.queue,
        players: state.players,
        courts: state.courts,
        lastUpdated: new Date().toISOString()
      }).catch(error => {
        console.error("Error syncing to Firebase:", error);
      });
    }
  };

  const addCourt = () => {
    setState(currentState => {
      // Limit to maximum 12 courts
      if (currentState.courts.length >= 20) {
        return currentState;
      }

      // Find the highest court ID
      const highestId = Math.max(...currentState.courts.map(court => court.id), 0);
      
      // Create a new court with the next ID
      const newCourt: Court = {
        id: highestId + 1,
        name: `Court ${highestId + 1}`,
        status: 'available',
        players: [],
        startTime: null,
        isDoubles: false,
        currentGameId: null,
        feeRate: 50.00
      };
      
      const updatedCourts = [...currentState.courts, newCourt];
      const updatedState = {
        ...currentState,
        courts: updatedCourts
      };
      
      // Save to localStorage
      saveAppState(updatedState);
      
      // Sync to Firebase if sharing is enabled
      if (isSharing && shareId) {
        const queueRef = ref(database, `queues/${shareId}`);
        set(queueRef, {
          queue: updatedState.queue,
          players: updatedState.players,
          courts: updatedState.courts,
          lastUpdated: new Date().toISOString()
        }).catch(error => {
          console.error("Error updating courts in Firebase:", error);
        });
      }
      
      
      return updatedState;
    });
  };

  useEffect(() => {
    if (isSharing && shareId) {
      syncToFirebase();
    }
  }, [isSharing, shareId, state.courts, state.queue, state.players]);

  const removeCourt = (courtId: number) => {
    setState(currentState => {
      // Check if the court is occupied
      const courtToRemove = currentState.courts.find(court => court.id === courtId);
      if (courtToRemove?.status === 'occupied') {
        // Don't allow removing occupied courts
        return currentState;
      }
      
      const updatedCourts = currentState.courts.filter(court => court.id !== courtId);
      
      // If sharing is enabled, update Firebase
      if (isSharing && shareId) {
        const queueRef = ref(database, `queues/${shareId}`);
        set(queueRef, {
          ...currentState,
          courts: updatedCourts,
          lastUpdated: new Date().toISOString()
        }).catch(error => console.error("Error updating courts in Firebase:", error));
      }
      
      // Save to localStorage
      saveAppState({
        ...currentState,
        courts: updatedCourts
      });
      
      return {
        ...currentState,
        courts: updatedCourts
      };
    });
  };

  return (
    <DataContext.Provider
      value={{
        state,
        addNewPlayer,
        assignToCourt,
        completeMatch,
        addPlayerToQueue,
        removePlayerFromQueue,
        getNextMatch,
        resetAll,
        updateFeeConfig,
        updatePlayerFees,
        markFeesAsPaid,
        markPlayerAsDonePlaying,
        markPlayersAsDonePlaying,
        isPlayerInQueue,
        // Sharing functions
        createShareableLink,
        stopSharing,
        isSharing,
        shareId,
        shareUrl,
        updateFirebaseQueue,
        setInitialSharingState,
        renameCourt,
        addCourt,
        removeCourt,
        syncToFirebase
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};