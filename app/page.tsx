"use client";

import CourtDisplay from '@/components/courts/CourtDisplay';
import PlayerList from '@/components/players/PlayerList';

const Home = () => {
  return (
    <div className="space-y-8 px-3 sm:px-4">
      <CourtDisplay />
      <PlayerList />
    </div>
  )
}

export default Home
