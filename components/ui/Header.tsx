'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { SlSettings } from "react-icons/sl";
import { GiShuttlecock } from "react-icons/gi";
import Modal from '@/components/ui/Modal';
import useModal from '@/hooks/useModal';
import { RiResetLeftFill } from "react-icons/ri";
import { useLoader } from '@/context/LoaderContext';

export default function Header() {
  const { resetAll } = useData();
  const { showLoader } = useLoader();
  const resetAllModal = useModal();
  const [isResetting, setIsResetting] = useState(false);
  
  // Handle reset all data
  const handleResetAll = () => {
    setIsResetting(true);
    
    // Show the full-screen loader
    showLoader("Resetting all data...");
    
    // Add a slight delay to show the loading state
    setTimeout(() => {
      resetAll();
      setIsResetting(false);
      resetAllModal.closeModal();
    }, 800);
  };

  return (
    <>
      <header className="bg-[#df2027] text-white py-2 px-4">
        <div className="mx-auto flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-[1.05em] font-bold mb-2 sm:mb-0 flex items-center">
            <Link href='/' className='flex items-center gap-[0.15rem]'>ShuttleFlow <GiShuttlecock className='rotate-[205deg]' /></Link>
          </h1>
          
          <nav className="flex items-center space-x-3">
            <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition">
              Court
            </Link>
            <Link href="/queue" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition">
              Queue
            </Link>
            <Link href="/fees" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition">
              Fees
            </Link>

            <button 
              onClick={resetAllModal.openModal}
              className="px-3 py-2 rounded-md text-sm text-[15px]"
            >
              <RiResetLeftFill className='transition hover:-rotate-90 cursor-pointer' />
            </button>
          </nav>
        </div>
      </header>
      
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
  );
}