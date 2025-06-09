'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { MdPersonAdd } from "react-icons/md";

interface PlayerListProps {
  inModal?: boolean;
  onPlayerAdded?: () => void;
}

export default function AddPlayerForm({ inModal = false, onPlayerAdded }: PlayerListProps) {
  const { state, addNewPlayer } = useData();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsAdding(true);
    
    // Trim the name to remove leading/trailing whitespace
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError('Player name cannot be empty');
      setIsAdding(false);
      return;
    }
    
    // Check if a player with this name already exists (case insensitive)
    const nameExists = state.players.some(
      player => player.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (nameExists) {
      setError(`A player named "${trimmedName}" already exists`);
      setIsAdding(false);
      return;
    }
    
    // Clear any previous errors
    setError(null);
    
    // Add the new player
    addNewPlayer(trimmedName, skillLevel);
    
    setTimeout(() => {
      setIsAdding(false);

      showToast(`${trimmedName} added successfully!`, 'success');

      // Reset the form
      setName('');

      if (onPlayerAdded) onPlayerAdded();
    }, 300);
    
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
            className={`w-full border ${error ? 'border-red-500' : 'border-gray-400'} rounded-md px-3 py-2 h-[42px] text-[14px]`}
            placeholder="Enter player name"
          />
          {error && (
            <p className="mt-1 text-[12px] text-red-600">{error}</p>
          )}
        </div>
        
        <div className='mb-4'>
          <label className="block text-[13px] mb-2 text-gray-800">
            Skill Level:
          </label>
          <div className="flex flex-row sm:gap-0 gap-2">
            <label
              className={`flex items-center px-4 py-2 rounded-[50px] cursor-pointer w-full justify-center text-[12px] border-b-[2px] border-b-gray-200 
                ${skillLevel === 'beginner' ? 'bg-green-200 text-green-800 border-b-green-600' : 'bg-gray-100'}
              `}
            >
              <input
                type="radio"
                name="skillLevel"
                checked={skillLevel === 'beginner'}
                onChange={() => setSkillLevel('beginner')}
                className="hidden"
              />
              Beginner
            </label>

            <label
              className={`flex items-center px-4 py-2 rounded-[50px] cursor-pointer w-full justify-center text-[12px] border-b-[2px] border-b-gray-200
                ${skillLevel === 'intermediate' ? 'bg-yellow-200 text-yellow-800 border-b-yellow-600' : 'bg-gray-100'}
              `}
            >
              <input
                type="radio"
                name="skillLevel"
                checked={skillLevel === 'intermediate'}
                onChange={() => setSkillLevel('intermediate')}
                className="hidden"
              />
              Intermediate
            </label>

            <label
              className={`flex items-center px-4 py-2 rounded-[50px] cursor-pointer w-full justify-center text-[12px] border-b-[2px] border-b-gray-200
                ${skillLevel === 'advanced' ? 'bg-red-200 text-red-800 border-b-red-600' : 'bg-gray-100'}
              `}
            >
              <input
                type="radio"
                name="skillLevel"
                checked={skillLevel === 'advanced'}
                onChange={() => setSkillLevel('advanced')}
                className="hidden"
              />
              Advanced
            </label>
          </div>

        </div>
        
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2.5 px-4 rounded w-full cursor-pointer flex gap-1.5 items-center justify-center transition relative
             border-b-[4px] border-b-blue-700 hover:border-b-blue-800 active:border-b-blue-900 active:translate-y-[2px]"
          disabled={isAdding}
        >
          {isAdding ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding player...
            </>
          ) : (
            <><MdPersonAdd size={`1.1rem`} /> Add Player</>
          )}
        </button>
      </form>
    </div>
  );
}