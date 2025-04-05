
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

export const getLastPlayedPhase = (game: Game, playerId: string): { phase: number, completed: boolean } | null => {
  if (!game.rounds.length) return null;
  
  // Start from the most recent round and find the first round where this player has a score
  for (let i = game.rounds.length - 1; i >= 0; i--) {
    const playerScore = game.rounds[i].playerScores.find(ps => ps.playerId === playerId);
    if (playerScore) {
      return { 
        phase: playerScore.phase,
        completed: playerScore.completed
      };
    }
  }
  
  return null;
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
  color?: string;
  money?: number;
}[] => {
  if (!games.length || !players.length) return [];
  
  // Calculate totals for each player
  const totals = players.map(player => {
    // Use manual total if defined, otherwise calculate from games
    const total = player.manualTotal !== undefined 
      ? player.manualTotal 
      : calculateGrandTotal(games, player.id);
      
    return { 
      playerId: player.id, 
      name: player.name, 
      total,
      color: player.color,
      money: player.money || 0
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

// Generate a random color based on string input
export const stringToColor = (str: string): string => {
  // Use a hash function to convert string to a number
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert the hash to a color with good contrast and saturation
  // Avoid very light colors that would be hard to see on white backgrounds
  const h = Math.abs(hash) % 360; // Hue (0-359)
  const s = 65 + Math.abs(hash % 20); // Saturation (65-85%)
  const l = 45 + Math.abs(hash % 10); // Lightness (45-55%)
  
  return `hsl(${h}, ${s}%, ${l}%)`;
};

// Game-related emojis for player avatars
const gameEmojis = [
  "🃏", "🎲", "🎯", "🎪", "🎭", "🎮", "🎰", 
  "🎪", "🎨", "🎬", "🎸", "🎹", "🎺", "🎻",
  "🥇", "🥈", "🥉", "🏆", "🏅", "🎖️", "🎗️",
  "🎟️", "🎫", "🎩", "🎪", "🎭", "🎨", "🎰",
  "♠️", "♥️", "♦️", "♣️", "🀄", "🎴", "🎱"
];

export const getRandomEmoji = (): string => {
  return gameEmojis[Math.floor(Math.random() * gameEmojis.length)];
};

// Get the total money for a player across all games
export const getPlayerTotalMoney = (playerId: string, players: Player[]): number => {
  const player = players.find(p => p.id === playerId);
  return player?.money || 0;
};

// Get winner information for a round
export const getRoundWinnerInfo = (round: Round, players: Player[]): {
  winnerName: string;
  potAmount: number;
  winningHand?: string;
} | null => {
  if (!round.winnerId) return null;
  
  const winner = players.find(p => p.id === round.winnerId);
  if (!winner) return null;
  
  return {
    winnerName: winner.name,
    potAmount: round.potAmount || 0,
    winningHand: round.winningHand
  };
};
