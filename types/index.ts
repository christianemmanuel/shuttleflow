// Player Data Type
export type Player = {
  id: string;
  name: string;
  skillLevel: "beginner" | "intermediate" | "advanced";
  gamesPlayed: number;
  inQueue: boolean;
  donePlaying: boolean
  currentlyPlaying: boolean;
  totalFees: number;
  paidFees: number;
  unpaidFees: number;
  feeHistory: FeeHistoryItem[];
};

// Fee History Item Type
export type FeeHistoryItem = {
  gameId: string;
  courtId: number;
  gameType: "singles" | "doubles";
  feeAmount: number;
  timestamp: string;
  paid: boolean;
};

// Court Data Type
export type Court = {
  id: number;
  status: "available" | "occupied";
  players: string[];
  startTime: string | null;
  isDoubles: boolean;
  currentGameId: string | null;
  feeRate: number;
};

// Queue Item Type
export type QueueItem = {
  id: string;
  playerIds: string[];
  requestedTime: string;
  isDoubles: boolean;
};

export type CourtFeeType = "perHead" | "perHour";

// Fee Configuration Type
export type FeeConfig = {
  singlesFee: number;
  doublesFee: number;
  currency: string;
  autoCalculate: boolean;
  requirePayment: boolean;
  courtFeeType?: CourtFeeType;      // "perHead" or "perHour"
  courtFeeAmount?: number;          // Amount (per player or per hour)
  numCourts?: number;               // Only used when "perHour"
  rentalHours?: number;
};

// Game Session Type
export type GameSession = {
  id: string;
  courtId: number;
  playerIds: string[];
  gameType: "singles" | "doubles";
  startTime: string;
  endTime: string | null;
  duration: number;
  feePerPlayer: number;
  totalFees: number;
  feesCollected: number;
  status: "active" | "completed";
};

// Game history record type
export interface MatchRecord {
  id: string;
  courtId: number;
  playerIds: string[];
  isDoubles: boolean;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  feesCharged: number;
  playerNames?: string[]; 
}

// Application State Type
export type AppState = {
  players: Player[];
  courts: Court[];
  queue: QueueItem[];
  feeConfig: FeeConfig;
  gameSessions: GameSession[];
  matchHistory: MatchRecord[];
};

