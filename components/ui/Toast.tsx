'use client';

import React, { useEffect, useState } from 'react';
import { IoCheckmarkCircle, IoInformationCircle, IoWarning, IoClose } from 'react-icons/io5';
import { BiErrorCircle } from 'react-icons/bi';
import { Toast as ToastType, useToast } from '@/context/ToastContext';

interface ToastProps {
  toast: ToastType;
}

export default function Toast({ toast }: ToastProps) {
  const { hideToast } = useToast();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        // Start exit animation
        setIsExiting(true);
        
        // Remove toast after animation completes
        setTimeout(() => {
          hideToast(toast.id);
        }, 300); // Match animation duration
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      hideToast(toast.id);
    }, 300);
  };

  const getToastIcon = () => {
    switch (toast.type) {
      case 'success':
        return <IoCheckmarkCircle className="text-white text-xl" />;
      case 'error':
        return <BiErrorCircle className="text-white text-xl" />;
      case 'warning':
        return <IoWarning className="text-white text-xl" />;
      case 'info':
      default:
        return <IoInformationCircle className="text-white text-xl" />;
    }
  };

  const getToastBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-amber-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-4 mb-3 rounded-md ${isExiting ? 'toast-exit' : 'toast-enter'} ${getToastBgColor()}`}
      role="alert"
    >
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-2">
          {getToastIcon()}
        </div>
        <div className="text-white">{toast.message}</div>
      </div>
      <button
        onClick={handleClose}
        className="ml-4 text-white hover:text-gray-200 focus:outline-none"
        aria-label="Close"
      >
        <IoClose />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-3 z-100 min-w-60 max-w-[calc(100vw-2rem)]">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}