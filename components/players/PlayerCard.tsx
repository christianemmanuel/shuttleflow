'use client';

import React from 'react';
import { Player } from '@/types';

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  // Get status label
  const getStatusLabel = () => {
    if (player.currentlyPlaying) return 'Playing';
    if (player.inQueue) return 'In Queue';
    return 'Available';
  };
  
  // Get status color
  const getStatusColor = () => {
    if (player.currentlyPlaying) return 'bg-blue-100 text-blue-800';
    if (player.inQueue) return 'bg-purple-100 text-purple-800';
    return 'bg-green-100 text-green-800';
  };

  // Get skill level color
  const getSkillLevelColor = () => {
    switch (player.skillLevel) {
      case 'beginner':
        return 'bg-green-500';
      case 'intermediate':
        return 'bg-yellow-500';
      case 'advanced':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <div className="bg-white border rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-lg font-semibold">{player.name}</h4>
        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor()}`}>
          {getStatusLabel()}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center">
          <span className="text-sm text-gray-600 w-24">Skill Level:</span>
          <div className="flex items-center">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getSkillLevelColor()}`}></span>
            <span className="text-sm">
              {player.skillLevel.charAt(0).toUpperCase() + player.skillLevel.slice(1)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-600 w-24">Games Played:</span>
          <span className="text-sm">{player.gamesPlayed}</span>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-600 w-24">Total Fees:</span>
          <span className="text-sm">${player.totalFees.toFixed(2)}</span>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-600 w-24">Unpaid Fees:</span>
          <span className={`text-sm ${player.unpaidFees > 0 ? 'text-red-600 font-medium' : ''}`}>
            ${player.unpaidFees.toFixed(2)}
          </span>
        </div>
      </div>
      
      {/* Fee history preview - just showing count */}
      {player.feeHistory.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <span className="text-xs text-gray-500">
            Fee history: {player.feeHistory.length} transactions
          </span>
        </div>
      )}
    </div>
  );
}