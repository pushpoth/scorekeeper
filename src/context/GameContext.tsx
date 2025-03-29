
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Game, Player, Round, PlayerScore } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/hooks/use-toast";

interface GameContextType {
  games: Game[];
  players: Player[];
  createGame: (date: Date, playerIds: string[]) => string;
  addPlayer: (name: string) => string;
  addRound: (gameId: string, playerScores: PlayerScore[]) => void;
  getGame: (gameId: string) => Game | undefined;
  deleteGame: (gameId: string) => void;
  updatePlayerScore: (gameId: string, roundId: string, playerScore: PlayerScore) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps) => {
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedGames = localStorage.getItem("phase10-games");
    const savedPlayers = localStorage.getItem("phase10-players");
    
    if (savedGames) {
      try {
        const parsedGames = JSON.parse(savedGames);
        // Convert date strings back to Date objects
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
        setPlayers(JSON.parse(savedPlayers));
      } catch (error) {
        console.error("Failed to parse saved players", error);
      }
    }
  }, []);

  // Save to localStorage whenever games or players change
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
    
    // Check if player with the same name already exists
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
      name: name.trim()
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

  const value = {
    games,
    players,
    createGame,
    addPlayer,
    addRound,
    getGame,
    deleteGame,
    updatePlayerScore
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
