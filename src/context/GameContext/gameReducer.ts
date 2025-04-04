
/**
 * Game Reducer
 * 
 * This file contains the reducer function for managing game state
 * with actions for adding, updating, and removing games, rounds, and players.
 */

import { Game, Player, PlayerScore, Round } from "@/types";

export type GameAction =
  | { type: 'SET_GAMES'; payload: Game[] }
  | { type: 'SET_PLAYERS'; payload: Player[] }
  | { type: 'CREATE_GAME'; payload: Game }
  | { type: 'ADD_PLAYER'; payload: Player }
  | { type: 'ADD_ROUND'; payload: { gameId: string; round: Round } }
  | { type: 'DELETE_GAME'; payload: string }
  | { type: 'DELETE_MULTIPLE_GAMES'; payload: string[] }
  | { type: 'UPDATE_PLAYER_SCORE'; payload: { gameId: string; roundId: string; playerScore: PlayerScore } }
  | { type: 'UPDATE_ALL_PLAYER_SCORES'; payload: { gameId: string; roundId: string; playerScores: PlayerScore[] } }
  | { type: 'DELETE_ROUND'; payload: { gameId: string; roundId: string } }
  | { type: 'DELETE_MULTIPLE_ROUNDS'; payload: { gameId: string; roundIds: string[] } }
  | { type: 'UPDATE_PLAYER_AVATAR'; payload: { playerId: string; avatar: Player['avatar'] } }
  | { type: 'UPDATE_PLAYER_MANUAL_SCORE'; payload: { playerId: string; manualTotal?: number } }
  | { type: 'UPDATE_PLAYER_MONEY'; payload: { playerId: string; money?: number } }
  | { type: 'ADD_MULTIPLE_PLAYERS'; payload: Player[] }
  | { type: 'ADD_MULTIPLE_GAMES'; payload: Game[] }
  | { type: 'UPDATE_GAME_UNIQUE_CODE'; payload: { gameId: string; uniqueCode: string } };

export interface GameState {
  games: Game[];
  players: Player[];
}

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SET_GAMES':
      return {
        ...state,
        games: action.payload
      };
      
    case 'SET_PLAYERS':
      return {
        ...state,
        players: action.payload
      };
      
    case 'CREATE_GAME':
      return {
        ...state,
        games: [...state.games, action.payload]
      };
      
    case 'ADD_PLAYER':
      return {
        ...state,
        players: [...state.players, action.payload]
      };
      
    case 'ADD_MULTIPLE_PLAYERS':
      return {
        ...state,
        players: [...state.players, ...action.payload]
      };
      
    case 'ADD_MULTIPLE_GAMES':
      return {
        ...state,
        games: [...state.games, ...action.payload]
      };
      
    case 'ADD_ROUND':
      return {
        ...state,
        games: state.games.map(game => 
          game.id === action.payload.gameId 
            ? { 
                ...game, 
                rounds: [...game.rounds, action.payload.round] 
              }
            : game
        )
      };
      
    case 'DELETE_GAME':
      return {
        ...state,
        games: state.games.filter(game => game.id !== action.payload)
      };
      
    case 'DELETE_MULTIPLE_GAMES':
      return {
        ...state,
        games: state.games.filter(game => !action.payload.includes(game.id))
      };
      
    case 'UPDATE_PLAYER_SCORE':
      return {
        ...state,
        games: state.games.map(game => 
          game.id === action.payload.gameId 
            ? {
                ...game,
                rounds: game.rounds.map(round => 
                  round.id === action.payload.roundId 
                    ? {
                        ...round,
                        playerScores: round.playerScores.map(ps => 
                          ps.playerId === action.payload.playerScore.playerId 
                            ? action.payload.playerScore
                            : ps
                        )
                      }
                    : round
                )
              }
            : game
        )
      };
      
    case 'UPDATE_ALL_PLAYER_SCORES':
      return {
        ...state,
        games: state.games.map(game => 
          game.id === action.payload.gameId 
            ? {
                ...game,
                rounds: game.rounds.map(round => 
                  round.id === action.payload.roundId 
                    ? { ...round, playerScores: action.payload.playerScores }
                    : round
                )
              }
            : game
        )
      };
      
    case 'DELETE_ROUND':
      return {
        ...state,
        games: state.games.map(game => 
          game.id === action.payload.gameId 
            ? {
                ...game,
                rounds: game.rounds.filter(round => round.id !== action.payload.roundId)
              }
            : game
        )
      };
      
    case 'DELETE_MULTIPLE_ROUNDS':
      return {
        ...state,
        games: state.games.map(game => 
          game.id === action.payload.gameId 
            ? {
                ...game,
                rounds: game.rounds.filter(round => !action.payload.roundIds.includes(round.id))
              }
            : game
        )
      };
      
    case 'UPDATE_PLAYER_AVATAR':
      return {
        ...state,
        players: state.players.map(player => 
          player.id === action.payload.playerId 
            ? { ...player, avatar: action.payload.avatar }
            : player
        )
      };
      
    case 'UPDATE_PLAYER_MANUAL_SCORE':
      return {
        ...state,
        players: state.players.map(player => 
          player.id === action.payload.playerId 
            ? { ...player, manualTotal: action.payload.manualTotal }
            : player
        )
      };
      
    case 'UPDATE_PLAYER_MONEY':
      return {
        ...state,
        players: state.players.map(player => 
          player.id === action.payload.playerId 
            ? { ...player, money: action.payload.money }
            : player
        )
      };
      
    case 'UPDATE_GAME_UNIQUE_CODE':
      return {
        ...state,
        games: state.games.map(game =>
          game.id === action.payload.gameId
            ? { ...game, uniqueCode: action.payload.uniqueCode }
            : game
        )
      };
      
    default:
      return state;
  }
};
