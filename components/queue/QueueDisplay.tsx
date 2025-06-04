'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import { formatTime } from '@/lib/utils';
import { Player } from '@/types';

export default function QueueDisplay() {
  const { state, removePlayerFromQueue, assignToCourt } = useData();
  const { queue, players, courts } = state;

  
  const availableCourts = courts.filter(court => court.status === 'available');
  
  const handleAssignMatch = (queueId: string, playerIds: string[], selectedCourtId?: number) => {
    // If a specific court is selected, use that. Otherwise use first available court
    const courtId = selectedCourtId || (availableCourts.length > 0 ? availableCourts[0].id : null);
    
    if (courtId) {
      assignToCourt(courtId, playerIds);
      removePlayerFromQueue(queueId);
    } else {
      alert('No courts available. Please wait for a court to become available.');
    }
  };
  
  // Helper function to get players in the exact order they were added
  const getOrderedPlayers = (playerIds: string[]): Player[] => {
    // Map over the playerIds to maintain exact order
    return playerIds
      .map(id => players.find(player => player.id === id))
      .filter((player): player is Player => player !== undefined);
  };
  
  // Format players with VS layout
  const formatPlayerDisplay = (queueItem: typeof queue[0]) => {
    // Get players in the exact same order as in playerIds
    const queuedPlayers = getOrderedPlayers(queueItem.playerIds);
    
    if (queueItem.isDoubles && queuedPlayers.length === 4) {
      // For doubles: Team 1 (first 2 players) vs Team 2 (last 2 players)
      const team1 = queuedPlayers.slice(0, 2);
      const team2 = queuedPlayers.slice(2, 4);
      
      return (
        <div className="mb-5">
          <div className="flex items-center justify-center mt-2 mb-3">
            <div className="text-center px-3 py-2 bg-blue-50 rounded-lg border border-blue-100 w-full">
              <div className="flex items-center justify-between capitalize">
                <div className="text-[15px] font-medium text-blue-800">
                  🏸 {team1[0].name} & {team1[1].name}
                </div>
                <div className="text-xs px-2 py-1 bg-gray-200 text-[9px] rounded-full font-bold">VS</div>
                <div className="text-[15px] font-medium text-green-800">
                  🏸 {team2[0].name} & {team2[1].name}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (!queueItem.isDoubles && queuedPlayers.length === 2) {
      // For singles: Player1 vs Player2
      return (
        <div className="mb-5">
          <div className="flex items-center justify-center mt-2 mb-3">
            <div className="text-center px-3 py-2 bg-blue-50 rounded-lg border border-blue-100 w-full">
              <div className="flex items-center justify-between capitalize">
                <div className="text-[15px] font-medium text-blue-800">
                  🏸 {queuedPlayers[0].name}
                </div>
                <div className="text-xs px-2 py-1 bg-gray-200 text-[9px] rounded-full font-bold">VS</div>
                <div className="text-[15px] font-medium text-green-800">
                  🏸 {queuedPlayers[1].name}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Fallback for unexpected player counts
      return (
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Players:</h4>
          <div className="grid grid-cols-2 gap-2">
            {queuedPlayers.map(player => (
              <div key={player.id} className="flex items-center text-sm">
                <span className="w-2 h-2 rounded-full mr-2" 
                  style={{
                    backgroundColor: 
                      player.skillLevel === 'beginner' ? '#4ade80' :
                      player.skillLevel === 'intermediate' ? '#facc15' : '#f87171'
                  }}
                ></span>
                {player.name} ({player.gamesPlayed} games)
              </div>
            ))}
          </div>
        </div>
      );
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-5">
      {queue.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500">
            {queue.length} {queue.length === 1 ? 'match' : 'matches'} waiting
          </span>
        </div>
      )}
  
      {queue.length === 0 ? (
        <div className='p-4 bg-gray-50 rounded-md text-center'>
          <p className="text-gray-500 italic text-center text-[12px] sm:text-sm">No players in queue</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((queueItem, index) => {
            return (
              <div key={queueItem.id} className="border rounded-md p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="inline-block bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full mr-2">
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium">
                      {queueItem.isDoubles ? 'Doubles' : 'Singles'} Match
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    Requested at {formatTime(queueItem.requestedTime)}
                  </span>
                </div>
                
                {formatPlayerDisplay(queueItem)}
                
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Court Assignment Options */}
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Assign to Court:</label>
                    <div className="flex flex-wrap gap-2">
                      {availableCourts.map(court => (
                        <button
                          key={court.id}
                          onClick={() => handleAssignMatch(queueItem.id, queueItem.playerIds, court.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-sm cursor-pointer transition"
                        >
                          Court {court.id}
                        </button>
                      ))}
                      {availableCourts.length === 0 && (
                        <span className="text-xs text-gray-500 italic">No courts available</span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removePlayerFromQueue(queueItem.id)}
                    className="text-red-500 hover:text-red-800 text-sm py-1 px-3 cursor-pointer"
                  >
                    Cancel match
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}