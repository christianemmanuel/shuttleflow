'use client';

import React from 'react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { SlSettings } from "react-icons/sl";
import { GiShuttlecock } from "react-icons/gi";

export default function Header() {
  const { resetAll, resetCourtsOnly } = useData();

  return (
    <header className="bg-[#df2027] text-white py-2 px-4">
      <div className="mx-auto flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-[1.05em] font-bold mb-2 sm:mb-0 flex items-center">
          <Link href='/' className='flex items-center gap-[0.15rem]'>ShuttleFlow <GiShuttlecock className='rotate-[205deg]' /></Link>
        </h1>
        
        <nav className="flex items-center space-x-4">
          <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
            Court
          </Link>
          <Link href="/queue" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
            Queue
          </Link>
          <Link href="/fees" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
            Fees
          </Link>
          <Link href="/history" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
            Match History
          </Link>

          <div className="relative group">
            <button className="hover:text-indigo-200 mt-2"><SlSettings /></button>
            <div className="absolute right-0 pt-2 w-48 bg-white text-gray-800 rounded shadow-lg hidden group-hover:block z-10">
              <button 
                onClick={resetCourtsOnly}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Reset Courts Only
              </button>
              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
                    resetAll();
                  }
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
              >
                Reset All Data
              </button>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}