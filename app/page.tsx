"use client";

import CourtDisplay from '@/components/courts/CourtDisplay';
import ClientQueueDisplay from '@/components/queue/ClientQueueDisplay';
import PlayerList from '@/components/players/PlayerList';
import useModal from '@/hooks/useModal';
import Modal from '@/components/ui/Modal';
import { MdPersonAdd } from "react-icons/md";
import AddPlayerForm from '@/components/players/AddPlayerForm';
import { useData } from '@/context/DataContext';
import { useRouter } from 'next/navigation'; 

const Home = () => {
  const { state } = useData();
  const { players } = state;
  const router = useRouter();


  const availablePlayers = players.filter(player => 
    !player.currentlyPlaying
  );

  const donePlayers = players.filter(player => 
    player.donePlaying
  );

  const addPlayerModal = useModal();
  
  return (
    <div className="space-y-8 px-3 sm:px-4">
      <h1 className="text-[14px] sm:text-[18px] mt-2 mb-8 border-l-[3px] border-[#fffff] text-white leading-none pl-[0.55rem] sm:block hidden">Smart Badminton Queuing Management</h1>
      <div className='hidden'><ClientQueueDisplay /></div>
      <CourtDisplay />
      <PlayerList />

      {(availablePlayers.length - donePlayers.length) === 0 && (
        <>
          <div className="fixed z-10 bottom-[70px] md:bottom-[10px] right-[85px] py-1.5 px-2.5 bg-gray-900 text-sm text-white rounded-[6px] hidden items-center justify-center bounce-animate">
            Add Player
            <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-l-8 border-l-gray-900"></div>
          </div>
        </>
      )}

      <button
        onClick={addPlayerModal.openModal}
        className="fixed w-[55px] h-[55px] z-10 bottom-[75px] md:bottom-[15px] mb-4 shadow-lg right-[20px] bg-blue-500 hover:bg-blue-600 cursor-pointer text-[22px] text-white rounded-[50px] hidden items-center justify-center"
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
          <AddPlayerForm 
            inModal={true} 
            onPlayerAdded={() => {
              addPlayerModal.closeModal();
              router.push('/players');
            }} 
          />
        </div>
      </Modal>
    </div>
  )
}

export default Home
