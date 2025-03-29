
import { useState } from "react";
import { Link } from "react-router-dom";
import { useGameContext } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Edit, User } from "lucide-react";
import Layout from "@/components/Layout";
import { sortGamesByDate, formatDate, calculateTotalScore } from "@/utils/gameUtils";
import PlayerAvatar from "@/components/PlayerAvatar";
import AvatarEditor from "@/components/AvatarEditor";
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

const Index = () => {
  const { games, players, deleteGame, updatePlayerAvatar } = useGameContext();
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);
  const [playerToEdit, setPlayerToEdit] = useState<string | null>(null);
  
  const sortedGames = sortGamesByDate(games);

  const handleDeleteGame = () => {
    if (gameToDelete) {
      deleteGame(gameToDelete);
      setGameToDelete(null);
    }
  };

  // Calculate grand totals for all players
  const grandTotals = players.map(player => {
    const total = games.reduce((acc, game) => {
      // Only count this player if they are in the game
      if (game.players.some(p => p.id === player.id)) {
        return acc + calculateTotalScore(game, player.id);
      }
      return acc;
    }, 0);
    
    return { 
      playerId: player.id, 
      name: player.name, 
      total,
      avatar: player.avatar
    };
  }).sort((a, b) => a.total - b.total); // Sort by score (ascending)
  
  const lowestScorer = grandTotals.length > 0 ? grandTotals[0] : null;
  const highestScorer = grandTotals.length > 0 ? grandTotals[grandTotals.length - 1] : null;

  const selectedPlayer = playerToEdit ? players.find(p => p.id === playerToEdit) : null;

  return (
    <Layout title="Phase 10 Score Tracker">
      <div className="flex justify-end mb-6">
        <Link to="/games/new">
          <Button className="bg-phase10-blue hover:bg-phase10-darkBlue text-white">
            New Game
          </Button>
        </Link>
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
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Your Games</h2>
          {sortedGames.map((game) => (
            <Card key={game.id} className="overflow-hidden hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-0">
                <Link to={`/games/${game.id}`}>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-phase10-darkBlue dark:text-phase10-lightBlue">
                        {formatDate(game.date)}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {game.rounds.length} {game.rounds.length === 1 ? "round" : "rounds"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {game.players.map((player) => {
                        const score = calculateTotalScore(game, player.id);
                        return (
                          <div 
                            key={player.id}
                            className="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 flex items-center gap-1.5"
                          >
                            <PlayerAvatar player={player} size="sm" />
                            <span>{player.name}: {score}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Link>
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
      
      {players.length > 0 && (
        <>
          {/* Grand Totals */}
          {games.length > 0 && (
            <div className="mt-8 mb-6">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">Grand Totals</h2>
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {grandTotals.map(player => (
                      <div 
                        key={player.playerId}
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          player === lowestScorer 
                            ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" 
                            : player === highestScorer 
                              ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800" 
                              : "bg-gray-50 dark:bg-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <PlayerAvatar 
                            player={{ id: player.playerId, name: player.name, avatar: player.avatar }}
                            size="sm"
                          />
                          <span className="font-medium">{player.name}</span>
                          {player === lowestScorer && (
                            <span className="text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 px-2 py-0.5 rounded-full">
                              Best
                            </span>
                          )}
                          {player === highestScorer && (
                            <span className="text-xs bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-100 px-2 py-0.5 rounded-full">
                              Trailing
                            </span>
                          )}
                        </div>
                        <span 
                          className={`text-lg font-bold ${
                            player === lowestScorer 
                              ? "text-green-600 dark:text-green-400" 
                              : player === highestScorer 
                                ? "text-amber-600 dark:text-amber-400" 
                                : ""
                          }`}
                        >
                          {player.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Players List */}
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
        </>
      )}
    </Layout>
  );
};

export default Index;
