'use client';

import React from 'react';
import Link from 'next/link';
import { GiShuttlecock } from "react-icons/gi";
import { GrMoney } from "react-icons/gr";
import { FiSettings } from "react-icons/fi";
import { usePathname } from 'next/navigation';
import { BsPersonLinesFill } from "react-icons/bs";

export default function Header() {
  const pathname = usePathname();

  // Helper function to determine if link is active
  const isActive = (path: string) => pathname === path;

  return (
    <>
      <header className="bg-[#df2027] text-white py-2 px-4 md:block hidden">
        <div className="mx-auto flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-[1.05em] font-bold mb-2 sm:mb-0 flex items-center">
            <Link href='/' className='flex items-center gap-[0.15rem]'>ShuttleFlow <GiShuttlecock className='rotate-[205deg]' /></Link>
          </h1>
          
          <nav className="flex items-center space-x-3">
            <Link href="/" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition ${isActive('/') && 'text-white bg-red-700'}`}>
              Court
            </Link>
            <Link href="/players" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition ${isActive('/players') && 'text-white bg-red-700'}`}>
              Queue
            </Link>
            <Link href="/fees" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition ${isActive('/fees') && 'text-white bg-red-700'}`}>
              Fees
            </Link>
            <Link href="/settings" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition ${isActive('/settings') && 'text-white bg-red-700'}`}>
              Settings
            </Link>
          </nav>
        </div>
      </header>

      <header className="bg-[#ffffff] text-white py-2.5 px-4 md:hidden block fixed bottom-0 left-0 right-0 z-9 shadow-[inset_0_4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="mx-auto flex flex-col sm:flex-row justify-between items-center">
          <nav className="flex items-center space-x-3 justify-around w-full">
            <Link 
              href="/" 
              className={`mx-3 px-2 flex justify-between items-center flex-col gap-1 rounded-md text-[13px] font-medium transition ${
                isActive('/') 
                  ? 'text-red-500 hover:bg-red-100' 
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              <GiShuttlecock size="1.3rem"/>
              <span>Court</span>
            </Link>
            
            <Link 
              href="/players" 
              className={`mx-3 px-2 flex justify-between items-center flex-col gap-1 rounded-md text-[13px] font-medium transition ${
                isActive('/players') 
                  ? 'text-red-500 hover:bg-red-100' 
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              <BsPersonLinesFill size="1.4rem"/>
              <span>Players</span>
            </Link>
            
            <Link 
              href="/fees" 
              className={`mx-3 px-2 flex justify-between items-center flex-col gap-1 rounded-md text-[13px] font-medium transition ${
                isActive('/fees') 
                  ? 'text-red-500 hover:bg-red-100' 
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              <GrMoney size="1.2rem"/>
              <span>Fees</span>
            </Link>

            <Link 
              href="/settings" 
              className={`mx-3 px-2 flex justify-between items-center flex-col gap-1 rounded-md text-[13px] font-medium transition ${
                isActive('/settings') 
                  ? 'text-red-500 hover:bg-red-100' 
                  : 'text-gray-400 hover:bg-gray-100'
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