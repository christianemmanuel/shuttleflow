import { AppState } from '@/types';

// Save data to localStorage
export const saveToLocalStorage = (key: string, data: any): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// Load data from localStorage
export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window !== 'undefined') {
    const storedData = localStorage.getItem(key);
    if (storedData) {
      try {
        return JSON.parse(storedData) as T;
      } catch (error) {
        console.error('Error parsing data from localStorage:', error);
        return defaultValue;
      }
    }
  }
  return defaultValue;
};

// Save entire app state
export const saveAppState = (state: AppState): void => {
  saveToLocalStorage('badminton-app-state', state);
};

// Load entire app state
export const loadAppState = (defaultState: AppState): AppState => {
  return loadFromLocalStorage<AppState>('badminton-app-state', defaultState);
};

// Reset all data
export const resetAllData = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('badminton-app-state');
  }
};

// Reset only court data
export const resetCourts = (state: AppState): AppState => {
  const newState = { ...state };
  newState.courts = newState.courts.map(court => ({
    ...court,
    status: 'available',
    players: [],
    startTime: null,
    isDoubles: false,
    currentGameId: null,
  }));
  saveAppState(newState);
  return newState;
};