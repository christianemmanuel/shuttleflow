'use client';

import React, { useEffect, useState } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { useParams } from 'next/navigation';
import { GiShuttlecock } from "react-icons/gi";
import { formatTime } from '@/lib/utils';
import useModal from '@/hooks/useModal';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';

// Define types for your data structure
interface Player {
  id: string;
  name: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
}

interface Court {
  id: string;
  status: 'occupied' | 'available';
  isDoubles: boolean;
  startTime?: string;
  players?: string[];
}

interface QueueItem {
  id: string;
  isDoubles: boolean;
  requestedTime: string;
  playerIds: string[];
}

interface QueueData {
  queue: QueueItem[];
  players: Player[];
  courts: Court[];
  lastUpdated?: string;
}

export default function SharedQueueView() {
  const params = useParams();
  const queueId = params.queueId as string;
  
  const [queueData, setQueueData] = useState<QueueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const showCurrentlyPlaying = useModal();
  
  useEffect(() => {
    if (!queueId) {
      setError("Invalid queue ID");
      setLoading(false);
      return;
    }
    
    const queueRef = ref(database, `queues/${queueId}`);
    
    const unsubscribe = onValue(queueRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        const safeData: QueueData = {
          ...data,
          queue: data.queue || [],
          players: data.players || [],
          courts: data.courts || []
        };
        
        setQueueData(safeData);
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
        setLastUpdate(new Date().toLocaleTimeString());
        setLoading(false);
      } else {
        setError("Queue not found or no longer shared");
        setLoading(false);
      }
    }, (err) => {
      setError(`Error loading queue: ${err.message}`);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [queueId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <p className="mt-4 text-sm text-gray-600">
            This queue may no longer be available or has been stopped by the creator.
          </p>
        </div>
      </div>
    );
  }

  if (!queueData || !Array.isArray(queueData.queue) || !Array.isArray(queueData.courts)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold text-yellow-800 mb-2">Loading Data</h2>
          <p className="text-yellow-600">Queue data is being loaded or has an invalid format.</p>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-center mb-4">
        <a href="/"className='flex items-center gap-[0.15rem] text-white font-semibold text-[18px] cursor-pointer'>ShuttleFlow <GiShuttlecock className='rotate-[205deg]' /></a>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md mb-5">
        {lastUpdate && (
          <div className={`text-[13px] mb-2.5 bg-green-100 text-green-700 px-2 py-1 ${refreshing ? 'bg-red-200 text-red-400 px-2 py-1 rounded animate-pulse' : ''}`}>
            Last updated: {lastUpdate}
          </div>
        )}
        
        <Modal
          isOpen={showCurrentlyPlaying.isOpen}
          onClose={showCurrentlyPlaying.closeModal}
          maxWidth="full"
          title="Now Playing on Court"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {queueData.courts.map((court: Court) => (
              <div 
                key={court.id} 
                className={`relative z-1 sm:p-4 p-3 h-full flex flex-col rounded-lg border border-[#e7d58b]  transition-all duration-300 ${
                  court.status === 'occupied' ? 'bg-amber-50' : 'bg-gray-100 border-gray-300'
                }`}
              >
                <h3 className="font-bold flex justify-between items-center mb-2.5">
                  Court #{court.id}
                  {court.status === 'occupied' && (
                    <>
                      <span className="font-normal ml-2 text-gray-600">Started: {court.startTime && formatTime(court.startTime)}</span> 
                    </>
                  )}
                </h3>
                {court.status === 'occupied' ? (
                  <div>
                    {/* Player display */}
                    {court.players && court.players.length > 0 && (
                      <div className="bg-white rounded-md p-2 border border-green-200">
                        {court.isDoubles && court.players.length === 4 ? (
                          <div className="flex items-center justify-between text-sm">
                            <div className="text-blue-800 font-medium">
                              {queueData.players.find((p: Player) => p.id === court.players?.[0])?.name} & {' '}
                              {queueData.players.find((p: Player) => p.id === court.players?.[1])?.name}
                            </div>
                            <div className="text-xs px-1.5 py-0.5 bg-gray-200 text-[9px] rounded-full font-bold">vs</div>
                            <div className="text-red-800 font-medium">
                              {queueData.players.find((p: Player) => p.id === court.players?.[2])?.name} & {' '}
                              {queueData.players.find((p: Player) => p.id === court.players?.[3])?.name}
                            </div>
                          </div>
                        ) : court.players.length === 2 ? (
                          <div className="flex items-center justify-between text-sm">
                            <div className="text-blue-800 font-medium">
                              {queueData.players.find((p: Player) => p.id === court.players?.[0])?.name}
                            </div>
                            <div className="text-xs px-1.5 py-0.5 bg-gray-200 text-[9px] rounded-full font-bold">vs</div>
                            <div className="text-red-800 font-medium">
                              {queueData.players.find((p: Player) => p.id === court.players?.[1])?.name}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            Players: {court.players.map((pId: string) => {
                              const player = queueData.players.find((p: Player) => p.id === pId);
                              return player ? player.name : 'Unknown';
                            }).join(', ')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Available</p>
                )}
              </div>
            ))}
          </div>
        </Modal>
        
        {/* Queue List */}
        <div>
          <h2 className="md:text-lg text-sm font-bold flex items-center justify-between mb-4">
            <span>Queue</span> 
            <button 
            onClick={showCurrentlyPlaying.openModal} 
            className='bg-blue-500 text-[13px] hover:bg-blue-600 text-white gap-1.5 py-1.5 px-3 rounded w-auto cursor-pointer flex items-center justify-center transition relative border-b-[4px] border-b-blue-700 hover:border-b-blue-800 active:border-b-blue-900 active:translate-y-[2px]'
          >
            Show Court Status
          </button>
          </h2>
          {queueData.queue.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <GiShuttlecock size="3em" className="text-gray-600 mx-auto" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No players in queue</h3>
              <p className="mt-1 text-sm text-gray-500">Please wait for the queue master to add players.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queueData.queue.map((item: QueueItem, index: number) => (
                <div key={item.id} className="border rounded-md p-3 bg-[#ebf4ff] shadow-md">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="font-bold text-gray-700 mr-2">#{index + 1}</span>
                      <span className="text-[13px]">
                        {item.isDoubles ? 'Doubles' : 'Singles'} Match
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      Requested {formatTime(item.requestedTime)}
                    </span>
                  </div>
                  
                  {/* Show players in format similar to main app */}
                  {item.isDoubles && item.playerIds && item.playerIds.length === 4 ? (
                    <div className="flex items-center justify-center mt-2 mb-2">
                      <div className="text-center sm:px-3 sm:py-2 py-2 px-2.5 bg-white rounded-md border border-gray-300 w-full">
                        <div className="flex items-center justify-between capitalize sm:flex-row flex-row sm:gap-0.5 gap-2.5">
                          <div className="text-sm font-medium text-blue-800 text-left">
                            <span className='block'>{queueData.players.find((p: Player) => p.id === item.playerIds[0])?.name}</span>
                            <span className='block mt-1'>{queueData.players.find((p: Player) => p.id === item.playerIds[1])?.name}</span>
                          </div>
                          <div className="text-xs px-2 py-1 bg-gray-200 text-[9px] rounded-full font-bold uppercase">vs</div>
                          <div className="text-sm font-medium text-green-800 text-left">
                            <span className='block'>{queueData.players.find((p: Player) => p.id === item.playerIds[2])?.name}</span>
                            <span className='block mt-1'>{queueData.players.find((p: Player) => p.id === item.playerIds[3])?.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : !item.isDoubles && item.playerIds && item.playerIds.length === 2 ? (
                    <div className="flex items-center justify-center mt-2 mb-2">
                      <div className="text-center sm:px-3 sm:py-2 py-3 px-2.5 bg-white rounded-md border border-gray-300 w-full">
                        <div className="flex items-center justify-between capitalize sm:flex-row flex-row">
                          <div className="text-sm font-medium text-blue-800">
                            {queueData.players.find((p: Player) => p.id === item.playerIds[0])?.name}
                          </div>
                          <div className="text-xs px-2 py-1 bg-gray-200 text-[9px] rounded-full font-bold uppercase">vs</div>
                          <div className="text-sm font-medium text-green-800">
                            {queueData.players.find((p: Player) => p.id === item.playerIds[1])?.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-1">Players:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {(item.playerIds || []).map((pId: string) => {
                          const player = queueData.players.find((p: Player) => p.id === pId);
                          if (!player) return null;
                          
                          return (
                            <div key={pId} className="flex items-center text-sm">
                              <span className="w-2 h-2 rounded-full mr-2" 
                                style={{
                                  backgroundColor: 
                                    player.skillLevel === 'beginner' ? '#4ade80' :
                                    player.skillLevel === 'intermediate' ? '#facc15' : '#f87171'
                                }}
                              ></span>
                              <span>{player.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 mb-5 text-center text-white text-sm">
        <p>Queue last updated: {new Date(queueData.lastUpdated || Date.now()).toLocaleString()}</p>
        <p className="mt-1">This page updates automatically when changes occur.</p>
      </div>
    </div>
  );
}