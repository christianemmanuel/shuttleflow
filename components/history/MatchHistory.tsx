'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { formatTime, formatCurrency } from '@/lib/utils';

export default function MatchHistory() {
  const { state } = useData();
  const { matchHistory, players, feeConfig } = state;
  
  // State for filters and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'duration'>('recent');
  
  // Filter and sort match history
  const filteredHistory = matchHistory
    .filter(match => {
      // Date filtering
      if (dateFilter === 'all') return true;
      
      const matchDate = new Date(match.endTime);
      const today = new Date();
      
      if (dateFilter === 'today') {
        return matchDate.toDateString() === today.toDateString();
      }
      
      if (dateFilter === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return matchDate >= oneWeekAgo;
      }
      
      return true;
    })
    .filter(match => {
      // Search query filtering (search by player names)
      if (!searchQuery) return true;
      
      // If we have cached player names, use those
      if (match.playerNames && match.playerNames.length > 0) {
        return match.playerNames.some(name => 
          name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Otherwise, look up player names
      const playerNames = match.playerIds
        .map(id => players.find(p => p.id === id)?.name.toLowerCase() || '')
        .join(' ');
      
      return playerNames.includes(searchQuery.toLowerCase());
    });
  
  // Sort the filtered matches
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.endTime).getTime() - new Date(a.endTime).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
    }
    // Sort by duration
    return b.durationMinutes - a.durationMinutes;
  });
  
  // Format the match type
  const getMatchType = (match: typeof matchHistory[0]) => {
    return match.isDoubles ? 'Doubles' : 'Singles';
  };
  
  // Format the VS display for players
  const formatPlayersVs = (match: typeof matchHistory[0]) => {
    const matchPlayers = match.playerIds.map(id => 
      players.find(p => p.id === id)
    ).filter(Boolean);
    
    if (match.isDoubles && matchPlayers.length === 4) {
      return (
        <div className="flex items-center justify-center space-x-2">
          <span className="font-medium text-blue-800">{matchPlayers[0]?.name} & {matchPlayers[1]?.name}</span>
          <span className="px-2 py-1 bg-gray-200 rounded-full text-xs font-bold">VS</span>
          <span className="font-medium text-red-800">{matchPlayers[2]?.name} & {matchPlayers[3]?.name}</span>
        </div>
      );
    } else if (!match.isDoubles && matchPlayers.length === 2) {
      return (
        <div className="flex items-center justify-center space-x-2">
          <span className="font-medium text-blue-800">{matchPlayers[0]?.name}</span>
          <span className="px-2 py-1 bg-gray-200 rounded-full text-xs font-bold">VS</span>
          <span className="font-medium text-red-800">{matchPlayers[1]?.name}</span>
        </div>
      );
    } else {
      return (
        <div className="text-sm text-gray-500">
          {matchPlayers.map(p => p?.name).join(', ')}
        </div>
      );
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Match History</h2>
      </div>
      
      {/* Filters and Search */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Box */}
        <div className="col-span-1 md:col-span-1">
          <label className="block text-xs text-gray-500 mb-1">Search Players</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by player name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        
        {/* Date Filter */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Filter by Date</label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
          </select>
        </div>
        
        {/* Sort Options */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="duration">Duration (Longest)</option>
          </select>
        </div>
      </div>
      
      {/* Results Count */}
      {(searchQuery || dateFilter !== 'all') && (
        <div className="flex justify-between items-center mb-3 px-2 py-1 bg-blue-50 rounded">
          <span className="text-sm text-blue-800">
            Showing {sortedHistory.length} of {matchHistory.length} matches
          </span>
          <button
            onClick={() => {
              setSearchQuery('');
              setDateFilter('all');
            }}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Clear Filters
          </button>
        </div>
      )}
      
      {/* Match History List */}
      {sortedHistory.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No match history found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery ? 
              `No matches found with "${searchQuery}"` : 
              "No matches have been completed yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedHistory.map((match, index) => (
            <div key={match.id} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 flex justify-between items-center">
                <div className="flex items-center">
                  <span className="font-bold text-gray-700 mr-2">#{matchHistory.length - index}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    match.isDoubles ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {getMatchType(match)}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {formatTime(match.endTime)}
                </div>
              </div>
              
              <div className="p-4">
                {/* Players */}
                <div className="mb-3">
                  {formatPlayersVs(match)}
                </div>
                
                {/* Match Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500">Duration</div>
                    <div className="font-medium">{match.durationMinutes} minutes</div>
                  </div>
                  
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500">Court</div>
                    <div className="font-medium">Court #{match.courtId}</div>
                  </div>
      
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500">Total Fees</div>
                    <div className="font-medium">
                      {formatCurrency(match.feesCharged, feeConfig.currency)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Summary statistics section removed as requested */}
    </div>
  );
}