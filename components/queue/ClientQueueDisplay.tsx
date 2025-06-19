'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Import the component with no SSR
const QueueDisplay = dynamic(() => import('./QueueDisplay'), { 
  ssr: false,
});

export default function ClientQueueDisplay() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading queue...</div>}>
      <QueueDisplay />
    </Suspense>
  );
}