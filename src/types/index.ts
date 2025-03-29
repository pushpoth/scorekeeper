
export interface Player {
  id: string;
  name: string;
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
