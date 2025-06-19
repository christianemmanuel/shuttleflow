'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IoIosClose } from "react-icons/io";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
}: ModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusElement = useRef<HTMLElement | null>(null);
  const animationTimeout = useRef<NodeJS.Timeout | null>(null);

  // Size mapping
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    'full': 'max-w-full'
  };

  // Mount after client side hydration
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
      // Clear any pending timeouts
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }
    };
  }, []);

  // Handle modal open/close
  useEffect(() => {
    // Clear any existing timeout
    if (animationTimeout.current) {
      clearTimeout(animationTimeout.current);
      animationTimeout.current = null;
    }

    if (isOpen) {
      // When opening
      setShowModal(true);
      setIsAnimating(true);
      
      // Start animation after a brief delay
      animationTimeout.current = setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.classList.remove('translate-y-full', 'opacity-0');
          modalRef.current.classList.add('translate-y-0', 'opacity-100');
        }
        setIsAnimating(false);
      }, 10);
    } else {
      // When closing
      if (showModal) {
        setIsAnimating(true);
        
        if (modalRef.current) {
          modalRef.current.classList.remove('translate-y-0', 'opacity-100');
          modalRef.current.classList.add('translate-y-full', 'opacity-0');
        }
        
        // Wait for animation to complete before removing from DOM
        animationTimeout.current = setTimeout(() => {
          setShowModal(false);
          setIsAnimating(false);
        }, 300); // Match duration of the CSS transition
      }
    }

    // Cleanup timeouts
    return () => {
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
        animationTimeout.current = null;
      }
    };
  }, [isOpen, showModal]);

  // Trap focus inside modal when open
  useEffect(() => {
    if (!isOpen) return;

    // Store the current active element to restore focus later
    previousFocusElement.current = document.activeElement as HTMLElement;

    // Focus the modal container
    if (modalRef.current) {
      modalRef.current.focus();
    }

    // Add escape key listener
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    
    // Disable body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      
      // Re-enable body scroll
      document.body.style.overflow = 'auto';

      // Restore focus
      if (previousFocusElement.current) {
        previousFocusElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Prevent clicks inside the modal from closing it
  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  // Don't render on server side or if modal shouldn't be shown
  if (!isMounted || !showModal) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-3 sm:px-4 transition-opacity duration-300 overflow-y-auto ${
        isAnimating ? 'pointer-events-none' : ''
      }`}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative w-full ${maxWidthClasses[maxWidth]} rounded-lg bg-white shadow-xl 
          translate-y-full opacity-0 transform transition-all duration-300 ease-out ${className}`}
        onClick={handleModalClick}
      >
        {/* Modal Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between rounded-t-lg px-4 pt-3">
            {title && (
              <h5 id="modal-title" className="text-[14px] font-medium text-gray-900">
                {title}
              </h5>
            )}
            {showCloseButton && (
              <button
                type="button"
                className="text-[25px] text-gray-600"
                onClick={onClose}
                aria-label="Close"
              >
                <IoIosClose />
              </button>
            )}
          </div>
        )}

        {/* Modal Content */}
        <div className="px-4 py-4 pt-3">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}