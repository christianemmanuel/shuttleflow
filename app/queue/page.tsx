'use client';

import AddToQueueForm from '@/components/queue/AddToQueueForm';
import AddPlayerForm from '@/components/players/AddPlayerForm';
import QueueDisplay from '@/components/queue/QueueDisplay';
import useModal from '@/hooks/useModal';
import Modal from '@/components/ui/Modal';

import { FaPeopleGroup } from "react-icons/fa6";


import React from 'react'

const page = () => {
  const addPlayerModal = useModal();

  return (
    <div className='space-y-8 px-5'>
      <button
        onClick={addPlayerModal.openModal}
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mb-4 flex items-center space-x-2 justify-between gap-[.25rem]"
      >
       <FaPeopleGroup/> Add players
      </button>

      <Modal
        isOpen={addPlayerModal.isOpen}
        onClose={addPlayerModal.closeModal}
        title="Add Player"
        maxWidth="2xl" // Using a wider modal for the player list
      >
        <div className="max-h-[70vh] overflow-y-auto">
          <AddPlayerForm inModal={true} />
        </div>
      </Modal>
      
      <AddToQueueForm />
      <QueueDisplay />
    </div>
  )
}

export default page
