'use client';

import AddToQueueForm from '@/components/queue/AddToQueueForm';
import QueueDisplay from '@/components/queue/QueueDisplay';
import MatchHistory from '@/components/history/MatchHistory';
import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { loadFromLocalStorage, saveToLocalStorage } from '@/lib/localStorage';

const Queue = () => {
  const { state } = useData();
  const { queue } = state;
  
  // Add 'history' to the possible tab states
  const [activeTab, setActiveTab] = useState<'players' | 'queue' | 'history'>('players');
  
  // State to control whether the notification should be shown
  const [showQueueNotification, setShowQueueNotification] = useState(true);
  
  // Load notification preference from localStorage on mount
  useEffect(() => {
    const savedPreference = loadFromLocalStorage('hideQueueNotification', false);
    setShowQueueNotification(!savedPreference);
  }, []);
  
  // Custom handler for tab changes that also manages notification state
  const handleTabChange = (tab: 'players' | 'queue' | 'history') => {
    setActiveTab(tab);
    
    // If switching to queue tab, hide the notification and save preference
    if (tab === 'queue' && showQueueNotification) {
      setShowQueueNotification(false);
      saveToLocalStorage('hideQueueNotification', true);
    }
  };
  
  return (
    <div className='space-y-8 px-3 sm:px-4'>
      
      {/* Custom Tab Menu - Updated with third tab */}
      <div className="flex border-b bg-white p-1 h-[45px] rounded-md justify-between items-center mb-0">
        <button
          className={`h-full sm:px-3 px-1.5 sm:text-sm text-[13.5px] focus:outline-none flex items-center gap-1.5 w-full cursor-pointer text-center justify-center ${
            activeTab === 'players' 
              ? 'bg-blue-500 text-white rounded-md' 
              : 'text-gray-600'
          }`}
          onClick={() => handleTabChange('players')}
        >
          Players
        </button>
        <button
          className={`h-full sm:px-3 px-1.5 sm:text-sm text-[13.5px] focus:outline-none flex items-center gap-1.5 w-full cursor-pointer text-center justify-center relative ${
            activeTab === 'queue' 
              ? 'bg-blue-500 text-white rounded-md' 
              : 'text-gray-600'
          }`}
          onClick={() => handleTabChange('queue')}
        >
          Queue {queue.length > 0 ? <span className="text-[11px] w-[16px] h-[16px] inline-flex items-center justify-center rounded-[59px] bg-red-500 text-white font-medium">{queue.length}</span> : ''}
          
          {/* Conditional message for players in queue */}
          {queue.length > 0 && showQueueNotification && (
            <span className='absolute text-[13px] text-white whitespace-nowrap mt-25 py-2 px-3 bg-red-500 rounded-md animate-bounce shadow shadow-gray-400'>
              You currently have players in queue
              <div className="absolute top-[-3px] left-1/2 -translate-y-1/2 w-0 h-0 border-y-9 -rotate-90 border-y-transparent border-l-9 border-l-red-500"></div>
            </span>
          )}
          
        </button>
        <button
          className={`h-full sm:px-3 px-1.5 sm:text-sm text-[13.5px] focus:outline-none flex items-center gap-1.5 w-full cursor-pointer text-center justify-center ${
            activeTab === 'history' 
              ? 'bg-blue-500 text-white rounded-md' 
              : 'text-gray-600'
          }`}
          onClick={() => handleTabChange('history')}
        >
          Match History
        </button>
      </div>
      
      {/* Tab Content - Updated with MatchHistory */}
      <div className="mt-4">
        {activeTab === 'players' && <AddToQueueForm /> }
        {activeTab === 'queue' && <QueueDisplay />}
        {activeTab === 'history' && <MatchHistory  />}
      </div>
    </div>
  )
}

export default Queue;