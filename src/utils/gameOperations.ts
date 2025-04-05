/**
 * Game Operations Utility
 * 
 * This file contains utility functions for game operations such as:
 * - Importing and exporting game data in JSON and CSV formats
 * - Game and player data validation
 * - Data formatting and processing
 */

import { Game, Player, PlayerScore, ExportData, Round } from "@/types";
import { parse, unparse } from "papaparse";
import { v4 as uuidv4 } from "uuid";
import { stringToColor } from "@/utils/gameUtils";

/**
 * Validates a date string or object and returns a valid Date object
 * @param dateInput - Date string or Date object to validate
 * @returns Valid Date object or new Date if input is invalid
 */
export const validateDate = (dateInput: string | Date): Date => {
  try {
    if (dateInput instanceof Date) {
      if (isNaN(dateInput.getTime())) {
        console.warn("Invalid Date object provided, using current date as fallback");
        return new Date();
      }
      return dateInput;
    }
    
    const parsedDate = new Date(dateInput);
    if (isNaN(parsedDate.getTime())) {
      console.warn("Invalid date string provided, using current date as fallback");
      return new Date();
    }
    
    return parsedDate;
  } catch (e) {
    console.error("Error validating date, using current date as fallback:", e);
    return new Date();
  }
};

/**
 * Validates if a game object has valid player references
 * @param game - Game object to validate
 * @param playerIds - Set of valid player IDs
 * @returns True if the game has valid player references, false otherwise
 */
export const validateGamePlayers = (game: Game, playerIds: Set<string>): boolean => {
  // Validate player references in the game object
  const validPlayers = game.players.every(player => playerIds.has(player.id));
  
  if (!validPlayers) {
    console.warn(`Game with invalid player references filtered out`, game);
    return false;
  }
  
  // Validate player references in the rounds
  const validRounds = game.rounds.every(round => 
    round.playerScores.every(ps => playerIds.has(ps.playerId))
  );
  
  if (!validRounds) {
    console.warn(`Game with invalid player references in rounds filtered out`, game);
    return false;
  }
  
  return true;
};

/**
 * Processes imported JSON game data
 * @param jsonData - JSON string containing game data
 * @returns Object containing games and players arrays
 */
export const processJsonImport = (jsonData: string): { games: Game[], players: Player[] } | null => {
  try {
    const parsedData: ExportData = JSON.parse(jsonData);
    
    if (!parsedData.games || !Array.isArray(parsedData.games) || 
        !parsedData.players || !Array.isArray(parsedData.players)) {
      throw new Error("Invalid data format");
    }
    
    // Process and validate games
    const gamesWithDates = parsedData.games.map(game => ({
      ...game,
      date: validateDate(game.date)
    }));
    
    // Process and validate players
    const playersWithColors = parsedData.players.map(player => ({
      ...player,
      color: player.color || stringToColor(player.name)
    }));
    
    const playerIds = new Set(playersWithColors.map(p => p.id));
    
    // Filter out games with invalid player references
    const validGames = gamesWithDates.filter(game => 
      validateGamePlayers(game, playerIds)
    );
    
    return {
      games: validGames,
      players: playersWithColors
    };
  } catch (error) {
    console.error("Import failed:", error);
    return null;
  }
};

/**
 * Processes imported CSV game data
 * @param csvData - CSV string containing game data
 * @param existingPlayers - Array of existing players
 * @returns Object containing new games and players arrays
 */
export const processCsvImport = (csvData: string, existingPlayers: Player[]): { games: Game[], newPlayers: Player[] } | null => {
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
    const newPlayers: Player[] = [];

    // Map player names to IDs (either existing or new)
    playerNames.forEach(name => {
      let player = existingPlayers.find(p => p.name === name);
      
      if (!player) {
        const id = uuidv4();
        const newPlayer: Player = {
          id,
          name,
          color: stringToColor(name)
        };
        
        newPlayers.push(newPlayer);
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

    const newGames: Game[] = [];
    
    gamesByDate.forEach((rows, dateStr) => {
      const allPlayers = [...existingPlayers, ...newPlayers];
      
      const gamePlayers = playerNames
        .filter(name => rows.some((row: any) => row[`${name}_score`] !== undefined))
        .map(name => {
          const playerId = playerMap.get(name) || "";
          const existingPlayer = allPlayers.find(p => p.id === playerId);
          
          if (existingPlayer) {
            return existingPlayer;
          }
          
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
        date: validateDate(dateStr),
        players: gamePlayers,
        rounds,
        gameType: "Phase 10" // Default to Phase 10 for imported games
      };
      
      newGames.push(game);
    });

    return {
      games: newGames,
      newPlayers
    };
  } catch (error) {
    console.error("CSV Import failed:", error);
    return null;
  }
};

/**
 * Creates JSON export data from games and players
 * @param games - Array of games to export
 * @param players - Array of players to export
 * @returns JSON string containing export data
 */
export const createJsonExport = (games: Game[], players: Player[]): string => {
  try {
    const exportData: ExportData = {
      games: games.map(game => ({
        ...game,
        date: game.date instanceof Date ? game.date : validateDate(game.date)
      })),
      players,
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error("Export failed:", error);
    throw new Error("Failed to create JSON export");
  }
};

/**
 * Creates CSV export data from games
 * @param games - Array of games to export
 * @param players - Array of players to export
 * @returns CSV string containing export data
 */
export const createCsvExport = (games: Game[], players: Player[]): string => {
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
    
    return unparse(csvRows);
  } catch (error) {
    console.error("CSV Export failed:", error);
    throw new Error("Failed to create CSV export");
  }
};
