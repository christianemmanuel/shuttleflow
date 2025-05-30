'use client';

import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { formatTime } from '@/lib/utils';

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
  
  // Format players with VS layout
  const formatPlayerDisplay = (queueItem: typeof queue[0], queuedPlayers: typeof players) => {
    if (queueItem.isDoubles && queuedPlayers.length === 4) {
      // For doubles: Player1 & Player2 vs Player3 & Player4
      return (
        <div className="mb-3">
          <div className="flex items-center justify-center mt-2 mb-3">
            <div className="text-center px-3 py-2 bg-blue-50 rounded-lg border border-blue-100 w-full">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-blue-800">
                  {queuedPlayers[0].name} & {queuedPlayers[1].name}
                </div>
                <div className="text-xs px-2 py-1 bg-gray-200 rounded-full font-bold">VS</div>
                <div className="text-sm font-medium text-red-800">
                  {queuedPlayers[2].name} & {queuedPlayers[3].name}
                </div>
              </div>
            </div>
          </div>
          
          <h4 className="text-sm font-medium mb-1">Player Details:</h4>
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
    } else if (!queueItem.isDoubles && queuedPlayers.length === 2) {
      // For singles: Player1 vs Player2
      return (
        <div className="mb-3">
          <div className="flex items-center justify-center mt-2 mb-3">
            <div className="text-center px-3 py-2 bg-blue-50 rounded-lg border border-blue-100 w-full">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-blue-800">
                  {queuedPlayers[0].name}
                </div>
                <div className="text-xs px-2 py-1 bg-gray-200 rounded-full font-bold">VS</div>
                <div className="text-sm font-medium text-red-800">
                  {queuedPlayers[1].name}
                </div>
              </div>
            </div>
          </div>
          
          <h4 className="text-sm font-medium mb-1">Player Details:</h4>
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
      
      {/* Court Assignment Section */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-md font-semibold mb-2">Available Courts</h4>
        {availableCourts.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {availableCourts.map(court => (
              <div key={court.id} className="px-3 py-1 bg-green-100 rounded-md text-green-800 text-sm">
                Court #{court.id}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-amber-600">No courts currently available</p>
        )}
      </div>
      
      {queue.length === 0 ? (
        <p className="text-gray-500 italic text-[12px] text-center">No players in queue</p>
      ) : (
        <div className="space-y-3">
          {queue.map((queueItem, index) => {
            const queuedPlayers = players.filter(player => queueItem.playerIds.includes(player.id));
            
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
                
                {formatPlayerDisplay(queueItem, queuedPlayers)}
                
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Court Assignment Options */}
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Assign to Court:</label>
                    <div className="flex flex-wrap gap-2">
                      {availableCourts.map(court => (
                        <button
                          key={court.id}
                          onClick={() => handleAssignMatch(queueItem.id, queueItem.playerIds, court.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-sm"
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
                    className="text-red-600 hover:text-red-800 text-sm py-1 px-3"
                  >
                    Remove
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