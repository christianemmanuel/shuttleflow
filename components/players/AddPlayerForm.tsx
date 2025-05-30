'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { IoLogoOctocat } from "react-icons/io";
import { FaShieldCat } from "react-icons/fa6";
import { GiPocketBow } from "react-icons/gi";

interface PlayerListProps {
  inModal?: boolean;
}

export default function AddPlayerForm({ inModal = false }: PlayerListProps) {
  const { state, addNewPlayer } = useData();
  const [name, setName] = useState('');
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trim the name to remove leading/trailing whitespace
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError('Player name cannot be empty');
      return;
    }
    
    // Check if a player with this name already exists (case insensitive)
    const nameExists = state.players.some(
      player => player.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (nameExists) {
      setError(`A player named "${trimmedName}" already exists`);
      return;
    }
    
    // Clear any previous errors
    setError(null);
    
    // Add the new player
    addNewPlayer(trimmedName, skillLevel);
    
    // Reset the form
    setName('');
  };
  
  return (
    <div className={`${inModal ? '' : 'bg-white p-4 rounded-lg shadow-md mb-6 '}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            id="playerName"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              // Clear error when user starts typing again
              if (error) setError(null);
            }}
            className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 h-[36px] text-[14px]`}
            placeholder="Enter player name"
          />
          {error && (
            <p className="mt-1 text-[12px] text-red-600">{error}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Skill Level
          </label>
          <div className="flex space-x-4">
            <label
              className={`flex items-center px-4 py-1.5 rounded cursor-pointer 
                ${skillLevel === 'beginner' ? 'bg-green-200 text-green-800' : 'bg-gray-100'}
              `}
            >
              <input
                type="radio"
                name="skillLevel"
                checked={skillLevel === 'beginner'}
                onChange={() => setSkillLevel('beginner')}
                className="hidden"
              />
              <IoLogoOctocat className='mr-2' /> Beginner
            </label>

            <label
              className={`flex items-center px-4 py-1.5 rounded cursor-pointer 
                ${skillLevel === 'intermediate' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-100'}
              `}
            >
              <input
                type="radio"
                name="skillLevel"
                checked={skillLevel === 'intermediate'}
                onChange={() => setSkillLevel('intermediate')}
                className="hidden"
              />
              <FaShieldCat className='mr-2' /> Intermediate
            </label>

            <label
              className={`flex items-center px-4 py-1.5 rounded cursor-pointer 
                ${skillLevel === 'advanced' ? 'bg-red-200 text-red-800' : 'bg-gray-100'}
              `}
            >
              <input
                type="radio"
                name="skillLevel"
                checked={skillLevel === 'advanced'}
                onChange={() => setSkillLevel('advanced')}
                className="hidden"
              />
              <GiPocketBow className='mr-2' /> Advanced
            </label>
          </div>

        </div>
        
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Add Player
        </button>
      </form>
    </div>
  );
}