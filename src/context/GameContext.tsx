import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Game, Player, Round, PlayerScore, ExportData, CsvGameData } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/hooks/use-toast";
import { stringToColor } from "@/utils/gameUtils";
import { parse, unparse } from "papaparse";

interface GameContextType {
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

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps) => {
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    localStorage.setItem("phase10-games", JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    localStorage.setItem("phase10-players", JSON.stringify(players));
  }, [players]);

  const createGame = (date: Date, playerIds: string[]): string => {
    const selectedPlayers = players.filter(player => playerIds.includes(player.id));
    
    const newGame: Game = {
      id: uuidv4(),
      date,
      players: selectedPlayers,
      rounds: []
    };
    
    setGames(prevGames => [...prevGames, newGame]);
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
    
    setPlayers(prevPlayers => [...prevPlayers, newPlayer]);
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
    
    const newRound: Round = {
      id: uuidv4(),
      playerScores
    };
    
    setGames(prevGames => 
      prevGames.map(g => 
        g.id === gameId 
          ? { ...g, rounds: [...g.rounds, newRound] }
          : g
      )
    );
    
    toast({
      title: "Round added",
      description: `Round ${game.rounds.length + 1} has been added`
    });
  };

  const getGame = (gameId: string): Game | undefined => {
    return games.find(g => g.id === gameId);
  };

  const deleteGame = (gameId: string) => {
    setGames(prevGames => prevGames.filter(g => g.id !== gameId));
    toast({
      title: "Game deleted",
      description: "The game has been removed"
    });
  };

  const updatePlayerScore = (gameId: string, roundId: string, updatedPlayerScore: PlayerScore) => {
    setGames(prevGames => 
      prevGames.map(game => 
        game.id === gameId 
          ? {
              ...game,
              rounds: game.rounds.map(round => 
                round.id === roundId 
                  ? {
                      ...round,
                      playerScores: round.playerScores.map(ps => 
                        ps.playerId === updatedPlayerScore.playerId 
                          ? updatedPlayerScore
                          : ps
                      )
                    }
                  : round
              )
            }
          : game
      )
    );
  };

  const updateAllPlayerScores = (gameId: string, roundId: string, updatedPlayerScores: PlayerScore[]) => {
    setGames(prevGames => 
      prevGames.map(game => 
        game.id === gameId 
          ? {
              ...game,
              rounds: game.rounds.map(round => 
                round.id === roundId 
                  ? { ...round, playerScores: updatedPlayerScores }
                  : round
              )
            }
          : game
      )
    );
    
    toast({
      title: "Round updated",
      description: "The round scores have been updated"
    });
  };

  const deleteRound = (gameId: string, roundId: string) => {
    setGames(prevGames => 
      prevGames.map(game => 
        game.id === gameId 
          ? {
              ...game,
              rounds: game.rounds.filter(round => round.id !== roundId)
            }
          : game
      )
    );
    
    toast({
      title: "Round deleted",
      description: "The round has been removed from the game"
    });
  };

  const updatePlayerAvatar = (playerId: string, avatar: Player["avatar"]) => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => 
        player.id === playerId 
          ? { ...player, avatar }
          : player
      )
    );
    
    toast({
      title: "Avatar updated",
      description: "The player's avatar has been updated"
    });
  };

  const updatePlayerManualScore = (playerId: string, manualTotal?: number) => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => 
        player.id === playerId 
          ? { ...player, manualTotal }
          : player
      )
    );
    
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
          date: new Date(dateStr),
          players: gamePlayers,
          rounds
        };
        
        newGames.push(game);
      });

      setGames(prev => [...prev, ...newGames]);
      
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

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};
