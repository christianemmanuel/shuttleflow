'use client';

import React, { useState, useEffect } from 'react';
import CourtCard from './CourtCard';
import { useData } from '@/context/DataContext';

export default function CourtDisplay() {
  const { state, completeMatch } = useData();
  const { courts, players } = state;
  
  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courts.map(court => (
          <CourtCard
            key={court.id}
            court={court}
            players={players}
            onComplete={() => completeMatch(court.id)}
          />
        ))}
      </div>
    </div>
  );
}