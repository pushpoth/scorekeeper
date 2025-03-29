

export interface Player {
  id: string;
  name: string;
  avatar?: {
    type: "letter" | "emoji" | "image";
    value: string;
  };
}

export interface Round {
  id: string;
  playerScores: PlayerScore[];
}

export interface PlayerScore {
  playerId: string;
  score: number;
  phase: number;
  completed: boolean;
}

export interface Game {
  id: string;
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

