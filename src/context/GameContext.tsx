
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Game, Player, Round, PlayerScore, ExportData, CsvGameData } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/hooks/use-toast";
import { stringToColor } from "@/utils/gameUtils";
import { parse, unparse } from "papaparse";
import { generateUniqueCode } from "@/utils/codeGenerator";
import { supabase } from "@/integrations/supabase/client";

interface GameContextType {
  games: Game[];
  players: Player[];
  createGame: (date: Date, playerIds: string[]) => string;
  addPlayer: (name: string) => string;
  addRound: (gameId: string, playerScores: PlayerScore[]) => void;
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
  exportGameData: () => void;
  exportCsvData: () => void;
  importGameData: (jsonData: string) => boolean;
  importCsvData: (csvData: string) => boolean;
  loading: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps) => {
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Try to load from Supabase first
        const { data: session } = await supabase.auth.getSession();
        
        if (session?.session?.user) {
          // User is authenticated, load from Supabase
          await loadFromSupabase();
        } else {
          // No user, load from localStorage
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        // Fallback to localStorage
        loadFromLocalStorage();
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await loadFromSupabase();
      } else if (event === 'SIGNED_OUT') {
        loadFromLocalStorage();
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sync to localStorage regardless of auth state
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("phase10-games", JSON.stringify(games));
    }
  }, [games, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem("phase10-players", JSON.stringify(players));
    }
  }, [players, loading]);

  const loadFromLocalStorage = () => {
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
          
          setGames(gamesWithDates);
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
          
          setPlayers(playersWithColors);
        } catch (error) {
          console.error("Failed to parse saved players", error);
        }
      }
    } catch (error) {
      console.error("Error loading data from storage:", error);
    }
  };

  const loadFromSupabase = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      console.log("Loading data from Supabase for user:", session.user.id);
      
      // Load players
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', session.user.id);
      
      if (playersError) throw playersError;
      
      if (playersData && playersData.length > 0) {
        // Convert Supabase player format to our app's Player type
        const formattedPlayers: Player[] = playersData.map((player: any) => ({
          id: player.id,
          name: player.name,
          color: player.color || stringToColor(player.name),
          avatar: player.avatar ? JSON.parse(player.avatar) : undefined,
          manualTotal: player.manual_total
        }));
        
        setPlayers(formattedPlayers);
      }
      
      // Load games
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select('*')
        .eq('user_id', session.user.id);
      
      if (gamesError) throw gamesError;
      
      if (gamesData && gamesData.length > 0) {
        // Process each game to load its players and rounds
        const processedGames: Game[] = [];
        
        for (const gameRecord of gamesData) {
          // Load players for this game
          const { data: gamePlayers, error: gamePlayersError } = await supabase
            .from('game_players')
            .select('player_id')
            .eq('game_id', gameRecord.id);
          
          if (gamePlayersError) throw gamePlayersError;
          
          // Find player objects
          const gamePlayerObjects = gamePlayers
            ? gamePlayers
                .map(gp => formattedPlayers.find(p => p.id === gp.player_id))
                .filter(Boolean) as Player[]
            : [];
          
          // Load rounds for this game
          const { data: roundsData, error: roundsError } = await supabase
            .from('rounds')
            .select('*')
            .eq('game_id', gameRecord.id)
            .order('round_number', { ascending: true });
          
          if (roundsError) throw roundsError;
          
          const processedRounds: Round[] = [];
          
          // Process each round to load player scores
          for (const round of roundsData) {
            const { data: scoresData, error: scoresError } = await supabase
              .from('player_scores')
              .select('*')
              .eq('round_id', round.id);
            
            if (scoresError) throw scoresError;
            
            // Convert Supabase score format to our app's PlayerScore type
            const playerScores: PlayerScore[] = scoresData.map((score: any) => ({
              id: score.id,
              playerId: score.player_id,
              score: score.score,
              phase: score.phase,
              completed: score.completed
            }));
            
            processedRounds.push({
              id: round.id,
              playerScores
            });
          }
          
          // Create the game object
          const game: Game = {
            id: gameRecord.id,
            uniqueCode: gameRecord.unique_code || generateUniqueCode(),
            date: new Date(gameRecord.date),
            players: gamePlayerObjects,
            rounds: processedRounds
          };
          
          processedGames.push(game);
        }
        
        console.log(`Loaded ${processedGames.length} games from Supabase`);
        setGames(processedGames);
      }
    } catch (error) {
      console.error("Failed to load from Supabase:", error);
      toast({
        title: "Error",
        description: "Failed to load your games from the server",
        variant: "destructive",
      });
      // Fall back to local storage
      loadFromLocalStorage();
    }
  };

  const syncToSupabase = async (updatedGames: Game[] = games, updatedPlayers: Player[] = players) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      console.log("Syncing data to Supabase for user:", session.user.id);
      
      // Sync players
      for (const player of updatedPlayers) {
        const { error } = await supabase
          .from('players')
          .upsert({
            id: player.id,
            name: player.name,
            color: player.color,
            avatar: player.avatar ? JSON.stringify(player.avatar) : null,
            manual_total: player.manualTotal,
            user_id: session.user.id
          }, { onConflict: 'id' });
        
        if (error) throw error;
      }
      
      // Sync games
      for (const game of updatedGames) {
        // Ensure game has a unique code
        const uniqueCode = game.uniqueCode || generateUniqueCode();
        
        // Upsert the game
        const { error: gameError } = await supabase
          .from('games')
          .upsert({
            id: game.id,
            date: game.date.toISOString(),
            user_id: session.user.id,
            unique_code: uniqueCode
          }, { onConflict: 'id' });
        
        if (gameError) throw gameError;
        
        // Link players to game
        for (const player of game.players) {
          const { error: playerLinkError } = await supabase
            .from('game_players')
            .upsert({
              game_id: game.id,
              player_id: player.id
            }, { onConflict: 'game_id,player_id' });
          
          if (playerLinkError) throw playerLinkError;
        }
        
        // Sync rounds
        for (let roundIndex = 0; roundIndex < game.rounds.length; roundIndex++) {
          const round = game.rounds[roundIndex];
          
          // Upsert the round
          const { error: roundError } = await supabase
            .from('rounds')
            .upsert({
              id: round.id,
              game_id: game.id,
              round_number: roundIndex + 1
            }, { onConflict: 'id' });
          
          if (roundError) throw roundError;
          
          // Sync player scores
          for (const score of round.playerScores) {
            const scoreId = score.id || uuidv4();
            
            const { error: scoreError } = await supabase
              .from('player_scores')
              .upsert({
                id: scoreId,
                round_id: round.id,
                player_id: score.playerId,
                score: score.score,
                phase: score.phase,
                completed: score.completed
              }, { onConflict: 'id' });
            
            if (scoreError) throw scoreError;
          }
        }
      }
      
      console.log(`Synced ${updatedGames.length} games to Supabase`);
    } catch (error) {
      console.error("Failed to sync to Supabase:", error);
      toast({
        title: "Sync Error",
        description: "Failed to save your data to the server",
        variant: "destructive",
      });
    }
  };

  const createGame = (date: Date, playerIds: string[]): string => {
    const selectedPlayers = players.filter(player => playerIds.includes(player.id));
    
    const newGame: Game = {
      id: uuidv4(),
      uniqueCode: generateUniqueCode(),
      date,
      players: selectedPlayers,
      rounds: []
    };
    
    const updatedGames = [...games, newGame];
    setGames(updatedGames);
    
    // Sync to Supabase if user is authenticated
    syncToSupabase(updatedGames);
    
    toast({
      title: "Game created",
      description: `New game created with ${selectedPlayers.length} players`
    });
    
    return newGame.id;
  };

  const addPlayer = (name: string): string => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Player name cannot be empty",
        variant: "destructive",
      });
      return "";
    }
    
    if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
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
    
    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);
    
    // Sync to Supabase if user is authenticated
    syncToSupabase(games, updatedPlayers);
    
    toast({
      title: "Player added",
      description: `${name} has been added to the player list`
    });
    
    return newPlayer.id;
  };

  const addRound = (gameId: string, playerScores: PlayerScore[]) => {
    const game = games.find(g => g.id === gameId);
    
    if (!game) {
      toast({
        title: "Error",
        description: "Game not found",
        variant: "destructive",
      });
      return;
    }
    
    // Ensure each playerScore has an ID
    const playerScoresWithIds = playerScores.map(ps => ({
      ...ps,
      id: ps.id || uuidv4()
    }));
    
    const newRound = {
      id: uuidv4(),
      playerScores: playerScoresWithIds
    };
    
    const updatedGame = {
      ...game,
      rounds: [...game.rounds, newRound]
    };
    
    const updatedGames = games.map(g => g.id === gameId ? updatedGame : g);
    setGames(updatedGames);
    
    // Sync to Supabase if user is authenticated
    syncToSupabase(updatedGames);
    
    toast({
      title: "Round added",
      description: `Round ${game.rounds.length + 1} has been added`
    });
  };

  const getGame = (gameId: string): Game | undefined => {
    return games.find(g => g.id === gameId);
  };

  const getGameByCode = (code: string): Game | undefined => {
    return games.find(g => g.uniqueCode === code);
  };

  const deleteGame = (gameId: string) => {
    const updatedGames = games.filter(g => g.id !== gameId);
    setGames(updatedGames);
    
    // Sync to Supabase if user is authenticated
    syncToSupabase(updatedGames);
    
    toast({
      title: "Game deleted",
      description: "The game has been removed"
    });
  };

  const deleteMultipleGames = (gameIds: string[]) => {
    if (gameIds.length === 0) return;
    
    const updatedGames = games.filter(g => !gameIds.includes(g.id));
    setGames(updatedGames);
    
    // Sync to Supabase if user is authenticated
    syncToSupabase(updatedGames);
    
    toast({
      title: "Games deleted",
      description: `${gameIds.length} games have been removed`
    });
  };

  const updatePlayerScore = (gameId: string, roundId: string, updatedPlayerScore: PlayerScore) => {
    // Ensure score has an ID
    const scoreWithId = {
      ...updatedPlayerScore,
      id: updatedPlayerScore.id || uuidv4()
    };
    
    const updatedGames = games.map(game => 
      game.id === gameId 
        ? {
            ...game,
            rounds: game.rounds.map(round => 
              round.id === roundId 
                ? {
                    ...round,
                    playerScores: round.playerScores.map(ps => 
                      ps.playerId === updatedPlayerScore.playerId 
                        ? scoreWithId
                        : ps
                    )
                  }
                : round
            )
          }
        : game
    );
    
    setGames(updatedGames);
    
    // Sync to Supabase if user is authenticated
    syncToSupabase(updatedGames);
  };

  const updateAllPlayerScores = (gameId: string, roundId: string, updatedPlayerScores: PlayerScore[]) => {
    // Ensure all scores have IDs
    const scoresWithIds = updatedPlayerScores.map(score => ({
      ...score,
      id: score.id || uuidv4()
    }));
    
    const updatedGames = games.map(game => 
      game.id === gameId 
        ? {
            ...game,
            rounds: game.rounds.map(round => 
              round.id === roundId 
                ? { ...round, playerScores: scoresWithIds }
                : round
            )
          }
        : game
    );
    
    setGames(updatedGames);
    
    // Sync to Supabase if user is authenticated
    syncToSupabase(updatedGames);
    
    toast({
      title: "Round updated",
      description: "The round scores have been updated"
    });
  };

  const deleteRound = (gameId: string, roundId: string) => {
    const updatedGames = games.map(game => 
      game.id === gameId 
        ? {
            ...game,
            rounds: game.rounds.filter(round => round.id !== roundId)
          }
        : game
    );
    
    setGames(updatedGames);
    
    // Sync to Supabase if user is authenticated
    syncToSupabase(updatedGames);
    
    toast({
      title: "Round deleted",
      description: "The round has been removed from the game"
    });
  };

  const deleteMultipleRounds = (gameId: string, roundIds: string[]) => {
    if (roundIds.length === 0) return;
    
    const updatedGames = games.map(game => 
      game.id === gameId 
        ? {
            ...game,
            rounds: game.rounds.filter(round => !roundIds.includes(round.id))
          }
        : game
    );
    
    setGames(updatedGames);
    
    // Sync to Supabase if user is authenticated
    syncToSupabase(updatedGames);
    
    toast({
      title: "Rounds deleted",
      description: `${roundIds.length} rounds have been removed from the game`
    });
  };

  const updatePlayerAvatar = (playerId: string, avatar: Player["avatar"]) => {
    const updatedPlayers = players.map(player => 
      player.id === playerId 
        ? { ...player, avatar }
        : player
    );
    
    setPlayers(updatedPlayers);
    
    // Sync to Supabase if user is authenticated
    syncToSupabase(games, updatedPlayers);
    
    toast({
      title: "Avatar updated",
      description: "The player's avatar has been updated"
    });
  };

  const updatePlayerManualScore = (playerId: string, manualTotal?: number) => {
    const updatedPlayers = players.map(player => 
      player.id === playerId 
        ? { ...player, manualTotal }
        : player
    );
    
    setPlayers(updatedPlayers);
    
    // Sync to Supabase if user is authenticated
    syncToSupabase(games, updatedPlayers);
    
    toast({
      title: "Score updated",
      description: "The player's manual score has been updated"
    });
  };

  const exportGameData = () => {
    try {
      const exportData: ExportData = {
        games: games.map(game => ({
          ...game,
          date: game.date instanceof Date ? game.date : new Date(game.date)
        })),
        players,
        exportDate: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
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
  };

  const exportCsvData = () => {
    try {
      const csvRows: any[] = [];
      
      games.forEach(game => {
        game.rounds.forEach(round => {
          const row: any = {
            date: new Date(game.date).toISOString().split('T')[0]
          };
          
          round.playerScores.forEach(score => {
            const player = players.find(p => p.id === score.playerId);
            if (player) {
              const playerName = player.name;
              row[`${playerName}_score`] = score.score;
              row[`${playerName}_phase`] = score.phase;
              row[`${playerName}_completed`] = score.completed ? "Yes" : "No";
            }
          });
          
          csvRows.push(row);
        });
      });
      
      const csv = unparse(csvRows);
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
  };

  const importGameData = (jsonData: string): boolean => {
    try {
      const parsedData: ExportData = JSON.parse(jsonData);
      
      if (!parsedData.games || !Array.isArray(parsedData.games) || 
          !parsedData.players || !Array.isArray(parsedData.players)) {
        throw new Error("Invalid data format");
      }
      
      const gamesWithDates = parsedData.games.map(game => {
        try {
          const gameDate = new Date(game.date);
          if (isNaN(gameDate.getTime())) {
            console.warn(`Invalid date found for game, using current date as fallback`);
            return {
              ...game,
              date: new Date()
            };
          }
          return {
            ...game,
            date: gameDate
          };
        } catch (e) {
          console.warn(`Error processing game date, using current date as fallback`, e);
          return {
            ...game,
            date: new Date()
          };
        }
      });
      
      const playersWithColors = parsedData.players.map(player => {
        if (!player.color) {
          return {
            ...player,
            color: stringToColor(player.name)
          };
        }
        return player;
      });
      
      const playerIds = new Set(playersWithColors.map(p => p.id));
      
      const validGames = gamesWithDates.filter(game => {
        const validPlayers = game.players.every(player => playerIds.has(player.id));
        
        if (!validPlayers) {
          console.warn(`Game with invalid player references filtered out`, game);
          return false;
        }
        
        const validRounds = game.rounds.every(round => 
          round.playerScores.every(ps => playerIds.has(ps.playerId))
        );
        
        if (!validRounds) {
          console.warn(`Game with invalid player references in rounds filtered out`, game);
          return false;
        }
        
        return true;
      });
      
      setGames(validGames);
      setPlayers(playersWithColors);
      
      // Sync to Supabase if user is authenticated
      syncToSupabase(validGames, playersWithColors);
      
      toast({
        title: "Import successful",
        description: `Imported ${validGames.length} games and ${playersWithColors.length} players`
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
  };

  const importCsvData = (csvData: string): boolean => {
    try {
      const parsedCsv = parse(csvData, { 
        header: true,
        skipEmptyLines: true
      });
      
      if (!parsedCsv.data || !Array.isArray(parsedCsv.data) || parsedCsv.data.length === 0) {
        throw new Error("Invalid CSV data format");
      }

      const headers = Object.keys(parsedCsv.data[0]);
      const playerSet = new Set<string>();
      
      headers.forEach(header => {
        if (header.endsWith('_score')) {
          const playerName = header.replace('_score', '');
          playerSet.add(playerName);
        }
      });
      
      const playerNames = Array.from(playerSet);

      const playerMap = new Map<string, string>();

      playerNames.forEach(name => {
        let player = players.find(p => p.name === name);
        
        if (!player) {
          const id = uuidv4();
          const newPlayer: Player = {
            id,
            name,
            color: stringToColor(name)
          };
          
          setPlayers(prev => [...prev, newPlayer]);
          playerMap.set(name, id);
        } else {
          playerMap.set(name, player.id);
        }
      });

      const gamesByDate = new Map<string, any[]>();
      
      parsedCsv.data.forEach((row: any) => {
        const date = row.date;
        if (!gamesByDate.has(date)) {
          gamesByDate.set(date, []);
        }
        gamesByDate.get(date)?.push(row);
      });

      let newGames: Game[] = [];
      gamesByDate.forEach((rows, dateStr) => {
        const gamePlayers = playerNames
          .filter(name => rows.some((row: any) => row[`${name}_score`] !== undefined))
          .map(name => {
            const playerId = playerMap.get(name) || "";
            const existingPlayer = players.find(p => p.id === playerId);
            if (existingPlayer) return existingPlayer;
            
            return {
              id: playerId,
              name: name,
              color: stringToColor(name)
            };
          });

        const rounds: Round[] = rows.map((_: any, index: number) => {
          const playerScores: PlayerScore[] = gamePlayers.map(player => {
            const row = rows[index];
            return {
              playerId: player.id,
              score: parseInt(row[`${player.name}_score`]) || 0,
              phase: parseInt(row[`${player.name}_phase`]) || 1,
              completed: row[`${player.name}_completed`] === "Yes"
            };
          });
          
          return {
            id: uuidv4(),
            playerScores
          };
        });

        const game: Game = {
          id: uuidv4(),
          uniqueCode: generateUniqueCode(),
          date: new Date(dateStr),
          players: gamePlayers,
          rounds
        };
        
        newGames.push(game);
      });

      const updatedGames = [...games, ...newGames];
      setGames(updatedGames);
      
      // Sync to Supabase if user is authenticated
      syncToSupabase(updatedGames);
      
      toast({
        title: "CSV import successful",
        description: `Imported ${newGames.length} games from CSV data`
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
  };

  const value = {
    games,
    players,
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
    exportGameData,
    exportCsvData,
    importGameData,
    importCsvData
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};
