'use client';

import AddToQueueForm from '@/components/queue/AddToQueueForm';
import AddPlayerForm from '@/components/players/AddPlayerForm';
import QueueDisplay from '@/components/queue/QueueDisplay';
import MatchHistory from '@/components/history/MatchHistory'; // Import your MatchHistory component
import useModal from '@/hooks/useModal';
import Modal from '@/components/ui/Modal';
import { MdPersonAdd } from "react-icons/md";
import React, { useState } from 'react';
import { useData } from '@/context/DataContext';

const Page = () => {
  const { state } = useData();
  const { queue } = state;

  const addPlayerModal = useModal();
  // Add 'history' to the possible tab states
  const [activeTab, setActiveTab] = useState<'players' | 'queue' | 'history'>('players');

  return (
    <div className='space-y-8 px-3 sm:px-4'>
      {/* Floating add player button */}
      <button
        onClick={addPlayerModal.openModal}
        className="fixed w-[55px] h-[55px] z-10 bottom-[15px] mb-4 shadow-2xl right-[20px] bg-blue-500 hover:bg-blue-600 cursor-pointer text-[22px] text-white rounded-[50px] flex items-center justify-center"
      >
        <MdPersonAdd/>
      </button>

      {/* Add Player Modal */}
      <Modal
        isOpen={addPlayerModal.isOpen}
        onClose={addPlayerModal.closeModal}
        title="New player"
        maxWidth="2xl"
      >
        <div className="max-h-[70vh] overflow-y-auto">
          <AddPlayerForm inModal={true} />
        </div>
      </Modal>
      
      {/* Custom Tab Menu - Updated with third tab */}
      <div className="flex border-b bg-white p-1 h-[40px] rounded-md justify-between items-center mb-0">
        <button
          className={`h-full px-3 text-sm focus:outline-none flex items-center gap-1.5 w-full cursor-pointer text-center justify-center ${
            activeTab === 'players' 
              ? 'bg-blue-500 text-white rounded-md' 
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('players')}
        >
          Players
        </button>
        <button
          className={`h-full px-3 text-sm focus:outline-none flex items-center gap-1.5 w-full cursor-pointer text-center justify-center ${
            activeTab === 'queue' 
              ? 'bg-blue-500 text-white rounded-md' 
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('queue')}
        >
          Queue {queue.length > 0 ? <span className="text-[11px] w-[16px] h-[16px] inline-flex items-center justify-center rounded-[59px] bg-red-500 text-white font-medium">{queue.length}</span> : ''}
        </button>
        <button
          className={`h-full px-3 text-sm focus:outline-none flex items-center gap-1.5 w-full cursor-pointer text-center justify-center ${
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
        {activeTab === 'players' && <AddToQueueForm />}
        {activeTab === 'queue' && <QueueDisplay />}
        {activeTab === 'history' && <MatchHistory />}
      </div>
    </div>
  )
}

export default Page;