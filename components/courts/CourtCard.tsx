'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Court, Player } from '@/types';
import { formatTime } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { useData } from '@/context/DataContext';
import { IoPersonAddSharp } from "react-icons/io5";
import { HiOutlinePencilAlt } from "react-icons/hi";

interface CourtCardProps {
  court: Court;
  players: Player[];
  onComplete: () => void;
}

export default function CourtCard({ court, players, onComplete }: CourtCardProps) {
  const [showDetails, setshowDetails] = useState(false);
  const [isCompleteMatch, setisCompleteMatch] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

  const { showToast } = useToast();
  const { renameCourt } = useData(); // Get the renameCourt function

  const handleCompleteMatch = async () => {
    setisCompleteMatch(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      await onComplete();
    } catch (error) {
      console.error('Error completing match:', error);
    } finally {
      setisCompleteMatch(false);
      showToast('Well Played!', 'success', 3000);
    }

    setshowDetails(false)
  }

  // Important: Preserve the exact order of players as in court.players array
  const currentPlayers = court.players.map(playerId => 
    players.find(player => player.id === playerId)
  ).filter((player): player is Player => player !== undefined);
  
  // Add state for elapsed time
  const [elapsedTime, setElapsedTime] = useState({ minutes: 0, seconds: 0 });
  
  // Update elapsed time every second
  useEffect(() => {
    // Only set up timer if court is occupied
    if (court.status !== 'occupied' || !court.startTime) {
      return;
    }
    
    const calculateTime = () => {
      const startTime = new Date(court.startTime as string).getTime();
      const now = new Date().getTime();
      const diffMs = now - startTime;
      
      const minutes = Math.floor(diffMs / 60000); // Convert ms to minutes
      const seconds = Math.floor((diffMs % 60000) / 1000); // Remaining seconds
      
      setElapsedTime({ minutes, seconds });
    };
    
    // Calculate initial time
    calculateTime();
    
    // Set up interval to update every second
    const intervalId = setInterval(calculateTime, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [court.status, court.startTime]);
  
  // Format player display with VS
  const formatPlayerVsDisplay = () => {
    if (court.isDoubles && currentPlayers.length === 4) {
      // Doubles: Team 1 (first 2 players) vs Team 2 (last 2 players)
      const team1 = currentPlayers.slice(0, 2);
      const team2 = currentPlayers.slice(2, 4);
      
      return (
        <div className="mb-4 px-2 py-2 bg-white rounded-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-blue-800 capitalize">
              {team1[0].name} & {team1[1].name}
            </div>
            <div className="text-xs px-2 py-1 bg-gray-200 text-[9px] rounded-full font-bold">VS</div>
            <div className="text-sm font-medium text-red-800 capitalize">
              {team2[0].name} & {team2[1].name}
            </div>
          </div>
        </div>
      );
    } else if (!court.isDoubles && currentPlayers.length === 2) {
      // Singles: Player 1 vs Player 2
      return (
        <div className="mb-4 px-2 py-2 bg-white rounded-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-blue-800 capitalize">
              {currentPlayers[0].name}
            </div>
            <div className="text-xs px-2 py-1 bg-gray-200 text-[9px] rounded-full font-bold">VS</div>
            <div className="text-sm font-medium text-red-800 capitalize">
              {currentPlayers[1].name}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  
  // Format time for display with leading zeros
  const formatTimeValue = (value: number): string => {
    return value < 10 ? `0${value}` : `${value}`;
  };

  // Updated rename court function that uses the context
  const handleRenameCourt = () => {
    setIsRenaming(true);
    // Use the current name as default value in prompt
    const newCourtName = prompt('Enter new court name:', court.name || `Court ${court.id}`);
    
    if (newCourtName && newCourtName.trim() !== '') {
      // Call the context function to update the name in state
      renameCourt(court.id, newCourtName.trim());
      showToast(`Court renamed to: ${newCourtName.trim()}`, 'success', 3000);
    }
    setIsRenaming(false);
  };
  
  return (
    <div className={`relative z-1 sm:p-4 p-3 h-full flex flex-col rounded-lg bg-[rgba(0,0,0,0.54)] min-h-[195px] sm:min-h-[232px] border border-[#3d3131]
      ${court.status === 'available' ? 'bg-[#262626]' : 'bg-amber-50'}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className={`text-[15px] font-bold flex items-center gap-1
          ${court.status === 'available' ? 'text-white' : 'text-[#262626]'}`}>
          {court.name || `Court #${court.id}`}
          <button 
            className={`ml-1 hover:text-blue-500 ${isRenaming ? 'opacity-50' : ''}`} 
            onClick={handleRenameCourt}
            disabled={isRenaming}
          >
            <HiOutlinePencilAlt className="w-4 h-4" />
          </button>
        </h3>
        <span className={`px-2 py-1 rounded-[50px] text-[10px] border ${court.status === 'available' ? 'text-[#04c951] border-[#04c951] bg-[#210606]' : 'text-[#fd9a01] border-[#fd9a01]'}`}>
          {court.status.toUpperCase()}
        </span>
      </div>
      
      {/* Rest of your component stays the same */}
      {court.status === 'occupied' && (
        <>
          <div className="mb-2">
            <p className="text-sm font-medium">
              <span className="font-normal">Game Type:</span> {court.isDoubles ? 'Doubles' : 'Singles'}
            </p>
            <p className="text-sm font-medium">
              <span className="font-normal">Start Time:</span> {formatTime(court.startTime)}
            </p>
            
            <p className="text-sm font-bold">
              <span className="font-normal">Elapsed Time:</span> {formatTimeValue(elapsedTime.minutes)}:{formatTimeValue(elapsedTime.seconds)}
            </p>
          </div>
          
          {/* VS Display */}
          {formatPlayerVsDisplay()}
          
          {
            showDetails && (
              <div className="mb-3">
                <h4 className="text-sm font-medium mb-1">All Players:</h4>
                <ul className="text-sm pl-2">
                  {currentPlayers.map(player => (
                    <li key={player.id} className="mb-1 flex items-center">
                      <span className="w-3 h-3 rounded-full mr-2" 
                        style={{
                          backgroundColor: 
                            player.skillLevel === 'beginner' ? '#4ade80' :
                            player.skillLevel === 'intermediate' ? '#facc15' : '#f87171'
                        }}
                      ></span>
                      {player.name} - {player.skillLevel}
                    </li>
                  ))}
                </ul>
              </div>
            )
          }
          
          <button
            onClick={handleCompleteMatch}
            disabled={isCompleteMatch}
            className="mt-auto bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm cursor-pointer"
          >
            {isCompleteMatch ? 'Completing...' : 'Complete Match'}
          </button>
        </>
      )}
      {court.status === 'available' && (
        <>
          <div className="flex items-center justify-center flex-col mt-[20px] sm:mt-[32px]">
            <p className="text-gray-500 text-sm mb-4">Add players to start the game</p>
            <Link href='/players'
              type="submit"
              className="bg-blue-500 text-[13px] hover:bg-blue-600 text-white gap-1.5 py-1.5 px-3 rounded w-auto cursor-pointer flex items-center justify-center transition relative
                border-b-[4px] border-b-blue-700 hover:border-b-blue-800 active:border-b-blue-900 active:translate-y-[2px]"
            >
              <><IoPersonAddSharp /> Add Players</>
            </Link>
          </div>

          <div className='court-sideline-left'></div>
          <div className="net-court-line"></div>
          <div className='court-sideline-right'></div>
          <div className='court-topline'></div>
          <div className='court-bottomline'></div>
        </>
      )}
    </div>
  );
}