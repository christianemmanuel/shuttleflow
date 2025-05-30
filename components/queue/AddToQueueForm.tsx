'use client';

import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';

export default function AddToQueueForm() {
  const { state, addPlayerToQueue, markPlayersAsDonePlaying } = useData();
  const { players, feeConfig } = state;
  
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [gameType, setGameType] = useState<'singles' | 'doubles'>('singles');
  const [showDonePlayers, setShowDonePlayers] = useState(false);
  
  // Modal state
  const [showFeeWarning, setShowFeeWarning] = useState(false);
  const [skipFeeWarning, setSkipFeeWarning] = useState(false);
  
  // Load the skip warning preference from localStorage on component mount
  useEffect(() => {
    const skipWarning = localStorage.getItem('skipFeeWarning');
    if (skipWarning === 'true') {
      setSkipFeeWarning(true);
    }
  }, []);
  
  // Get available players (not playing, not in queue, not done playing)
  const availablePlayers = players.filter(player => 
    !player.currentlyPlaying && 
    !player.inQueue && 
    (showDonePlayers || !player.donePlaying)
  );
  
  // Count players who are marked as done playing
  const donePlayersCount = players.filter(player => 
    !player.currentlyPlaying && 
    !player.inQueue && 
    player.donePlaying
  ).length;
  
  // Check if fee configuration is zero
  const hasFeeConfigured = feeConfig.singlesFee > 0 || feeConfig.doublesFee > 0;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if we have the right number of players
    if ((gameType === 'singles' && selectedPlayers.length !== 2) || 
        (gameType === 'doubles' && selectedPlayers.length !== 4)) {
      alert(`Please select ${gameType === 'singles' ? '2' : '4'} players for a ${gameType} game.`);
      return;
    }
    
    // Check if fee warning should be shown
    if (!hasFeeConfigured && !skipFeeWarning) {
      setShowFeeWarning(true);
      return;
    }
    
    // If fee is configured or warning is skipped, proceed with adding to queue
    addToQueue();
  };
  
  // Function to actually add players to queue (after fee warning if needed)
  const addToQueue = () => {
    addPlayerToQueue(selectedPlayers, gameType === 'doubles');
    setSelectedPlayers([]);
    setShowFeeWarning(false);
  };
  
  // Handle confirming the fee warning
  const handleConfirmFeeWarning = (rememberChoice: boolean) => {
    if (rememberChoice) {
      localStorage.setItem('skipFeeWarning', 'true');
      setSkipFeeWarning(true);
    }
    addToQueue();
  };
  
  const handlePlayerSelect = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    } else {
      // Check if we're at the limit based on game type
      if ((gameType === 'singles' && selectedPlayers.length < 2) || 
          (gameType === 'doubles' && selectedPlayers.length < 4)) {
        setSelectedPlayers([...selectedPlayers, playerId]);
      }
    }
  };
  
  // Mark selected players as "done playing"
  const handleDonePlaying = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (selectedPlayers.length === 0) {
      return;
    }
    
    // Mark all selected players as done playing
    markPlayersAsDonePlaying(selectedPlayers);
    
    // Reset selected players
    setSelectedPlayers([]);
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Add to Queue</h3>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Game Type Selection */}
        <div className="mb-4 flex items-center">
          <label className="block text-sm font-medium">Game Type</label>
          <div className="flex space-x-3 ml-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="gameType"
                checked={gameType === 'singles'}
                onChange={() => {
                  setGameType('singles');
                  setSelectedPlayers([]); // Reset selected players
                }}
                className="mr-1"
              />
              Singles
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="gameType"
                checked={gameType === 'doubles'}
                onChange={() => {
                  setGameType('doubles');
                  setSelectedPlayers([]); // Reset selected players
                }}
                className="mr-1"
              />
              Doubles
            </label>
          </div>
        </div>
        
        {/* Show/Hide Done Players Toggle */}
        {donePlayersCount > 0 && (
          <div className="mb-3 p-2 bg-gray-50 rounded-md">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={showDonePlayers}
                onChange={() => {
                  setShowDonePlayers(!showDonePlayers);
                  setSelectedPlayers([]); // Reset selections when changing filter
                }}
                className="mr-2"
              />
              Show players marked as "done playing" ({donePlayersCount} players)
            </label>
          </div>
        )}

        
        {/* Player Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Select Players ({selectedPlayers.length}/{gameType === 'singles' ? 2 : 4})
          </label>
          
          {availablePlayers.length === 0 ? (
            <div className="p-4 bg-gray-50 rounded-md text-center">
              <p className="text-gray-500 italic">No available players found</p>
              {!showDonePlayers && donePlayersCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowDonePlayers(true)}
                  className="mt-2 text-blue-500 text-sm hover:text-blue-700"
                >
                  Show players marked as "done playing"
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {availablePlayers.map(player => (
                <div 
                  key={player.id}
                  onClick={() => handlePlayerSelect(player.id)}
                  className={`p-2 border rounded-md cursor-pointer
                    ${selectedPlayers.includes(player.id) 
                      ? 'bg-blue-100 border-blue-300' 
                      : 'hover:bg-gray-100'
                    } 
                    ${player.donePlaying ? 'border-l-4 border-l-gray-400 bg-gray-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full mr-2" 
                        style={{
                          backgroundColor: 
                            player.skillLevel === 'beginner' ? '#4ade80' :
                            player.skillLevel === 'intermediate' ? '#facc15' : '#f87171'
                        }}
                      ></span>
                      <span className={player.donePlaying ? 'text-gray-500' : ''}>
                        {player.name}
                      </span>
                    </div>
                    
                    {player.donePlaying && (
                      <span className="text-xs bg-gray-200 text-gray-700 px-1 py-0.5 rounded">
                        Done
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 ml-5">
                    Games: {player.gamesPlayed}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={
              selectedPlayers.length === 0 || 
              (gameType === 'singles' && selectedPlayers.length !== 2) || 
              (gameType === 'doubles' && selectedPlayers.length !== 4)
            }
            className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add to Queue
          </button>

          <button
            type="button"
            onClick={handleDonePlaying}
            disabled={selectedPlayers.length === 0}
            className="text-red-500 py-2 px-4 rounded disabled:text-gray-300 disabled:cursor-not-allowed ml-auto"
          >
            Exit Game
          </button>
        </div>
      </form>
      
      {/* Fee Warning Modal */}
      {showFeeWarning && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 mx-4">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 mr-3">
                <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-900">Fees not set. Add players with no charges?</h3>
              </div>
            </div>
            
            <div className="mt-2">
              <label className="flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  className="mr-2"
                  onChange={(e) => setSkipFeeWarning(e.target.checked)}
                />
                Don't show this warning again
              </label>
            </div>
            
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded"
                onClick={() => setShowFeeWarning(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded"
                onClick={() => handleConfirmFeeWarning(skipFeeWarning)}
              >
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}