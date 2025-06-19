'use client';

import React, { useEffect, useState } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { useParams } from 'next/navigation';
import { GiShuttlecock } from "react-icons/gi";
import { formatTime } from '@/lib/utils';

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

  const formatElapsedTime = (startTimeStr: string) => {
    if (!startTimeStr) return "N/A";
    
    const startTime = new Date(startTimeStr).getTime();
    const now = new Date().getTime();
    const diffMs = now - startTime;
    
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    
    return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

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
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Badminton Queue</h1>
          
          {lastUpdate && (
            <div className={`text-sm text-gray-600 ${refreshing ? 'bg-green-100 text-green-700 px-2 py-1 rounded animate-pulse' : ''}`}>
              Last updated: {lastUpdate}
            </div>
          )}
        </div>
        
        {/* Current Courts */}
        <div className="mb-8">
          <h2 className="font-semibold mb-2">Currently Playing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {queueData.courts.map((court: Court) => (
              <div 
                key={court.id} 
                className={`p-4 rounded-lg transition-all duration-300 ${
                  court.status === 'occupied' ? 'bg-green-100' : 'bg-gray-100'
                }`}
              >
                <h3 className="font-bold">Court {court.id}</h3>
                {court.status === 'occupied' ? (
                  <div>
                    <p className="text-sm font-medium mb-1">
                      <span className="font-normal">Game Type:</span> {court.isDoubles ? 'Doubles' : 'Singles'}
                    </p>
                    
                    <p className="text-sm font-medium mb-1">
                      <span className="font-normal">Started:</span> {court.startTime ? formatTime(court.startTime) : 'N/A'}
                    </p>
                    
                    <p className="text-sm font-medium mb-3">
                      <span className="font-normal">Elapsed:</span> {court.startTime ? formatElapsedTime(court.startTime) : 'N/A'}
                    </p>
                    
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
        </div>
        
        {/* Queue List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Queue</h2>
          {queueData.queue.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <GiShuttlecock size="3em" className="text-gray-600 mx-auto" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No players in queue</h3>
              <p className="mt-1 text-sm text-gray-500">The queue is currently empty</p>
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
                    <div className="mb-3">
                      <div className="flex items-center justify-center mt-2">
                        <div className="text-center px-3 py-2 bg-white rounded-md border border-gray-300 w-full">
                          <div className="flex items-center justify-between capitalize">
                            <div className="text-sm font-medium text-blue-800 text-left">
                              <span className="block">
                                {queueData.players.find((p: Player) => p.id === item.playerIds[0])?.name}
                              </span>
                              <span className="block mt-1">
                                {queueData.players.find((p: Player) => p.id === item.playerIds[1])?.name}
                              </span>
                            </div>
                            <div className="text-xs px-2 py-1 bg-gray-200 text-[9px] rounded-full font-bold uppercase">vs</div>
                            <div className="text-sm font-medium text-green-800 text-right">
                              <span className="block">
                                {queueData.players.find((p: Player) => p.id === item.playerIds[2])?.name}
                              </span>
                              <span className="block mt-1">
                                {queueData.players.find((p: Player) => p.id === item.playerIds[3])?.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : !item.isDoubles && item.playerIds && item.playerIds.length === 2 ? (
                    <div className="mb-3">
                      <div className="flex items-center justify-center mt-2">
                        <div className="text-center px-3 py-2 bg-white rounded-md border border-gray-300 w-full">
                          <div className="flex items-center justify-between capitalize">
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
      
      <div className="mt-6 text-center text-gray-500 text-sm">
        <p>Queue last updated: {new Date(queueData.lastUpdated || Date.now()).toLocaleString()}</p>
        <p className="mt-1">This page updates automatically when changes occur.</p>
      </div>
    </div>
  );
}