'use client';

import AddToQueueForm from '@/components/queue/AddToQueueForm';
import QueueDisplay from '@/components/queue/QueueDisplay';
import MatchHistory from '@/components/history/MatchHistory'; // Import your MatchHistory component
import React, { useState } from 'react';
import { useData } from '@/context/DataContext';

const Queue = () => {
  const { state } = useData();
  const { queue } = state;
  
  // Add 'history' to the possible tab states
  const [activeTab, setActiveTab] = useState<'players' | 'queue' | 'history'>('players');

  return (
    <div className='space-y-8 px-3 sm:px-4'>
      
      
      {/* Custom Tab Menu - Updated with third tab */}
      <div className="flex border-b bg-white p-1 h-[42px] rounded-md justify-between items-center mb-0">
        <button
          className={`h-full sm:px-3 px-1.5 sm:text-sm text-[13px] focus:outline-none flex items-center gap-1.5 w-full cursor-pointer text-center justify-center ${
            activeTab === 'players' 
              ? 'bg-blue-500 text-white rounded-md' 
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('players')}
        >
          Players
        </button>
        <button
          className={`h-full sm:px-3 px-1.5 sm:text-sm text-[13px] focus:outline-none flex items-center gap-1.5 w-full cursor-pointer text-center justify-center ${
            activeTab === 'queue' 
              ? 'bg-blue-500 text-white rounded-md' 
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('queue')}
        >
          Queue {queue.length > 0 ? <span className="text-[11px] w-[16px] h-[16px] inline-flex items-center justify-center rounded-[59px] bg-red-500 text-white font-medium">{queue.length}</span> : ''}
        </button>
        <button
          className={`h-full sm:px-3 px-1.5 sm:text-sm text-[13px] focus:outline-none flex items-center gap-1.5 w-full cursor-pointer text-center justify-center ${
            activeTab === 'history' 
              ? 'bg-blue-500 text-white rounded-md' 
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('history')}
        >
          Match History
        </button>
      </div>
      
      {/* Tab Content - Updated with MatchHistory */}
      <div className="mt-4">
        {activeTab === 'players' && <AddToQueueForm /> }
        {activeTab === 'queue' && <QueueDisplay />}
        {activeTab === 'history' && <MatchHistory />}
      </div>
    </div>
  )
}

export default Queue;