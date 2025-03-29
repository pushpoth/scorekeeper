
import { Game, Player, PlayerScore } from "@/types";

export const calculateTotalScore = (game: Game, playerId: string): number => {
  return game.rounds.reduce((total, round) => {
    const playerScore = round.playerScores.find(ps => ps.playerId === playerId);
    return total + (playerScore?.score || 0);
  }, 0);
};

export const getPlayerName = (players: Player[], playerId: string): string => {
  const player = players.find(p => p.id === playerId);
  return player?.name || "Unknown Player";
};

export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export const sortGamesByDate = (games: Game[]): Game[] => {
  return [...games].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getCurrentPhase = (game: Game, playerId: string): number => {
  if (!game.rounds.length) return 1;
  
  const playerScores = game.rounds
    .flatMap(round => round.playerScores)
    .filter(ps => ps.playerId === playerId);
  
  const completedPhases = playerScores
    .filter(ps => ps.completed)
    .map(ps => ps.phase);
  
  if (!completedPhases.length) return 1;
  
  const maxCompletedPhase = Math.max(...completedPhases);
  return Math.min(maxCompletedPhase + 1, 10);
};

export const calculateGrandTotal = (games: Game[], playerId: string): number => {
  return games.reduce((total, game) => {
    // Only include games where the player participated
    if (game.players.some(p => p.id === playerId)) {
      return total + calculateTotalScore(game, playerId);
    }
    return total;
  }, 0);
};

export const getPlayerRankings = (games: Game[], players: Player[]): {
  playerId: string;
  name: string;
  total: number;
  rank: number;
}[] => {
  if (!games.length || !players.length) return [];
  
  // Calculate totals for each player
  const totals = players.map(player => {
    const total = calculateGrandTotal(games, player.id);
    return { 
      playerId: player.id, 
      name: player.name, 
      total
    };
  });
  
  // Sort by total (ascending, since lower is better in Phase 10)
  const sorted = [...totals].sort((a, b) => a.total - b.total);
  
  // Add rank
  return sorted.map((player, index) => ({
    ...player,
    rank: index + 1
  }));
};
