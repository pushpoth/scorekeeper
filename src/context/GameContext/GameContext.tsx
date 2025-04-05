
/**
 * Game Context
 * 
 * This file contains the context provider for managing game state,
 * providing functions for game operations, player management, and data persistence.
 */

import { 
  createContext, 
  useContext, 
  useReducer, 
  useEffect, 
  ReactNode, 
  useCallback,
  useState
} from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/hooks/use-toast";
import { stringToColor, getRandomEmoji } from "@/utils/gameUtils";
import { 
  Game, 
  Player, 
  PlayerScore,
  Round,
  DbPlayer,
  DbGame,
  DbRound,
  DbPlayerScore,
  GameType
} from "@/types";
import { gameReducer, GameState, GameAction } from "./gameReducer";
import { 
  processJsonImport, 
  processCsvImport,
  createJsonExport,
  createCsvExport,
  validateGamePlayers
} from "@/utils/gameOperations";
import { generateUniqueCode } from "@/utils/codeGenerator";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface GameContextType {
  games: Game[];
  players: Player[];
  createGame: (date: Date, playerIds: string[], gameType: GameType) => string;
  addPlayer: (name: string, initialMoney?: number) => string;
  addRound: (gameId: string, roundData: {
    playerScores: PlayerScore[];
    potAmount?: number;
    winnerId?: string;
    winningHand?: string;
  }) => void;
  getGame: (gameId: string) => Game | undefined;
  getGameByCode: (code: string) => Game | undefined;
  deleteGame: (gameId: string) => void;
  deleteMultipleGames: (gameIds: string[]) => void;
  updatePlayerScore: (gameId: string, roundId: string, playerScore: PlayerScore) => void;
  updateAllPlayerScores: (gameId: string, roundId: string, playerScores: PlayerScore[]) => void;
  deleteRound: (gameId: string, roundId: string) => void;
  deleteMultipleRounds: (gameId: string, roundIds: string[]) => void;
  updatePlayerAvatar: (playerId: string, avatar: Player["avatar"]) => void;
  updatePlayerManualScore: (playerId: string, manualTotal?: number) => void;
  updatePlayerMoney: (playerId: string, money?: number) => void;
  exportGameData: () => void;
  exportCsvData: () => void;
  importGameData: (jsonData: string) => boolean;
  importCsvData: (csvData: string) => boolean;
  loading: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const initialState: GameState = {
  games: [],
  players: []
};

interface GameProviderProps {
  children: ReactNode;
}

/**
 * The primary Game context provider that manages game state and operations.
 */
export const GameProvider = ({ children }: GameProviderProps) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Load data from localStorage or Supabase on init
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (user) {
          // User is authenticated, try to load from Supabase first
          await loadDataFromSupabase();
        } else {
          // No user, load from localStorage
          loadDataFromStorage();
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error loading data",
          description: "Failed to load your game data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]); // Re-run when user changes (login/logout)
  
  // Sync data to Supabase when it changes (if user is authenticated)
  useEffect(() => {
    const syncDataToSupabase = async () => {
      if (!user) return;
      
      try {
        console.log('Syncing data with Supabase for user:', user.id);
        await saveDataToSupabase();
      } catch (error) {
        console.error("Error syncing with Supabase:", error);
      }
    };
    
    // Don't run on initial load (loading state)
    if (!loading && user) {
      syncDataToSupabase();
    }
  }, [state.games, state.players, user]);
  
  // Always sync to localStorage regardless of auth state
  useEffect(() => {
    localStorage.setItem("phase10-games", JSON.stringify(state.games));
  }, [state.games]);
  
  useEffect(() => {
    localStorage.setItem("phase10-players", JSON.stringify(state.players));
  }, [state.players]);

  /**
   * Load data from local storage
   */
  const loadDataFromStorage = () => {
    try {
      const savedGames = localStorage.getItem("phase10-games");
      const savedPlayers = localStorage.getItem("phase10-players");
      
      if (savedGames) {
        try {
          const parsedGames = JSON.parse(savedGames);
          const gamesWithDates = parsedGames.map((game: any) => ({
            ...game,
            date: new Date(game.date),
            gameType: game.gameType || "Phase 10" // Default to Phase 10 for older games
          }));
          
          dispatch({ type: 'SET_GAMES', payload: gamesWithDates });
        } catch (error) {
          console.error("Failed to parse saved games", error);
          toast({
            title: "Error",
            description: "Failed to load saved games",
            variant: "destructive",
          });
        }
      }
      
      if (savedPlayers) {
        try {
          const parsedPlayers = JSON.parse(savedPlayers);
          
          const playersWithDefaults = parsedPlayers.map((player: Player) => {
            let updatedPlayer = player;
            
            // Add color if missing
            if (!updatedPlayer.color) {
              updatedPlayer = {
                ...updatedPlayer,
                color: stringToColor(player.name)
              };
            }
            
            // Initialize money if missing
            if (updatedPlayer.money === undefined) {
              updatedPlayer = {
                ...updatedPlayer,
                money: 0
              };
            }
            
            // Add default avatar if missing
            if (!updatedPlayer.avatar) {
              updatedPlayer = {
                ...updatedPlayer,
                avatar: {
                  type: "emoji",
                  value: getRandomEmoji()
                }
              };
            }
            
            return updatedPlayer;
          });
          
          dispatch({ type: 'SET_PLAYERS', payload: playersWithDefaults });
        } catch (error) {
          console.error("Failed to parse saved players", error);
        }
      }
    } catch (error) {
      console.error("Error loading data from storage:", error);
    }
  };

  /**
   * Load user's games and players from Supabase
   */
  const loadDataFromSupabase = async () => {
    if (!user) return;
    
    try {
      console.log("Loading data from Supabase for user:", user.id);
      
      // Load players
      const { data: dbPlayers, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', user.id);
      
      if (playersError) throw playersError;
      
      // Transform database player objects to our application Player type
      const appPlayers: Player[] = [];
      
      if (dbPlayers && dbPlayers.length > 0) {
        for (const dbPlayer of dbPlayers) {
          const player: Player = {
            id: dbPlayer.id,
            name: dbPlayer.name,
            color: dbPlayer.color || stringToColor(dbPlayer.name),
            money: dbPlayer.money || 0
          };
          
          // Parse avatar if it exists
          if (dbPlayer.avatar) {
            try {
              player.avatar = JSON.parse(dbPlayer.avatar);
            } catch (e) {
              console.warn("Failed to parse player avatar", e);
              // Set default avatar
              player.avatar = {
                type: "emoji",
                value: getRandomEmoji()
              };
            }
          } else {
            // Set default avatar
            player.avatar = {
              type: "emoji",
              value: getRandomEmoji()
            };
          }
          
          // Add manual total if it exists
          if (dbPlayer.manual_total !== null) {
            player.manualTotal = dbPlayer.manual_total;
          }
          
          appPlayers.push(player);
        }
      }
      
      // Load games
      const { data: dbGames, error: gamesError } = await supabase
        .from('games')
        .select('*')
        .eq('user_id', user.id);
      
      if (gamesError) throw gamesError;
      
      // Process games data
      const appGames: Game[] = [];
      
      if (dbGames && dbGames.length > 0) {
        for (const dbGame of dbGames) {
          // Load players for this game
          const { data: gamePlayers, error: gamePlayersError } = await supabase
            .from('game_players')
            .select('player_id')
            .eq('game_id', dbGame.id);
          
          if (gamePlayersError) throw gamePlayersError;
          
          // Find player objects for this game
          const gamePlayerObjects = gamePlayers 
            ? gamePlayers
                .map(gp => appPlayers.find(p => p.id === gp.player_id))
                .filter(Boolean) as Player[]
            : [];
          
          // Load rounds for this game
          const { data: dbRounds, error: roundsError } = await supabase
            .from('rounds')
            .select('*')
            .eq('game_id', dbGame.id)
            .order('round_number', { ascending: true });
          
          if (roundsError) throw roundsError;
          
          // Process rounds with player scores
          const appRounds = await Promise.all((dbRounds || []).map(async (dbRound) => {
            const { data: dbScores, error: scoresError } = await supabase
              .from('player_scores')
              .select('*')
              .eq('round_id', dbRound.id);
            
            if (scoresError) throw scoresError;
            
            // Convert DB scores to app scores
            const playerScores: PlayerScore[] = (dbScores || []).map(dbScore => ({
              id: dbScore.id,
              playerId: dbScore.player_id,
              score: dbScore.score,
              phase: dbScore.phase,
              completed: dbScore.completed,
              isWinner: dbScore.is_winner || false
            }));
            
            return {
              id: dbRound.id,
              playerScores: playerScores,
              potAmount: dbRound.pot_amount,
              winnerId: dbRound.winner_id,
              winningHand: dbRound.winning_hand
            };
          }));
          
          // Create game object
          const game: Game = {
            id: dbGame.id,
            uniqueCode: dbGame.unique_code || generateUniqueCode(),
            date: new Date(dbGame.date),
            players: gamePlayerObjects,
            rounds: appRounds,
            gameType: dbGame.game_type || "Phase 10" // Default to Phase 10 for older games
          };
          
          appGames.push(game);
        }
      }
      
      // Set games and players in state
      if (appGames.length > 0) {
        dispatch({ type: 'SET_GAMES', payload: appGames });
      }
      
      if (appPlayers.length > 0) {
        dispatch({ type: 'SET_PLAYERS', payload: appPlayers });
      }
      
      console.log(`Loaded ${appGames.length} games and ${appPlayers.length} players from Supabase`);
    } catch (error) {
      console.error("Error loading data from Supabase:", error);
      // Fall back to local storage if Supabase fails
      loadDataFromStorage();
      throw error;
    }
  };
  
  /**
   * Save all games and players to Supabase
   */
  const saveDataToSupabase = async () => {
    if (!user) return;
    
    try {
      console.log("Saving data to Supabase for user:", user.id);
      
      // Save all players first
      for (const player of state.players) {
        const dbPlayer = {
          id: player.id,
          name: player.name,
          color: player.color,
          avatar: player.avatar ? JSON.stringify(player.avatar) : null,
          manual_total: player.manualTotal,
          money: player.money || 0,
          user_id: user.id
        };
        
        const { error } = await supabase
          .from('players')
          .upsert(dbPlayer, {
            onConflict: 'id'
          });
          
        if (error) throw error;
      }
      
      // Save all games
      for (const game of state.games) {
        // Make sure game has a unique code
        const uniqueCode = game.uniqueCode || generateUniqueCode();
        
        // Upsert the game
        const dbGame = {
          id: game.id,
          date: game.date.toISOString(),
          user_id: user.id,
          unique_code: uniqueCode,
          game_type: game.gameType || "Phase 10"
        };
        
        const { error: gameError } = await supabase
          .from('games')
          .upsert(dbGame, {
            onConflict: 'id'
          });
        
        if (gameError) throw gameError;
        
        // Update unique code in local state if it was just generated
        if (!game.uniqueCode) {
          dispatch({ 
            type: 'UPDATE_GAME_UNIQUE_CODE', 
            payload: { gameId: game.id, uniqueCode } 
          });
        }
        
        // Link players to game
        for (const player of game.players) {
          const { error: playerLinkError } = await supabase
            .from('game_players')
            .upsert({
              game_id: game.id,
              player_id: player.id
            }, {
              onConflict: 'game_id,player_id'
            });
          
          if (playerLinkError) throw playerLinkError;
        }
        
        // Save rounds
        for (let roundIndex = 0; roundIndex < game.rounds.length; roundIndex++) {
          const round = game.rounds[roundIndex];
          
          // Upsert the round
          const { error: roundError } = await supabase
            .from('rounds')
            .upsert({
              id: round.id,
              game_id: game.id,
              round_number: roundIndex + 1,
              pot_amount: round.potAmount || 0,
              winner_id: round.winnerId,
              winning_hand: round.winningHand
            }, {
              onConflict: 'id'
            });
          
          if (roundError) throw roundError;
          
          // Save player scores
          for (const score of round.playerScores) {
            const dbScore = {
              id: score.id || uuidv4(),
              round_id: round.id,
              player_id: score.playerId,
              score: score.score,
              phase: score.phase,
              completed: score.completed,
              is_winner: score.isWinner || false
            };
            
            const { error: scoreError } = await supabase
              .from('player_scores')
              .upsert(dbScore, {
                onConflict: 'id'
              });
            
            if (scoreError) throw scoreError;
          }
        }
      }
      
      console.log(`Saved ${state.games.length} games and ${state.players.length} players to Supabase`);
    } catch (error) {
      console.error("Error saving to Supabase:", error);
      toast({
        title: "Sync Error",
        description: "Failed to save your game data",
        variant: "destructive",
      });
      throw error;
    }
  };

  /**
   * Creates a new game with the given date and players
   */
  const createGame = useCallback((date: Date, playerIds: string[], gameType: GameType = "Phase 10"): string => {
    const selectedPlayers = state.players.filter(player => playerIds.includes(player.id));
    
    const newGame: Game = {
      id: uuidv4(),
      uniqueCode: generateUniqueCode(),
      date,
      players: selectedPlayers,
      rounds: [],
      gameType
    };
    
    dispatch({ type: 'CREATE_GAME', payload: newGame });
    
    toast({
      title: "Game created",
      description: `New ${gameType} game created with ${selectedPlayers.length} players`
    });
    
    return newGame.id;
  }, [state.players]);

  /**
   * Adds a new player with the given name
   */
  const addPlayer = useCallback((name: string, initialMoney: number = 0): string => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Player name cannot be empty",
        variant: "destructive",
      });
      return "";
    }
    
    if (state.players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      toast({
        title: "Error",
        description: `Player "${name}" already exists`,
        variant: "destructive",
      });
      return "";
    }
    
    const newPlayer: Player = {
      id: uuidv4(),
      name: name.trim(),
      color: stringToColor(name.trim()),
      money: initialMoney,
      avatar: {
        type: "emoji",
        value: getRandomEmoji()
      }
    };
    
    dispatch({ type: 'ADD_PLAYER', payload: newPlayer });
    
    toast({
      title: "Player added",
      description: `${name} has been added to the player list`
    });
    
    return newPlayer.id;
  }, [state.players]);

  /**
   * Adds a new round to the given game
   */
  const addRound = useCallback((gameId: string, roundData: {
    playerScores: PlayerScore[];
    potAmount?: number;
    winnerId?: string;
    winningHand?: string;
  }) => {
    const game = state.games.find(g => g.id === gameId);
    
    if (!game) {
      toast({
        title: "Error",
        description: "Game not found",
        variant: "destructive",
      });
      return;
    }
    
    // Ensure each playerScore has an ID
    const playerScoresWithIds = roundData.playerScores.map(ps => ({
      ...ps,
      id: ps.id || uuidv4()
    }));
    
    // Update player money if a pot amount and winner are specified
    if (roundData.potAmount && roundData.potAmount > 0 && roundData.winnerId) {
      const winningPlayer = state.players.find(p => p.id === roundData.winnerId);
      
      if (winningPlayer) {
        const currentMoney = winningPlayer.money || 0;
        const newMoney = currentMoney + roundData.potAmount;
        
        dispatch({ 
          type: 'UPDATE_PLAYER_MONEY', 
          payload: { 
            playerId: winningPlayer.id, 
            money: newMoney 
          } 
        });
      }
    }
    
    const newRound: Round = {
      id: uuidv4(),
      playerScores: playerScoresWithIds,
      potAmount: roundData.potAmount,
      winnerId: roundData.winnerId,
      winningHand: roundData.winningHand
    };
    
    dispatch({ 
      type: 'ADD_ROUND', 
      payload: { gameId, round: newRound } 
    });
    
    toast({
      title: "Round added",
      description: `Round ${game.rounds.length + 1} has been added`
    });
  }, [state.games, state.players]);

  /**
   * Gets a game by its ID
   */
  const getGame = useCallback((gameId: string): Game | undefined => {
    return state.games.find(g => g.id === gameId);
  }, [state.games]);

  /**
   * Gets a game by its unique code
   */
  const getGameByCode = useCallback((code: string): Game | undefined => {
    return state.games.find(g => g.uniqueCode === code);
  }, [state.games]);

  /**
   * Deletes a game
   */
  const deleteGame = useCallback(async (gameId: string) => {
    if (user) {
      try {
        // First delete all player scores for this game's rounds
        const game = state.games.find(g => g.id === gameId);
        if (game) {
          for (const round of game.rounds) {
            // Delete player scores for this round
            await supabase
              .from('player_scores')
              .delete()
              .eq('round_id', round.id);
          }
        }
        
        // Delete rounds
        await supabase
          .from('rounds')
          .delete()
          .eq('game_id', gameId);
        
        // Delete game_players
        await supabase
          .from('game_players')
          .delete()
          .eq('game_id', gameId);
        
        // Delete game
        await supabase
          .from('games')
          .delete()
          .eq('id', gameId);
      } catch (error) {
        console.error("Error deleting game from Supabase:", error);
      }
    }
    
    dispatch({ type: 'DELETE_GAME', payload: gameId });
    
    toast({
      title: "Game deleted",
      description: "The game has been removed"
    });
  }, [user, state.games]);

  /**
   * Deletes multiple games at once
   */
  const deleteMultipleGames = useCallback(async (gameIds: string[]) => {
    if (gameIds.length === 0) return;
    
    if (user) {
      try {
        for (const gameId of gameIds) {
          // First delete all player scores for this game's rounds
          const game = state.games.find(g => g.id === gameId);
          if (game) {
            for (const round of game.rounds) {
              // Delete player scores for this round
              await supabase
                .from('player_scores')
                .delete()
                .eq('round_id', round.id);
            }
          }
          
          // Delete rounds
          await supabase
            .from('rounds')
            .delete()
            .eq('game_id', gameId);
          
          // Delete game_players
          await supabase
            .from('game_players')
            .delete()
            .eq('game_id', gameId);
        }
        
        // Delete games
        await supabase
          .from('games')
          .delete()
          .in('id', gameIds);
      } catch (error) {
        console.error("Error deleting games from Supabase:", error);
      }
    }
    
    dispatch({ type: 'DELETE_MULTIPLE_GAMES', payload: gameIds });
    
    toast({
      title: "Games deleted",
      description: `${gameIds.length} games have been removed`
    });
  }, [user, state.games]);

  /**
   * Updates a player score in a round
   */
  const updatePlayerScore = useCallback((gameId: string, roundId: string, updatedPlayerScore: PlayerScore) => {
    // Ensure score has an ID
    const scoreWithId = {
      ...updatedPlayerScore,
      id: updatedPlayerScore.id || uuidv4()
    };
    
    dispatch({ 
      type: 'UPDATE_PLAYER_SCORE', 
      payload: { 
        gameId, 
        roundId, 
        playerScore: scoreWithId
      } 
    });
  }, []);

  /**
   * Updates all player scores in a round
   */
  const updateAllPlayerScores = useCallback((gameId: string, roundId: string, updatedPlayerScores: PlayerScore[]) => {
    // Ensure all scores have IDs
    const scoresWithIds = updatedPlayerScores.map(score => ({
      ...score,
      id: score.id || uuidv4()
    }));
    
    dispatch({ 
      type: 'UPDATE_ALL_PLAYER_SCORES', 
      payload: { 
        gameId, 
        roundId, 
        playerScores: scoresWithIds 
      } 
    });
    
    toast({
      title: "Round updated",
      description: "The round scores have been updated"
    });
  }, []);

  /**
   * Deletes a round from a game
   */
  const deleteRound = useCallback(async (gameId: string, roundId: string) => {
    if (user) {
      try {
        // Delete player scores for this round
        await supabase
          .from('player_scores')
          .delete()
          .eq('round_id', roundId);
        
        // Delete round
        await supabase
          .from('rounds')
          .delete()
          .eq('id', roundId);
      } catch (error) {
        console.error("Error deleting round from Supabase:", error);
      }
    }
    
    dispatch({ 
      type: 'DELETE_ROUND', 
      payload: { gameId, roundId } 
    });
    
    toast({
      title: "Round deleted",
      description: "The round has been removed from the game"
    });
  }, [user]);

  /**
   * Deletes multiple rounds from a game
   */
  const deleteMultipleRounds = useCallback(async (gameId: string, roundIds: string[]) => {
    if (roundIds.length === 0) return;
    
    if (user) {
      try {
        // Delete player scores for these rounds
        await supabase
          .from('player_scores')
          .delete()
          .in('round_id', roundIds);
        
        // Delete rounds
        await supabase
          .from('rounds')
          .delete()
          .in('id', roundIds);
      } catch (error) {
        console.error("Error deleting rounds from Supabase:", error);
      }
    }
    
    dispatch({ 
      type: 'DELETE_MULTIPLE_ROUNDS', 
      payload: { gameId, roundIds } 
    });
    
    toast({
      title: "Rounds deleted",
      description: `${roundIds.length} rounds have been removed from the game`
    });
  }, [user]);

  /**
   * Updates a player's avatar
   */
  const updatePlayerAvatar = useCallback((playerId: string, avatar: Player["avatar"]) => {
    dispatch({ 
      type: 'UPDATE_PLAYER_AVATAR', 
      payload: { playerId, avatar } 
    });
    
    toast({
      title: "Avatar updated",
      description: "The player's avatar has been updated"
    });
  }, []);

  /**
   * Updates a player's manual score
   */
  const updatePlayerManualScore = useCallback((playerId: string, manualTotal?: number) => {
    dispatch({ 
      type: 'UPDATE_PLAYER_MANUAL_SCORE', 
      payload: { playerId, manualTotal } 
    });
    
    toast({
      title: "Score updated",
      description: "The player's manual score has been updated"
    });
  }, []);

  /**
   * Updates a player's money
   */
  const updatePlayerMoney = useCallback((playerId: string, money?: number) => {
    dispatch({ 
      type: 'UPDATE_PLAYER_MONEY', 
      payload: { playerId, money } 
    });
    
    toast({
      title: "Money updated",
      description: "The player's money has been updated"
    });
  }, []);

  /**
   * Exports game data as JSON
   */
  const exportGameData = useCallback(() => {
    try {
      const dataStr = createJsonExport(state.games, state.players);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileDefaultName = `scorekeeper_data_${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Export successful",
        description: "Your game data has been exported successfully"
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export failed",
        description: "Failed to export game data",
        variant: "destructive",
      });
    }
  }, [state.games, state.players]);

  /**
   * Exports game data as CSV
   */
  const exportCsvData = useCallback(() => {
    try {
      const csv = createCsvExport(state.games, state.players);
      const dataUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
      
      const exportFileDefaultName = `scorekeeper_data_${new Date().toISOString().slice(0, 10)}.csv`;
      
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "CSV Export successful",
        description: "Your game data has been exported to CSV successfully"
      });
    } catch (error) {
      console.error("CSV Export failed:", error);
      toast({
        title: "Export failed",
        description: "Failed to export CSV data",
        variant: "destructive",
      });
    }
  }, [state.games, state.players]);

  /**
   * Imports game data from JSON
   */
  const importGameData = useCallback((jsonData: string): boolean => {
    try {
      const processedData = processJsonImport(jsonData);
      
      if (!processedData) {
        throw new Error("Invalid data format");
      }
      
      const { games, players } = processedData;
      
      dispatch({ type: 'SET_GAMES', payload: games });
      dispatch({ type: 'SET_PLAYERS', payload: players });
      
      toast({
        title: "Import successful",
        description: `Imported ${games.length} games and ${players.length} players`
      });
      
      return true;
    } catch (error) {
      console.error("Import failed:", error);
      toast({
        title: "Import failed",
        description: "Failed to import game data. Make sure the file is valid.",
        variant: "destructive",
      });
      return false;
    }
  }, []);

  /**
   * Imports game data from CSV
   */
  const importCsvData = useCallback((csvData: string): boolean => {
    try {
      const processedData = processCsvImport(csvData, state.players);
      
      if (!processedData) {
        throw new Error("Invalid CSV data format");
      }
      
      const { games, newPlayers } = processedData;
      
      if (newPlayers.length > 0) {
        dispatch({ type: 'ADD_MULTIPLE_PLAYERS', payload: newPlayers });
      }
      
      if (games.length > 0) {
        dispatch({ type: 'ADD_MULTIPLE_GAMES', payload: games });
      }
      
      toast({
        title: "CSV import successful",
        description: `Imported ${games.length} games from CSV data`
      });
      
      return true;
    } catch (error) {
      console.error("CSV Import failed:", error);
      toast({
        title: "CSV import failed",
        description: "Failed to import CSV data. Make sure the file is valid.",
        variant: "destructive",
      });
      return false;
    }
  }, [state.players]);

  const value = {
    games: state.games,
    players: state.players,
    loading,
    createGame,
    addPlayer,
    addRound,
    getGame,
    getGameByCode,
    deleteGame,
    deleteMultipleGames,
    updatePlayerScore,
    updateAllPlayerScores,
    deleteRound,
    deleteMultipleRounds,
    updatePlayerAvatar,
    updatePlayerManualScore,
    updatePlayerMoney,
    exportGameData,
    exportCsvData,
    importGameData,
    importCsvData
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

/**
 * Hook to use the game context
 */
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};
