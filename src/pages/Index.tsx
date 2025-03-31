
import { useState } from "react";
import { useGameContext } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Edit, Pencil, Copy, Check } from "lucide-react";
import Layout from "@/components/Layout";
import { sortGamesByDate, formatDate, calculateTotalScore, getLastPlayedPhase, getPlayerRankings } from "@/utils/gameUtils";
import PlayerAvatar from "@/components/PlayerAvatar";
import AvatarEditor from "@/components/AvatarEditor";
import MedalIcon from "@/components/MedalIcon";
import GameActionsMenu from "@/components/GameActionsMenu";
import PlayerScoreEditor from "@/components/PlayerScoreEditor";
import { Link } from "react-router-dom";
import GameSearch from "@/components/GameSearch";
import { useSelection } from "@/hooks/useSelection";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const { games, players, deleteGame, deleteMultipleGames, updatePlayerAvatar, loading } = useGameContext();
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);
  const [playerToEdit, setPlayerToEdit] = useState<string | null>(null);
  const [playerToEditScore, setPlayerToEditScore] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const gameSelection = useSelection();
  const { user } = useAuth();
  
  const sortedGames = sortGamesByDate(games);
  
  // Calculate rankings for all players
  const playerRankings = getPlayerRankings(games, players);

  const handleDeleteGame = () => {
    if (gameToDelete) {
      deleteGame(gameToDelete);
      setGameToDelete(null);
    }
  };

  const handleDeleteSelectedGames = () => {
    if (gameSelection.selectedItems.length > 0) {
      deleteMultipleGames(gameSelection.selectedItems);
      gameSelection.deselectAll();
    }
  };

  const handleCopyGameCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const selectedPlayer = playerToEdit ? players.find(p => p.id === playerToEdit) : null;
  const selectedPlayerForScore = playerToEditScore ? players.find(p => p.id === playerToEditScore) : null;
  const selectedPlayerCalculatedScore = playerToEditScore 
    ? games.reduce((total, game) => {
        if (game.players.some(p => p.id === playerToEditScore)) {
          return total + calculateTotalScore(game, playerToEditScore);
        }
        return total;
      }, 0)
    : 0;

  return (
    <Layout 
      title="ScoreKeeper"
      rightContent={<GameActionsMenu />}
    >
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-phase10-blue mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your games...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Game Search */}
          <GameSearch />

          {/* Grand Totals - Now at the top */}
          {players.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3 flex justify-between items-center">
                <span>Grand Totals</span>
              </h2>
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {playerRankings.map((player, index) => (
                      <div 
                        key={player.playerId}
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          index === 0 
                            ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" 
                            : index === playerRankings.length - 1 
                              ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800" 
                              : "bg-gray-50 dark:bg-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MedalIcon rank={index + 1} />
                          <PlayerAvatar 
                            player={players.find(p => p.id === player.playerId) || { id: player.playerId, name: player.name }}
                            size="sm"
                          />
                          <span className="font-medium">{player.name}</span>
                          {index === 0 && (
                            <span className="text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 px-2 py-0.5 rounded-full">
                              Best
                            </span>
                          )}
                          {index === playerRankings.length - 1 && playerRankings.length > 1 && (
                            <span className="text-xs bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-100 px-2 py-0.5 rounded-full">
                              Trailing
                            </span>
                          )}
                          {players.find(p => p.id === player.playerId)?.manualTotal !== undefined && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 px-2 py-0.5 rounded-full">
                              Manual
                            </span>
                          )}
                        </div>
                        <div className="flex items-center">
                          <span 
                            className={`text-lg font-bold ${
                              index === 0
                                ? "text-green-600 dark:text-green-400" 
                                : index === playerRankings.length - 1 && playerRankings.length > 1
                                  ? "text-amber-600 dark:text-amber-400" 
                                  : ""
                            }`}
                          >
                            {player.total}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="ml-2 p-0 h-6 w-6"
                            onClick={() => setPlayerToEditScore(player.playerId)}
                          >
                            <Pencil size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Games List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Your Games</h2>
              
              {gameSelection.someSelected() && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      <span>Delete ({gameSelection.selectedItems.length})</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="dark:text-white">Delete Selected Games</AlertDialogTitle>
                      <AlertDialogDescription className="dark:text-gray-400">
                        Are you sure you want to delete {gameSelection.selectedItems.length} selected games? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="dark:bg-gray-700 dark:text-white">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteSelectedGames} className="bg-red-600 text-white hover:bg-red-700">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            
            {sortedGames.length === 0 ? (
              <div className="text-center py-10">
                <h2 className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-4">No games yet</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Start a new game to begin tracking scores
                </p>
                <Link to="/games/new">
                  <Button className="bg-phase10-blue hover:bg-phase10-darkBlue text-white">
                    Start Your First Game
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Select All Controls */}
                {sortedGames.length > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <Checkbox 
                      id="select-all" 
                      checked={gameSelection.allSelected(sortedGames.length)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          gameSelection.selectAll(sortedGames.map(g => g.id));
                        } else {
                          gameSelection.deselectAll();
                        }
                      }}
                    />
                    <label htmlFor="select-all" className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                      {gameSelection.allSelected(sortedGames.length) 
                        ? "Deselect all" 
                        : gameSelection.someSelected()
                          ? "Select all"
                          : "Select all games"}
                    </label>
                  </div>
                )}
            
                {sortedGames.map((game) => (
                  <Card key={game.id} className="overflow-hidden hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Checkbox 
                            checked={gameSelection.isSelected(game.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                gameSelection.selectItem(game.id);
                              } else {
                                gameSelection.deselectItem(game.id);
                              }
                            }}
                            className="mr-1"
                          />
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-phase10-darkBlue dark:text-phase10-lightBlue">
                                {formatDate(game.date)}
                              </h3>
                              <Badge variant="outline" className="ml-1">
                                {game.rounds.length} {game.rounds.length === 1 ? "round" : "rounds"}
                              </Badge>
                            </div>
                            
                            {game.uniqueCode && (
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <span className="mr-2">Code: {game.uniqueCode}</span>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0" 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleCopyGameCode(game.uniqueCode || "");
                                  }}
                                >
                                  {copiedCode === game.uniqueCode ? (
                                    <Check size={14} className="text-green-500" />
                                  ) : (
                                    <Copy size={14} />
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Link to={`/games/${game.id}`}>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {game.players.map((player) => {
                              const score = calculateTotalScore(game, player.id);
                              const lastPhase = getLastPlayedPhase(game, player.id);
                              
                              return (
                                <div 
                                  key={player.id}
                                  className="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 flex items-center gap-1.5"
                                >
                                  <PlayerAvatar player={player} size="sm" />
                                  <span>{player.name}: {score}</span>
                                  {lastPhase && (
                                    <Badge 
                                      variant={lastPhase.completed ? "default" : "outline"} 
                                      className={`ml-1 text-xs ${lastPhase.completed 
                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                        : "bg-amber-50 border-amber-200 text-amber-800 dark:bg-transparent dark:border-amber-700 dark:text-amber-400"
                                      }`}
                                    >
                                      Phase {lastPhase.phase}
                                      {lastPhase.completed ? " ✓" : ""}
                                    </Badge>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </Link>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-2 border-t dark:border-gray-600 flex justify-end">
                        <AlertDialog open={gameToDelete === game.id} onOpenChange={(open) => !open && setGameToDelete(null)}>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                              onClick={(e) => {
                                e.preventDefault();
                                setGameToDelete(game.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="dark:text-white">Delete Game</AlertDialogTitle>
                              <AlertDialogDescription className="dark:text-gray-400">
                                Are you sure you want to delete this game? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="dark:bg-gray-700 dark:text-white">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteGame} className="bg-red-600 text-white hover:bg-red-700">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          {/* Players List */}
          {players.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Players</h2>
              <div className="flex flex-wrap gap-2">
                {players.map(player => (
                  <Dialog key={player.id}>
                    <DialogTrigger asChild>
                      <div 
                        className="bg-phase10-lightBlue bg-opacity-50 dark:bg-phase10-blue/20 px-3 py-1 rounded-full text-phase10-darkBlue dark:text-phase10-lightBlue flex items-center gap-1.5 cursor-pointer hover:bg-opacity-70 dark:hover:bg-opacity-30 transition-colors"
                        onClick={() => setPlayerToEdit(player.id)}
                      >
                        <PlayerAvatar player={player} size="sm" />
                        {player.name}
                        <Edit className="h-3 w-3 ml-1 opacity-70" />
                      </div>
                    </DialogTrigger>
                    {playerToEdit === player.id && selectedPlayer && (
                      <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
                        <AvatarEditor 
                          player={selectedPlayer} 
                          onUpdateAvatar={updatePlayerAvatar}
                          onClose={() => setPlayerToEdit(null)}
                        />
                      </DialogContent>
                    )}
                  </Dialog>
                ))}
              </div>
            </div>
          )}
          
          {/* Player Score Editor Dialog */}
          {selectedPlayerForScore && (
            <PlayerScoreEditor
              player={selectedPlayerForScore}
              calculatedScore={selectedPlayerCalculatedScore}
              open={!!playerToEditScore}
              onOpenChange={(open) => !open && setPlayerToEditScore(null)}
            />
          )}
        </>
      )}
    </Layout>
  );
};

export default Index;
