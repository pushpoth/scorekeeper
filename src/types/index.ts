
export interface Player {
  id: string;
  name: string;
  avatar?: {
    type: "letter" | "emoji" | "image";
    value: string;
  };
  color?: string;
  manualTotal?: number;
  money?: number; // Add support for player money
}

export interface Round {
  id: string;
  playerScores: PlayerScore[];
  potAmount?: number; // Add support for pot amount
  winnerId?: string; // Add support for round winner
  winningHand?: string; // Add support for winning hand in Poker
}

export interface PlayerScore {
  id?: string;
  playerId: string;
  score: number;
  phase: number;
  completed: boolean;
  isWinner?: boolean; // Track if this player won the round
}

export interface Game {
  id: string;
  uniqueCode?: string;
  date: Date;
  players: Player[];
  rounds: Round[];
  gameType: string; // Add support for game type
}

export type ThemeMode = "light" | "dark";

export type GameType = "Phase 10" | "Poker";

export interface ExportData {
  games: Game[];
  players: Player[];
  exportDate: string;
}

export interface CsvGameData {
  date: string;
  playerNames: string[];
  playerScores: number[];
  playerPhases: number[];
  phaseCompleted: boolean[];
  gameType: string; // Add game type to CSV data
}

// Selection interfaces for multi-select functionality
export interface Selection {
  selectedItems: string[];
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  toggleItem: (id: string) => void;
  selectAll: (ids: string[]) => void;
  deselectAll: () => void;
  isSelected: (id: string) => boolean;
  someSelected: () => boolean;
  allSelected: (totalItems: number) => boolean;
}

// Database interfaces for Supabase data mapping
export interface DbPlayer {
  id: string;
  name: string;
  color?: string;
  avatar?: string;
  manual_total?: number;
  money?: number; // Add money field
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbGame {
  id: string;
  date: string;
  unique_code?: string;
  game_type?: string; // Add game type field
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbRound {
  id: string;
  game_id: string;
  round_number: number;
  pot_amount?: number; // Add pot amount field
  winner_id?: string; // Add winner ID field
  winning_hand?: string; // Add winning hand field
  created_at?: string;
  updated_at?: string;
}

export interface DbPlayerScore {
  id: string;
  player_id: string;
  round_id: string;
  score: number;
  phase: number;
  completed: boolean;
  is_winner?: boolean; // Add winner indicator
  created_at?: string;
  updated_at?: string;
}

export type PokerHand = 
  | "High Card"
  | "One Pair"
  | "Two Pair"
  | "Three of a Kind"
  | "Straight"
  | "Flush"
  | "Full House"
  | "Four of a Kind"
  | "Straight Flush"
  | "Royal Flush";
