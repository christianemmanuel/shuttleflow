'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { loadFromLocalStorage, saveToLocalStorage } from '@/lib/localStorage';

import { GiShuttlecock } from "react-icons/gi";
import { GrMoney } from "react-icons/gr";
import { FiSettings } from "react-icons/fi";
import { usePathname } from 'next/navigation';
import { BsPersonLinesFill } from "react-icons/bs";

export default function Header() {
  const pathname = usePathname();
  const { state } = useData();
  
  // State to control whether the court notification should be shown
  const [showCourtNotification, setShowCourtNotification] = useState(false);
  
  // Load notification preference and check court status on mount and when courts change
  useEffect(() => {
    // Moving the arePlayersOnCourt function inside useEffect to fix the dependency warning
    const arePlayersOnCourt = () => {
      return state.courts.some(court => court.status === 'occupied' && court.players.length > 0);
    };
    
    const hideCourtNotification = loadFromLocalStorage('hideCourtNotification', false);
    
    // Only show notification if there are players on court AND the user hasn't dismissed it
    if (arePlayersOnCourt() && !hideCourtNotification) {
      setShowCourtNotification(true);
    } else {
      setShowCourtNotification(false);
    }
  }, [state.courts]); // Now this is correct since arePlayersOnCourt is defined inside
  
  // Check if the current page is a shared queue page
  const isSharedQueuePage = pathname?.includes('/shared-queue/');
  
  // If we're on a shared queue page, don't render the header
  if (isSharedQueuePage) {
    return null;
  }

  // Helper function to determine if link is active
  const isActive = (path: string) => pathname === path;
  
  // Handle click on the Court link
  const handleCourtLinkClick = () => {
    if (showCourtNotification) {
      setShowCourtNotification(false);
      saveToLocalStorage('hideCourtNotification', true);
    }
  };

  return (
    <>
      <header className="bg-[#df2027] text-white py-2 px-4 md:block hidden">
        <div className="mx-auto flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-[1.05em] font-bold mb-2 sm:mb-0 flex items-center">
            <Link href='/' className='flex items-center gap-[0.15rem]'>ShuttleFlow <GiShuttlecock className='rotate-[205deg]' /></Link>
          </h1>
          
          <nav className="flex items-center space-x-2.5">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition flex items-center gap-[.15rem] ${isActive('/') && 'text-white bg-red-700'}`}
              onClick={handleCourtLinkClick}
            >
              <GiShuttlecock size=".82rem"/> <span>Court</span>
            </Link>
            <Link href="/players" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition flex items-center gap-[.35rem] ${isActive('/players') && 'text-white bg-red-700'}`}>
              <BsPersonLinesFill size=".82rem"/> <span>Players</span>
            </Link>
            <Link href="/fees" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition flex items-center gap-[.35rem] ${isActive('/fees') && 'text-white bg-red-700'}`}>
              <GrMoney size=".8rem"/><span>Fees</span>
            </Link>
            <Link href="/settings" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition flex items-center gap-[.3rem] ${isActive('/settings') && 'text-white bg-red-700'}`}>
              <FiSettings size=".82rem"/><span>Settings</span>
            </Link>
          </nav>
        </div>
      </header>

      <header className="bg-[#ffffff] text-white py-2.5 px-4 md:hidden block fixed bottom-0 left-0 right-0 z-9 shadow-[0px_-5px_15px_0px_rgba(0,0,0,0.1)]">
        <div className="mx-auto flex flex-col sm:flex-row justify-between items-center">
          <nav className="flex items-center space-x-3 justify-around w-full">
            <Link 
              href="/" 
              className={`mx-3 px-2 flex justify-between items-center flex-col gap-1 rounded-md text-[12px] font-medium transition relative ${
                isActive('/') 
                  ? 'text-red-500' 
                  : 'text-gray-400'
              }`}
              onClick={handleCourtLinkClick}
            >
              
              {showCourtNotification && (
                <span className='absolute text-[13px] text-white whitespace-nowrap bottom-14 left-0 py-2 px-3 bg-red-500 rounded-md animate-bounce shadow shadow-gray-700'>
                  Players are now on court
                  <div className="absolute top-[40px] left-5 -translate-y-1/2 w-0 h-0 border-y-9 rotate-90 border-y-transparent border-l-9 border-l-red-500"></div>
                </span>
              )}

              <GiShuttlecock size="1.3rem"/>
              <span>Court</span>
            </Link>
            
            <Link 
              href="/players" 
              className={`mx-3 px-2 flex justify-between items-center flex-col gap-1 rounded-md text-[12px] font-medium transition ${
                isActive('/players') 
                  ? 'text-red-500' 
                  : 'text-gray-400'
              }`}
            >
              <BsPersonLinesFill size="1.4rem"/>
              <span>Players</span>
            </Link>
            
            <Link 
              href="/fees" 
              className={`mx-3 px-2 flex justify-between items-center flex-col gap-1 rounded-md text-[12px] font-medium transition ${
                isActive('/fees') 
                  ? 'text-red-500' 
                  : 'text-gray-400'
              }`}
            >
              <GrMoney size="1.2rem"/>
              <span>Fees</span>
            </Link>

            <Link 
              href="/settings" 
              className={`mx-3 px-2 flex justify-between items-center flex-col gap-1 rounded-md text-[12px] font-medium transition ${
                isActive('/settings') 
                  ? 'text-red-500' 
                  : 'text-gray-400'
              }`}
            >
              <FiSettings size="1.3rem"/>
              <span>Settings</span>
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}