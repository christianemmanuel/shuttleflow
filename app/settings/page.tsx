'use client';

import React, { useState } from 'react'
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { useLoader } from '@/context/LoaderContext';
import Modal from '@/components/ui/Modal';
import useModal from '@/hooks/useModal';
import { ref, remove } from 'firebase/database';
import { database } from '@/lib/firebase';

const Settings = () => {
  const resetAllModal = useModal();
  const { showLoader } = useLoader();
  const { resetAll } = useData();
  const [isResetting, setIsResetting] = useState(false);

  const [shareId, setShareId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('queueShareId');
    }
    return null;
  });
    
  const [isSharing, setIsSharing] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('queueIsSharing') === 'true';
    }
    return false;
  });

  // Handle reset all data
  const handleResetAll = async () => {
    console.log(isSharing);
    try {
      await setIsResetting(true);
      // Show the full-screen loader
      showLoader("Resetting all data...");

      // Remove the shared queue data from Firebase
      const queueRef = ref(database, `queues/${shareId}`);
      await remove(queueRef);
      
      setShareId(null);
      setIsSharing(false);
      
      // Clear from localStorage
      localStorage.removeItem('queueShareId');
      localStorage.removeItem('queueIsSharing');

    } catch (error) {
      console.error("Error stopping sharing:", error);
    } finally {
      setTimeout(async()  => {
        resetAll();
        setIsResetting(false);
        resetAllModal.closeModal();
      }, 800);
    }
  };

  return (
    <>
      <div className='space-y-8 px-3 sm:px-4 max-w-[768px] m-auto'>
        <div className="bg-white p-4 rounded-lg shadow-md mb-5">
          <h3 className="text-lg font-bold mb-4">Settings</h3>
          
          <div className="grid grid-cols-1 w-full gap-4 mb-2.5">
            <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-between">
              <p className="text-sm text-gray-800">Reset All Data</p>
              <button onClick={resetAllModal.openModal} type="submit" className="bg-red-500 hover:bg-red-600 text-white py-1 px-4 h-[34px] min-w-[87px] rounded-md cursor-pointer flex items-center justify-center transition relative w-auto">Reset all</button>
            </div>
          </div>

          <div className="grid grid-cols-1 w-full gap-4 mb-2.5">
            <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-between">
              <p className="text-sm text-gray-800">Terms of Use</p>
              <button type="submit" className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-4 h-[34px] min-w-[87px] rounded-md cursor-pointer flex items-center justify-center transition relative w-auto">View</button>
            </div>
          </div>
        
          <div className="grid grid-cols-1 w-full gap-1 mb-2.5">
            <h5 className='text-[13px] font-medium text-gray-500 mt-3'>Others</h5>
            <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-between">
              <p className="text-sm text-gray-800">Survey Form</p>
              <Link href='https://tally.so/r/n9g4Y4' target='_blank' className="bg-red-500 hover:bg-red-600 text-white py-1 px-4 h-[34px] min-w-[87px] rounded-md cursor-pointer flex items-center justify-center transition relative w-auto">Give Feedback</Link>
            </div>
          </div>

          <div className='mt-8 text-center text-gray-500 text-xs flex flex-col gap-1'>
            <span>Created by: Ian Concepcion</span>
            <span>Website: <Link href='https://www.ianconcepcion.dev/' target='_blank'>ianconcepcion.dev</Link></span>
          </div>
          
        </div>
      </div>

      <Modal 
        isOpen={resetAllModal.isOpen} 
        onClose={resetAllModal.closeModal}
        title="Reset All Data"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Warning: This action cannot be undone</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    You are about to reset all data in the application. This includes:
                  </p>
                  <ul className="list-disc list-inside mt-1 ml-2">
                    <li>All players and their stats</li>
                    <li>All matches and game history</li>
                    <li>All court assignments and queue</li>
                    <li>All fee configurations and payment records</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600">
            Are you absolutely sure you want to reset all data? All data will be permanently deleted and cannot be recovered.
          </p>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={resetAllModal.closeModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleResetAll}
              disabled={isResetting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded flex items-center"
            >
              {isResetting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting...
                </>
              ) : (
                "Reset All Data"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default Settings
