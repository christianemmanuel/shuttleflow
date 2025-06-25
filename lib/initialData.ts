import { AppState, Court, FeeConfig } from '@/types';

// Initialize courts (6 courts)
export const initialCourts: Court[] = Array.from({ length: 3 }, (_, i) => ({
  id: i + 1,
  name: `Court ${i + 1}`,  // Add default name
  status: 'available',
  players: [],
  startTime: null,
  isDoubles: false,
  currentGameId: null,
  feeRate: 0.00
}));

// Initial fee configuration
export const initialFeeConfig: FeeConfig = {
  singlesFee: 0.00,
  doublesFee: 0.00,
  currency: 'PHP',
  autoCalculate: true,
  requirePayment: false,
  courtFeeType: "perHead",     // default
  courtFeeAmount: 0,
  numCourts: 1
};

// Initial application state
export const initialAppState: AppState = {
  players: [],
  courts: initialCourts,
  queue: [],
  feeConfig: initialFeeConfig,
  gameSessions: [],
  matchHistory: []
};
