'use client';

import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import useModal from '@/hooks/useModal';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/context/ToastContext';

import { LuUserSearch } from "react-icons/lu";
import { GiShuttlecock } from "react-icons/gi";
import { MdRadioButtonChecked, MdRadioButtonUnchecked } from "react-icons/md";
import { TbAlertTriangle } from "react-icons/tb";

import AddPlayerForm from '@/components/players/AddPlayerForm';

export default function AddToQueueForm() {
  const { state, addPlayerToQueue, markPlayersAsDonePlaying } = useData();
  const { players, feeConfig, queue } = state;
  
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [gameType, setGameType] = useState<'singles' | 'doubles'>('doubles');
  const [showDonePlayers, setShowDonePlayers] = useState(false);

  const { showToast } = useToast();
  
  // Modal state
  const [showFeeWarning, setShowFeeWarning] = useState(false);
  const [skipFeeWarning, setSkipFeeWarning] = useState(false);
  // Player search state
  const [search, setSearch] = useState('');

  const alertModal = useModal();
  const alertModalDonePlay = useModal();
  
  // Load the skip warning preference from localStorage on component mount
  useEffect(() => {
    const skipWarning = localStorage.getItem('skipFeeWarning');
    if (skipWarning === 'true') {
      setSkipFeeWarning(true);
    } else {
      setSkipFeeWarning(false);
    }
  }, []);
  
  // Get available players (not playing, not in queue, not done playing)
  const availablePlayers = players.filter(player => 
    !player.currentlyPlaying && 
    !player.inQueue && 
    (showDonePlayers || !player.donePlaying)
  );

  // Filter by search
  const filteredPlayers = availablePlayers.filter(player =>
    player.name.toLowerCase().includes(search.trim().toLowerCase())
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
      alertModal.openModal()
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
    // For doubles, we want to preserve the team structure
    // The order matters: first 2 players are Team 1, last 2 are Team 2
    addPlayerToQueue(selectedPlayers, gameType === 'doubles');
    setSelectedPlayers([]);
    setShowFeeWarning(false);

    showToast(`Smash time! ${queue.length + 1} ${queue.length + 1 > 1 ? 'matches' : 'match'} waiting!`, 'success', 4000);
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
      // If removing a player, maintain team structure by removing from appropriate team
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    } else {
      // Check if we're at the limit based on game type
      if ((gameType === 'singles' && selectedPlayers.length < 2) || 
          (gameType === 'doubles' && selectedPlayers.length < 4)) {
        setSelectedPlayers([...selectedPlayers, playerId]);
      }
    }
  };
  
  // Get which team a player belongs to (0 = none, 1 = team 1, 2 = team 2)
  const getPlayerTeam = (playerId: string): number => {
    if (!selectedPlayers.includes(playerId)) return 0;
    
    const index = selectedPlayers.indexOf(playerId);
    if (index < 2) return 1;
    return 2;
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

    alertModalDonePlay.closeModal();
    showToast('Remove player successfully', 'info');
  };
  
  return (
    <>
      <AddPlayerForm />

      <div className="bg-white p-4 rounded-lg shadow-md mb-5">
        <form onSubmit={handleSubmit}>
          {availablePlayers.length >= 1 && (
            <>
              <h5 className={`font-medium mb-3 text-center ${availablePlayers.length <= 1 ? `text-[#894b00]` : `text-gray-700`}`}>{availablePlayers.length <= 1 ? `Only ${availablePlayers.length} player added. Please add more.` : 'Players are ready. Start the game!'}</h5>
              {/* Search Player Form */}
              <div className="mb-4 relative">
                <LuUserSearch className="absolute left-3 text-[16px] top-[10.5px] text-gray-500" />
                <input
                  type="text"
                  className="w-full border border-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 pl-8"
                  placeholder={`Search available players by name`}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </>
          )}
          
          {filteredPlayers.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <GiShuttlecock size="3em" className="text-gray-600 mx-auto rotate-190" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No available players</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding players</p>
            </div>
          ) : (
            <>
              {/* Game Type Selection */}
              <div className="mb-5 flex items-center">
                <label htmlFor="doubles" className="text-[13px] text-gray-800 block mr-3 whitespace-nowrap">Game type:</label>
                <div className="flex space-x-3 ml-0 sm:ml-4 gap-3 w-full sm:w-auto">
                  <label className={`flex items-center mr-0 px-5 h-[36px] text-[12px] gap-[.25rem] rounded-[50px] cursor-pointer bg-gray-100 text-gray-800 w-full sm:w-auto justify-center border-b-[2px] border-b-gray-200 ${gameType === 'doubles' && '!bg-green-200 text-green-800 border-b-green-600'}`}>
                    <input
                      type="radio"
                      name="gameType"
                      id="doubles"
                      checked={gameType === 'doubles'}
                      onChange={() => {
                        setGameType('doubles');
                        setSelectedPlayers([]); // Reset selected players
                      }}
                      className="hidden"
                    />
                    {gameType === 'doubles' ? <MdRadioButtonChecked size={`1.2em`} />  : <MdRadioButtonUnchecked size={`1.2em`} /> } <span>Doubles</span>
                  </label>

                  <label htmlFor="singles" className={`flex items-center px-5 h-[36px] text-[12px] gap-[.25rem] rounded-[50px] cursor-pointer bg-gray-100 text-gray-800 w-full sm:w-auto justify-center border-b-[2px] border-b-gray-200 ${gameType === 'singles' && '!bg-yellow-200 text-yellow-800 border-b-yellow-600'}`}>
                    <input
                      type="radio"
                      name="gameType"
                      id='singles'
                      checked={gameType === 'singles'}
                      onChange={() => {
                        setGameType('singles');
                        setSelectedPlayers([]); // Reset selected players
                      }}
                      className="hidden"
                    />
                    {gameType === 'singles' ? <MdRadioButtonChecked size={`1.2em`} />  : <MdRadioButtonUnchecked size={`1.2em`} /> } <span>Singles</span>
                  </label>
                </div>
              </div>
            
              {donePlayersCount > 0 && (
                <div className="mb-3 p-2 bg-gray-50 rounded-md hidden">
                  <label className="flex items-center text-[13px] text-gray-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showDonePlayers}
                      onChange={() => {
                        setShowDonePlayers(!showDonePlayers);
                        setSelectedPlayers([]);
                      }}
                      className="sr-only" // hides the default checkbox
                    />
                    
                    {/* Custom toggle switch */}
                    <div className={`relative min-w-[32px] h-[20px] rounded-full mr-2 transition-colors duration-200 ease-in-out ${showDonePlayers ? 'bg-blue-500' : 'bg-gray-300'}`}>
                      <div className={`absolute w-[16px] h-[16px] bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${showDonePlayers ? 'translate-x-[13px]' : 'translate-x-[2.5px]'}`} style={{ top: '2px' }}></div>
                    </div>
                    
                    <span>Show done playing</span>
                  </label>
                </div>
              )}
              
              {/* Player Selection */}
              <div className="mb-4">          
                <div className={`grid ${availablePlayers.length <= 1 ? 'grid-cols-`' : 'grid-cols-2'} sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2`}>
                  {filteredPlayers.map(player => {
                    const teamNumber = getPlayerTeam(player.id);
                    const teamColor = teamNumber === 1 ? 'bg-blue-100 border-blue-300' : 
                                      teamNumber === 2 ? 'bg-red-100 border-red-300' : '';
                    
                    return (
                      <div 
                        key={player.id}
                        onClick={() => handlePlayerSelect(player.id)}
                        className={`px-2 py-1.5 border rounded-md cursor-pointer capitalize shadow-md
                          ${teamColor}
                          ${!selectedPlayers.includes(player.id) && 'hover:bg-gray-100'} 
                          ${player.donePlaying ? 'bg-gray-50 pointer-events-none border-gray-300 shadow-none' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="w-2 sm:w-3 h-2 sm:h-3 rounded-full mr-1.5 sm:mr-2" 
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
                            <div className="flex items-center">
                              <span className="text-xs bg-gray-200 text-gray-700 px-1 py-0.5 rounded">
                                Done
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 ml-3.5 sm:ml-5">
                          Games: {player.gamesPlayed}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex space-x-4 sm:flex-row justify-between flex-col sm:gap-0 gap-2 pt-0 sm:pt-2">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2.5 px-5 rounded-md cursor-pointer flex items-center justify-center transition relative
              border-b-[4px] border-b-blue-700 hover:border-b-blue-800 active:border-b-blue-900 active:translate-y-[2px] w-full sm:w-auto"
                >
                  Add to Queue
                </button>

                <button
                  type="button"
                  onClick={alertModalDonePlay.openModal}
                  disabled={selectedPlayers.length === 0}
                  className="text-gray-500 py-1 px-2 rounded disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                  Done playing
                </button>
              </div>

              <Modal
                isOpen={alertModalDonePlay.isOpen}
                onClose={alertModalDonePlay.closeModal}
                maxWidth="md"
                showCloseButton={false}
              >
                <div className="overflow-y-auto flex items-center">
                  Are you sure you want to remove {selectedPlayers.length === 1 ? 'this' : 'those'} player?
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={alertModalDonePlay.closeModal}
                    className="bg-gray-200 hover:bg-gray-400 text-gray-600 py-1.5 px-3 rounded mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDonePlaying}
                    className="bg-[#e74c3c] text-white py-1.5 px-3 rounded"
                  >
                    Confirm
                  </button>
                </div>
              </Modal>

              <Modal
                isOpen={alertModal.isOpen}
                onClose={alertModal.closeModal}
                title="Hi, Queue Master!"
                maxWidth="md"
              >
                <div className="max-h-[70vh] overflow-y-auto flex items-center">
                  Please select {gameType === 'singles' ? '2' : '4'} players for a {gameType} game.
                </div>
              </Modal>
            </>
          )}
        </form>
        
        {/* Fee Warning Modal */}
        {showFeeWarning && (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 sm:mx-4 mx-3">
              <div className="flex mb-4 items-center">
                <div className="flex-shrink-0 mr-2 sm:mr-3">
                  <TbAlertTriangle className='text-amber-500' size={`1.3rem`} />
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
                  Don&apos;t show this warning again
                </label>
              </div>
              
              <div className="sm:mt-4 mt-7 flex justify-end space-x-3">
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
    </>
  );
}