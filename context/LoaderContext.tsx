'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LoaderContextProps {
  showLoader: (message?: string) => void;
  hideLoader: () => void;
  isLoading: boolean;
  message: string;
}

const LoaderContext = createContext<LoaderContextProps>({
  showLoader: () => {},
  hideLoader: () => {},
  isLoading: false,
  message: ''
});

export function LoaderProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true); // Start with loader active
  const [message, setMessage] = useState("ShuttleFlow");
  const [initialLoad, setInitialLoad] = useState(true);

  // Show initial loader only once
  useEffect(() => {
    if (initialLoad) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setInitialLoad(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [initialLoad]);

  const showLoader = (newMessage = "Loading...") => {
    setMessage(newMessage);
    setIsLoading(true);
  };

  const hideLoader = () => {
    setIsLoading(false);
  };

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader, isLoading, message }}>
      {children}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  return useContext(LoaderContext);
}