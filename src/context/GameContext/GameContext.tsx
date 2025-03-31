
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
  useCallback 
} from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/hooks/use-toast";
import { stringToColor } from "@/utils/gameUtils";
import { Game, Player, PlayerScore } from "@/types";
import { gameReducer, GameState, GameAction } from "./gameReducer";
import { 
  processJsonImport, 
  processCsvImport,
  createJsonExport,
  createCsvExport,
  validateGamePlayers
} from "@/utils/gameOperations";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface GameContextType {
  games: Game[];
  players: Player[];
  createGame: (date: Date, playerIds: string[]) => string;
  addPlayer: (name: string) => string;
  addRound: (gameId: string, playerScores: PlayerScore[]) => void;
  getGame: (gameId: string) => Game | undefined;
  deleteGame: (gameId: string) => void;
  updatePlayerScore: (gameId: string, roundId: string, playerScore: PlayerScore) => void;
  updateAllPlayerScores: (gameId: string, roundId: string, playerScores: PlayerScore[]) => void;
  deleteRound: (gameId: string, roundId: string) => void;
  updatePlayerAvatar: (playerId: string, avatar: Player["avatar"]) => void;
  updatePlayerManualScore: (playerId: string, manualTotal?: number) => void;
  exportGameData: () => void;
  exportCsvData: () => void;
  importGameData: (jsonData: string) => boolean;
  importCsvData: (csvData: string) => boolean;
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
  const { user } = useAuth();
  
  // Load data from localStorage on init
  useEffect(() => {
    const loadDataFromStorage = () => {
      try {
        const savedGames = localStorage.getItem("phase10-games");
        const savedPlayers = localStorage.getItem("phase10-players");
        
        if (savedGames) {
          try {
            const parsedGames = JSON.parse(savedGames);
            const gamesWithDates = parsedGames.map((game: any) => ({
              ...game,
              date: new Date(game.date)
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
            
            const playersWithColors = parsedPlayers.map((player: Player) => {
              if (!player.color) {
                return {
                  ...player,
                  color: stringToColor(player.name)
                };
              }
              return player;
            });
            
            dispatch({ type: 'SET_PLAYERS', payload: playersWithColors });
          } catch (error) {
            console.error("Failed to parse saved players", error);
          }
        }
      } catch (error) {
        console.error("Error loading data from storage:", error);
      }
    };
    
    loadDataFromStorage();
  }, []);

  // Sync data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("phase10-games", JSON.stringify(state.games));
  }, [state.games]);
  
  useEffect(() => {
    localStorage.setItem("phase10-players", JSON.stringify(state.players));
  }, [state.players]);

  // Sync with Supabase when user changes
  useEffect(() => {
    const syncDataWithSupabase = async () => {
      if (!user) return;
      
      try {
        // Add code here to sync with Supabase
        console.log('Would sync with Supabase for user:', user.id);
        // This is where we'll add Supabase sync after implementing auth
      } catch (error) {
        console.error("Error syncing with Supabase:", error);
      }
    };
    
    syncDataWithSupabase();
  }, [user]);

  /**
   * Creates a new game with the given date and players
   */
  const createGame = useCallback((date: Date, playerIds: string[]): string => {
    const selectedPlayers = state.players.filter(player => playerIds.includes(player.id));
    
    const newGame: Game = {
      id: uuidv4(),
      date,
      players: selectedPlayers,
      rounds: []
    };
    
    dispatch({ type: 'CREATE_GAME', payload: newGame });
    
    toast({
      title: "Game created",
      description: `New game created with ${selectedPlayers.length} players`
    });
    
    return newGame.id;
  }, [state.players]);

  /**
   * Adds a new player with the given name
   */
  const addPlayer = useCallback((name: string): string => {
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
      color: stringToColor(name.trim())
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
  const addRound = useCallback((gameId: string, playerScores: PlayerScore[]) => {
    const game = state.games.find(g => g.id === gameId);
    
    if (!game) {
      toast({
        title: "Error",
        description: "Game not found",
        variant: "destructive",
      });
      return;
    }
    
    const newRound = {
      id: uuidv4(),
      playerScores
    };
    
    dispatch({ 
      type: 'ADD_ROUND', 
      payload: { gameId, round: newRound } 
    });
    
    toast({
      title: "Round added",
      description: `Round ${game.rounds.length + 1} has been added`
    });
  }, [state.games]);

  /**
   * Gets a game by its ID
   */
  const getGame = useCallback((gameId: string): Game | undefined => {
    return state.games.find(g => g.id === gameId);
  }, [state.games]);

  /**
   * Deletes a game
   */
  const deleteGame = useCallback((gameId: string) => {
    dispatch({ type: 'DELETE_GAME', payload: gameId });
    
    toast({
      title: "Game deleted",
      description: "The game has been removed"
    });
  }, []);

  /**
   * Updates a player score in a round
   */
  const updatePlayerScore = useCallback((gameId: string, roundId: string, updatedPlayerScore: PlayerScore) => {
    dispatch({ 
      type: 'UPDATE_PLAYER_SCORE', 
      payload: { 
        gameId, 
        roundId, 
        playerScore: updatedPlayerScore 
      } 
    });
  }, []);

  /**
   * Updates all player scores in a round
   */
  const updateAllPlayerScores = useCallback((gameId: string, roundId: string, updatedPlayerScores: PlayerScore[]) => {
    dispatch({ 
      type: 'UPDATE_ALL_PLAYER_SCORES', 
      payload: { 
        gameId, 
        roundId, 
        playerScores: updatedPlayerScores 
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
  const deleteRound = useCallback((gameId: string, roundId: string) => {
    dispatch({ 
      type: 'DELETE_ROUND', 
      payload: { gameId, roundId } 
    });
    
    toast({
      title: "Round deleted",
      description: "The round has been removed from the game"
    });
  }, []);

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
   * Exports game data as JSON
   */
  const exportGameData = useCallback(() => {
    try {
      const dataStr = createJsonExport(state.games, state.players);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileDefaultName = `phase10_data_${new Date().toISOString().slice(0, 10)}.json`;
      
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
      
      const exportFileDefaultName = `phase10_data_${new Date().toISOString().slice(0, 10)}.csv`;
      
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
    createGame,
    addPlayer,
    addRound,
    getGame,
    deleteGame,
    updatePlayerScore,
    updateAllPlayerScores,
    deleteRound,
    updatePlayerAvatar,
    updatePlayerManualScore,
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
