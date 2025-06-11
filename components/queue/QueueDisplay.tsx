'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { formatTime } from '@/lib/utils';
import { Player, Court, QueueItem as QueueItemType } from '@/types';
import { useToast } from '@/context/ToastContext';
import useModal from '@/hooks/useModal';
import Modal from '@/components/ui/Modal';
import { GiShuttlecock } from "react-icons/gi";
import { TbAlertTriangle } from "react-icons/tb";

interface QueueItemProps {
  queueItem: QueueItemType;
  index: number;
  availableCourts: Court[];
  onAssignMatch: (queueId: string, playerIds: string[], courtId?: number) => void;
  onRemoveFromQueue: (queueId: string) => void;
}

// New QueueItem component that manages its own modal
const QueueItem = ({ 
  queueItem, 
  index,
  availableCourts,
  onAssignMatch,
  onRemoveFromQueue 
}: QueueItemProps ) => {
  const alertModal = useModal();
  const warningModal = useModal(); // New modal for player already playing warning
  const { showToast } = useToast();
  const { state } = useData();
  const { players } = state;

  // State to track which players are already playing (for warning message)
  const [playersAlreadyPlaying, setPlayersAlreadyPlaying] = useState<Player[]>([]);

  const getOrderedPlayers = (playerIds: string[]): Player[] => {
    return playerIds
      .map(id => players.find(player => player.id === id))
      .filter((player): player is Player => player !== undefined);
  };

  // Check if any players are currently playing
  const checkPlayersAvailability = () => {
    const playingPlayers = getOrderedPlayers(queueItem.playerIds)
      .filter(player => player.currentlyPlaying);
    
    if (playingPlayers.length > 0) {
      setPlayersAlreadyPlaying(playingPlayers);
      warningModal.openModal();
      return false;
    }
    return true;
  };

  // Handle assignment with validation
  const handleAssignToCourt = (courtId?: number) => {
    if (checkPlayersAvailability()) {
      onAssignMatch(queueItem.id, queueItem.playerIds, courtId);
    }
  };

  const formatPlayerDisplay = () => {
    const queuedPlayers = getOrderedPlayers(queueItem.playerIds);
    
    if (queueItem.isDoubles && queuedPlayers.length === 4) {
      const team1 = queuedPlayers.slice(0, 2);
      const team2 = queuedPlayers.slice(2, 4);
      
      return (
        <div className="mb-5">
          <div className="flex items-center justify-center mt-2 mb-3 ">
            <div className="text-center sm:px-3 sm:py-2 py-2 px-2.5 bg-white rounded-md border border-gray-300 w-full">
              <div className="flex items-center justify-between capitalize sm:flex-row flex-row sm:gap-0.5 gap-2.5">
                <div className="text-sm font-medium text-blue-800 text-left">
                  <span className='block'>{team1[0].name} {team1[0].currentlyPlaying && <span className="text-xs text-red-500 ml-1">(Playing)</span>}</span>
                  <span className='block mt-1'>{team1[1].name} {team1[1].currentlyPlaying && <span className="text-xs text-red-500 ml-1">(Playing)</span>}</span>
                </div>
                <div className="text-xs px-2 py-1 bg-gray-200 text-[9px] rounded-full font-bold uppercase">vs</div>
                <div className="text-sm font-medium text-green-800 text-left">
                  <span className='block'>{team2[0].name} {team2[0].currentlyPlaying && <span className="text-xs text-red-500 ml-1">(Playing)</span>}</span>
                  <span className='block mt-1'>{team2[1].name} {team2[1].currentlyPlaying && <span className="text-xs text-red-500 ml-1">(Playing)</span>}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (!queueItem.isDoubles && queuedPlayers.length === 2) {
      return (
        <div className="mb-5">
          <div className="flex items-center justify-center mt-2 mb-3">
            <div className="text-center sm:px-3 sm:py-2 py-3 px-2.5 bg-white rounded-md border border-gray-300 w-full">
              <div className="flex items-center justify-between capitalize sm:flex-row flex-row">
                <div className="text-sm font-medium text-blue-800">
                  {queuedPlayers[0].name} 
                  {queuedPlayers[0].currentlyPlaying && <span className="text-xs text-red-500 ml-1">(Playing)</span>}
                </div>
                <div className="text-xs px-2 py-1 bg-gray-200 text-[9px] rounded-full font-bold uppercase">vs</div>
                <div className="text-sm font-medium text-green-800">
                  {queuedPlayers[1].name}
                  {queuedPlayers[1].currentlyPlaying && <span className="text-xs text-red-500 ml-1">(Playing)</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
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
                <span className={`${player.currentlyPlaying ? 'text-red-500 font-medium' : ''}`}>
                  {player.name} ({player.gamesPlayed} games)
                  {player.currentlyPlaying && ' (Playing)'}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="border rounded-md p-3 bg-[#ebf4ff] shadow-md">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="font-bold text-gray-700 mr-2">#{index + 1}</span>
          <span className="text-[13px]">
            {queueItem.isDoubles ? 'Doubles' : 'Singles'} Match
          </span>
        </div>
        <span className="text-xs text-gray-500 mt-[3px]">
          Requested {formatTime(queueItem.requestedTime)}
        </span>
      </div>
      
      {formatPlayerDisplay()}
      
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <label className="block text-[14px] text-gray-800 font-medium mb-2">
            Let&apos;s Play - Assign a Court:
          </label>
          <div className="flex flex-wrap gap-2">
            {availableCourts.map(court => (
              <button
                key={court.id}
                onClick={() => handleAssignToCourt(court.id)}
                                className="bg-blue-500 hover:bg-blue-600 border-b-[4px] border-b-blue-700 text-white py-1.5 px-3 rounded sm:text-sm text-[13px] cursor-pointer transition"
              >
                Court {court.id}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={alertModal.openModal} 
          className='text-gray-500 hover:text-red-800 text-sm sm:text-center text-left sm:px-2 px-0 sm:mt-0 mt-2 cursor-pointer'
        >
          Cancel match
        </button>
        
        {/* Warning Modal for players already playing */}
        <Modal
          isOpen={warningModal.isOpen}
          onClose={warningModal.closeModal}
          maxWidth="md"
          title="Players Already Playing"
        >
          <div className="overflow-y-auto">
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <TbAlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-700">
                    You can&apos;t assign this match to a court because the following players are already playing:
                  </p>
                  <ul className="mt-2 text-sm text-amber-700 list-disc list-inside">
                    {playersAlreadyPlaying.map(player => (
                      <li key={player.id}>{player.name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Please wait until these players finish their current match, or remove this match from the queue.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={warningModal.closeModal}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-1.5 px-4 rounded"
              >
                OK
              </button>
            </div>
          </div>
        </Modal>
        
        {/* Cancel Match Modal */}
        <Modal
          isOpen={alertModal.isOpen}
          onClose={alertModal.closeModal}
          maxWidth="md"
          showCloseButton={false}
        >
          <div className="overflow-y-auto flex items-center">
            Are you sure you want to cancel this match?
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={alertModal.closeModal}
              className="bg-gray-200 hover:bg-gray-400 text-gray-600 py-1.5 px-3 rounded mr-2"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onRemoveFromQueue(queueItem.id);
                alertModal.closeModal();
                showToast('Match cancelled', 'info');
              }}
              className="bg-[#e74c3c] text-white py-1.5 px-3 rounded"
            >
              Confirm
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

// Main QueueDisplay component
export default function QueueDisplay() {
  const { state, removePlayerFromQueue, assignToCourt } = useData();
  const { queue, courts } = state;
  const { showToast } = useToast();
  
  const availableCourts = courts.filter(court => court.status === 'available');
  
  const handleAssignMatch = (queueId: string, playerIds: string[], selectedCourtId?: number) => {
    const courtId = selectedCourtId || (availableCourts.length > 0 ? availableCourts[0].id : null);
    
    if (courtId) {
      const result = assignToCourt(courtId, playerIds);
      
      if (result.success) {
        removePlayerFromQueue(queueId);
        showToast(`Match assigned to Court ${courtId}`, 'success', 2500);
      }
      // Error case is handled in the QueueItem component with the warning modal
    } else {
      showToast('No courts available. Please wait for a court to become available.', 'error');
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-5">
      {queue.length > 0 && (
        <div className="flex justify-between items-center sm:mb-3 mb-2">
          <span className="text-sm text-gray-500">
            {queue.length} {queue.length === 1 ? 'match' : 'matches'} waiting
          </span>
        </div>
      )}
  
      {queue.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <GiShuttlecock size="3em" className="text-gray-600 mx-auto rotate-190" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No players in queue</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding players</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((queueItem, index) => (
            <QueueItem
              key={queueItem.id}
              queueItem={queueItem}
              index={index}
              availableCourts={availableCourts}
              onAssignMatch={handleAssignMatch}
              onRemoveFromQueue={removePlayerFromQueue}
            />
          ))}
        </div>
      )}
    </div>
  );
}