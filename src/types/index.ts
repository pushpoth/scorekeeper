
export interface Player {
  id: string;
  name: string;
  avatar?: {
    type: "letter" | "emoji" | "image";
    value: string;
  };
  color?: string; // Add support for player color
  manualTotal?: number; // Add support for manual score override
}

export interface Round {
  id: string;
  playerScores: PlayerScore[];
}

export interface PlayerScore {
  id?: string; // Added ID field for DB persistance
  playerId: string;
  score: number;
  phase: number;
  completed: boolean;
}

export interface Game {
  id: string;
  uniqueCode?: string; // Added unique code field
  date: Date;
  players: Player[];
  rounds: Round[];
}

export type ThemeMode = "light" | "dark";

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
