'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Player, Court, QueueItem, FeeConfig, MatchRecord } from '@/types';
import { initialAppState } from '@/lib/initialData';
import { 
  loadAppState, 
  saveAppState, 
  resetAllData, 
  resetCourts 
} from '@/lib/localStorage';
import {
  addPlayer,
  assignPlayersToCourt,
  markCourtAvailable,
  addToQueue,
  removeFromQueue,
  suggestNextMatch,
  generateId
} from '@/lib/utils';

interface DataContextType {
  state: AppState;
  addNewPlayer: (name: string, skillLevel: Player['skillLevel']) => void;
  assignToCourt: (courtId: number, playerIds: string[]) => void;
  completeMatch: (courtId: number) => void;
  addPlayerToQueue: (playerIds: string[], isDoubles: boolean) => void;
  removePlayerFromQueue: (queueId: string) => void;
  getNextMatch: () => QueueItem | null;
  resetAll: () => void;
  resetCourtsOnly: () => void;
  // Fee management functions
  updateFeeConfig: (newConfig: FeeConfig) => void;
  updatePlayerFees: (playerId: string, amount: number) => void;
  markFeesAsPaid: (playerId: string, amount: number) => void;
  markPlayerAsDonePlaying: (playerId: string) => void;
  markPlayersAsDonePlaying: (playerIds: string[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(initialAppState);
  const [isInitialized, setIsInitialized] = useState(false);

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

  // Player management
  const addNewPlayer = (name: string, skillLevel: Player['skillLevel']) => {
    setState(currentState => addPlayer(currentState, name, skillLevel));
  };

  // Court management
  const assignToCourt = (courtId: number, playerIds: string[]) => {
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
      
      // Update players
      const updatedPlayers = currentState.players.map(player => 
        playerIds.includes(player.id)
          ? { ...player, currentlyPlaying: true, inQueue: false }
          : player
      );
      
      return {
        ...currentState,
        courts: updatedCourts,
        players: updatedPlayers,
        gameSessions: [...currentState.gameSessions, newGameSession]
      };
    });
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
};

  // Queue management
  const addPlayerToQueue = (playerIds: string[], isDoubles: boolean) => {
    setState(currentState => addToQueue(currentState, playerIds, isDoubles));
  };

  const removePlayerFromQueue = (queueId: string) => {
    setState(currentState => removeFromQueue(currentState, queueId));
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
    setState(initialAppState);
  };

  const resetCourtsOnly = () => {
    setState(currentState => resetCourts(currentState));
  };

  // This is for marking a single player
  const markPlayerAsDonePlaying = (playerId: string) => {
    setState(currentState => {
      // Find the player
      const playerIndex = currentState.players.findIndex(p => p.id === playerId);
      
      if (playerIndex === -1) return currentState;
      
      // Check if player is available to be marked (not playing, not in queue)
      const player = currentState.players[playerIndex];
      if (player.currentlyPlaying || player.inQueue) {
        console.error("Cannot mark a player who is currently playing or in queue as done");
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

  // This is for marking multiple players at once
  const markPlayersAsDonePlaying = (playerIds: string[]) => {
    setState(currentState => {
      // Create a copy of players array
      const updatedPlayers = [...currentState.players];
      
      // Loop through all player IDs and mark them as done
      playerIds.forEach(playerId => {
        const playerIndex = updatedPlayers.findIndex(p => p.id === playerId);
        
        if (playerIndex !== -1) {
          const player = updatedPlayers[playerIndex];
          
          // Only mark if player is available
          if (!player.currentlyPlaying && !player.inQueue) {
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
        resetCourtsOnly,
        // Fee management
        updateFeeConfig,
        updatePlayerFees,
        markFeesAsPaid,
        markPlayerAsDonePlaying,
        markPlayersAsDonePlaying
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