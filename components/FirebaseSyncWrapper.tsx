'use client';

import { useEffect, useState, useRef } from 'react';
import { useData } from '@/context/DataContext';
import { database } from '@/lib/firebase';
import { ref, get, set, onValue } from 'firebase/database';

export default function FirebaseSyncWrapper({ children }: { children: React.ReactNode }) {
  const { state, isSharing, shareId, setInitialSharingState } = useData();
  const [syncInitialized, setSyncInitialized] = useState(false);
  const activeListenerRef = useRef<(() => void) | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize sharing state from localStorage on app load
  useEffect(() => {
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
              console.log("Queue exists, restoring sharing state");
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
              console.log("Queue no longer exists, clearing sharing state");
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
  
  // Simple debounce function without using lodash
  const debouncedUpdate = (fn: Function, delay: number) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      fn();
      timeoutRef.current = null;
    }, delay);
  };
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Sync to Firebase whenever relevant state changes with debouncing
  useEffect(() => {
    if (isSharing && shareId) {
      debouncedUpdate(async () => {
        try {
          const queueRef = ref(database, `queues/${shareId}`);
          await set(queueRef, {
            queue: state.queue,
            players: state.players,
            courts: state.courts,
            lastUpdated: new Date().toISOString()
          });
          console.log("Firebase updated successfully");
        } catch (error) {
          console.error("Error updating Firebase:", error);
        }
      }, 300); // 300ms debounce time
    }
  }, [isSharing, shareId, state.queue, state.players, state.courts]);
  
  // Add listener for external changes (optional)
  useEffect(() => {
    if (isSharing && shareId) {
      const queueRef = ref(database, `queues/${shareId}`);
      const unsubscribe = onValue(queueRef, (snapshot) => {
        if (!snapshot.exists()) {
          console.log("Queue was deleted externally");
          localStorage.removeItem('queueShareId');
          localStorage.removeItem('queueIsSharing');
          setInitialSharingState('', false);
        }
      }, { onlyOnce: false });
      
      activeListenerRef.current = unsubscribe;
      
      return () => {
        if (activeListenerRef.current) {
          activeListenerRef.current();
          activeListenerRef.current = null;
        }
      };
    }
  }, [isSharing, shareId, setInitialSharingState]);
  
  return <>{children}</>;
}