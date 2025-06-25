'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import { FaPlus } from 'react-icons/fa';
import { useToast } from '@/context/ToastContext';

export default function CourtManagement() {
  const { state, addCourt } = useData();
  const { showToast } = useToast();

  const { courts } = state;
  
  const handleAddCourt = () => {
    addCourt();
    showToast('New court added', 'success');
  };
  
  return (
    <div className='mb-5 flex items-center justify-between gap-3 flex-wrap'>
      <h3 className="text-[16px] font-bold text-white">Court Management</h3>
      {courts.length <= 20 && (
        <button
          onClick={handleAddCourt}
          className={`text-[13px] text-white gap-1.5 py-1.5 px-5 rounded w-auto cursor-pointer flex items-center justify-center transition relative
                    active:translate-y-[3px] bg-blue-500 hover:bg-blue-600 border-b-blue-700 hover:border-b-blue-800 active:border-b-blue-900 border-b-[4px] m-0`}
        >
          <FaPlus size={12} /> Add new court
        </button>
      ) }
    </div>
  );
}