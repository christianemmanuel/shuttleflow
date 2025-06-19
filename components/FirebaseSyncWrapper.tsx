'use client';

import { useEffect, useState } from 'react';
import { useData } from '@/context/DataContext';
import { database } from '@/lib/firebase';
import { ref, get, set } from 'firebase/database';

export default function FirebaseSyncWrapper({ children }: { children: React.ReactNode }) {
  const { state, isSharing, shareId, setInitialSharingState } = useData();
  const [syncInitialized, setSyncInitialized] = useState(false);
  
  // Initialize sharing state from localStorage on app load
  useEffect(() => {
    // Load sharing state from localStorage
    if (typeof window !== 'undefined' && !syncInitialized) {
      const storedShareId = localStorage.getItem('queueShareId');
      const isStoredSharing = localStorage.getItem('queueIsSharing') === 'true';
      
      if (storedShareId && isStoredSharing) {
        // Verify the queue still exists in Firebase
        const verifyQueue = async () => {
          try {
            const queueRef = ref(database, `queues/${storedShareId}`);
            const snapshot = await get(queueRef);
            
            if (snapshot.exists()) {
              // Queue exists, initialize sharing state
              setInitialSharingState(storedShareId, true);
              
              // Update Firebase with current state
              await set(queueRef, {
                queue: state.queue,
                players: state.players,
                courts: state.courts,
                lastUpdated: new Date().toISOString()
              });
            } else {
              // Queue no longer exists, clear localStorage
              localStorage.removeItem('queueShareId');
              localStorage.removeItem('queueIsSharing');
            }
          } catch (error) {
            console.error("Error verifying queue:", error);
            localStorage.removeItem('queueShareId');
            localStorage.removeItem('queueIsSharing');
          }
        };
        
        verifyQueue();
      }
      
      setSyncInitialized(true);
    }
  }, [syncInitialized, setInitialSharingState, state]);
  
  // Sync to Firebase whenever relevant state changes
  useEffect(() => {
    if (isSharing && shareId) {
      const updateFirebase = async () => {
        try {
          const queueRef = ref(database, `queues/${shareId}`);
          await set(queueRef, {
            queue: state.queue,
            players: state.players,
            courts: state.courts,
            lastUpdated: new Date().toISOString()
          });
        } catch (error) {
          console.error("Error updating Firebase:", error);
        }
      };
      
      updateFirebase();
    }
  }, [isSharing, shareId, state.queue, state.players, state.courts]);
  
  return <>{children}</>;
}