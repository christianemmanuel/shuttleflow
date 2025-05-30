import { useState, useCallback, useRef } from 'react';

export default function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const openModal = useCallback(() => {
    // Clear any existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    setIsOpen(true);
  }, []);
  
  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);
  
  const toggleModal = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);
  
  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  };
}