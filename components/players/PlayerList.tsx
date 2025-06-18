'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';

export default function PlayerList() {
  const { state } = useData();
  const { players } = state;
  
  // Add search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'playing' | 'queued' | 'done'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'games' | 'fees'>('name');
  
  // Filter players based on status and search query
  const filteredPlayers = players.filter(player => {
    // First filter by status
    const statusMatch = 
      filterStatus === 'all' ? true :
      filterStatus === 'available' ? (!player.currentlyPlaying && !player.inQueue && !player.donePlaying) :
      filterStatus === 'playing' ? player.currentlyPlaying :
      filterStatus === 'queued' ? player.inQueue :
      filterStatus === 'done' ? player.donePlaying : true;
    
    // Then filter by search query (if any)
    const searchMatch = searchQuery 
      ? player.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    // Player must match both conditions
    return statusMatch && searchMatch;
  });
  
  // Sort players
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'fees') return b.totalFees - a.totalFees;
    return b.gamesPlayed - a.gamesPlayed; // Changed to sort by most games first
  });
  
  // Get status label
  const getStatusLabel = (player: typeof players[0]) => {
    if (player.currentlyPlaying) return 'Playing';
    if (player.inQueue) return 'In Queue';
    if (player.donePlaying) return 'Inactive';
    return 'Available';
  };
  
  // Get status color
  const getStatusColor = (player: typeof players[0]) => {
    if (player.currentlyPlaying) return 'bg-blue-100 text-blue-800';
    if (player.inQueue) return 'bg-purple-100 text-purple-800';
    if (player.donePlaying) return 'bg-gray-100 text-gray-800';
    return 'bg-green-100 text-green-800';
  };
  
  return (
    <div className="bg-white sm:p-4 p-3 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="md:text-lg text-sm font-bold">Player List ({sortedPlayers.length})</h3>
      </div>
      
      {/* Search and Filter Controls */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-[33.33%_66.67%]">
        {/* Search Box */}
        <div className="col-span-1 md:col-span-1">
          <label className="block text-xs text-gray-500 mb-1">Search Players</label>
          <div className="relative md:pr-3 pr-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 pl-8 h-[38px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        <div className='flex flex-row justify-between gap-3 md:mt-0 mt-3 md:mb-0 mb-2'>
          <div className='w-full'>
            <label className="block text-xs text-gray-500 mb-1">Filter by Status</label>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'available' | 'playing' | 'queued' | 'done')}
                className="w-full appearance-none border rounded-md px-2 py-2 pl-3 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 h-[38px]"
              >
                <option value="all">All Players</option>
                <option value="available">Available</option>
                <option value="playing">Currently Playing</option>
                <option value="queued">In Queue</option>
                <option value="done">Inactive</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-gray-700">
                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className='w-full'>
            <label className="block text-xs text-gray-500 mb-1">Sort By</label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'games' | 'fees')}
                className="w-full appearance-none border rounded-md px-2 py-2 pl-3 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 h-[38px]"
              >
                <option value="name">Name</option>
                <option value="games">Games Played</option>
                <option value="fees">Total Fees</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-gray-700">
                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      
      {/* Results Count & Clear Filters */}
      {(searchQuery || filterStatus !== 'all') && (
        <div className="flex justify-between items-center mb-3 px-2 py-1 bg-blue-50 rounded">
          <span className="text-sm text-blue-800">
            Showing {sortedPlayers.length} of {players.length} players
          </span>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('all');
            }}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Clear Filters
          </button>
        </div>
      )}
      
      {sortedPlayers.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No players found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery ? `No results match "${searchQuery}"` : "Try changing your search or filters"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skill Level
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Games Played
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 capitalize">
              {sortedPlayers.map(player => (
                <tr key={player.id} className={`hover:bg-gray-100`}>
                  <td className={`px-4 py-2 whitespace-nowrap ${player.donePlaying && 'opacity-50'}`}>
                    {player.name}
                  </td>
                  <td className={`px-4 py-2 whitespace-nowrap ${player.donePlaying && 'opacity-50'}`}>
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      player.skillLevel === 'beginner' ? 'bg-green-500' :
                      player.skillLevel === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></span>
                    {player.skillLevel.charAt(0).toUpperCase() + player.skillLevel.slice(1)}
                  </td>
                  <td className={`px-4 py-2 whitespace-nowrap ${player.donePlaying && 'opacity-50'}`}>
                    {player.gamesPlayed}
                  </td>
                  <td className={`px-4 py-2 whitespace-nowrap`}>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(player)}`}>
                      {getStatusLabel(player)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}