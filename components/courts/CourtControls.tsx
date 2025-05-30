'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';

export default function CourtControls() {
  const { state, assignToCourt } = useData();
  const { courts, players } = state;
  
  const [selectedCourt, setSelectedCourt] = useState<number | ''>('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [gameType, setGameType] = useState<'singles' | 'doubles'>('singles');
  
  const availableCourts = courts.filter(court => court.status === 'available');
  const availablePlayers = players.filter(player => !player.currentlyPlaying && !player.inQueue);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourt) return;
    
    // Check if we have the right number of players
    if ((gameType === 'singles' && selectedPlayers.length !== 2) || 
        (gameType === 'doubles' && selectedPlayers.length !== 4)) {
      alert(`Please select ${gameType === 'singles' ? '2' : '4'} players for a ${gameType} game.`);
      return;
    }
    
    assignToCourt(Number(selectedCourt), selectedPlayers);
    
    // Reset form
    setSelectedCourt('');
    setSelectedPlayers([]);
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
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-5">
      <h3 className="text-lg font-bold mb-4">Manual Court Assignment</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Court Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Select Court</label>
            <select
              value={selectedCourt}
              onChange={(e) => setSelectedCourt(Number(e.target.value))}
              className="w-full border rounded-md px-3 py-2"
              required
            >
              <option value="">Select a court</option>
              {availableCourts.map(court => (
                <option key={court.id} value={court.id}>
                  Court {court.id}
                </option>
              ))}
            </select>
          </div>
          
          {/* Game Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Game Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gameType"
                  checked={gameType === 'singles'}
                  onChange={() => {
                    setGameType('singles');
                    setSelectedPlayers([]); // Reset selected players
                  }}
                  className="mr-2"
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
                  className="mr-2"
                />
                Doubles
              </label>
            </div>
          </div>
        </div>
        
        {/* Player Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Select Players ({selectedPlayers.length}/{gameType === 'singles' ? 2 : 4})
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {availablePlayers.map(player => (
              <div 
                key={player.id}
                onClick={() => handlePlayerSelect(player.id)}
                className={`p-2 border rounded-md cursor-pointer ${
                  selectedPlayers.includes(player.id) 
                    ? 'bg-blue-100 border-blue-300' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full mr-2" 
                    style={{
                      backgroundColor: 
                        player.skillLevel === 'beginner' ? '#4ade80' :
                        player.skillLevel === 'intermediate' ? '#facc15' : '#f87171'
                    }}
                  ></span>
                  <span>{player.name}</span>
                </div>
                <div className="text-xs text-gray-500 ml-5">
                  Games: {player.gamesPlayed}
                </div>
              </div>
            ))}
          </div>
          {availablePlayers.length === 0 && (
            <p className="text-gray-500 italic mt-2">No available players</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={!selectedCourt || selectedPlayers.length === 0}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Assign to Court
        </button>
      </form>
    </div>
  );
}