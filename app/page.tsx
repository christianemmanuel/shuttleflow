"use client";

import CourtDisplay from '@/components/courts/CourtDisplay';
import PlayerList from '@/components/players/PlayerList';

export default function Home() {
  return (
    <div className="space-y-8 px-3 sm:px-4">
      <h1 className="text-[14px] sm:text-[18px] mt-2 mb-8 border-l-[3px] border-[#fffff] text-white leading-none pl-[0.55rem]">Smart Badminton Queuing Management</h1>
      
      <CourtDisplay />
      

      <PlayerList />

    </div>
  );
}