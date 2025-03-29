
import { useState } from "react";
import { Link } from "react-router-dom";
import { useGameContext } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import Layout from "@/components/Layout";
import { sortGamesByDate, formatDate, calculateTotalScore } from "@/utils/gameUtils";
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
  const { games, players, deleteGame } = useGameContext();
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);
  
  const sortedGames = sortGamesByDate(games);

  const handleDeleteGame = () => {
    if (gameToDelete) {
      deleteGame(gameToDelete);
      setGameToDelete(null);
    }
  };

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
          <h2 className="text-xl font-medium text-gray-600 mb-4">No games yet</h2>
          <p className="text-gray-500 mb-6">
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
          <h2 className="text-xl font-semibold text-gray-700">Your Games</h2>
          {sortedGames.map((game) => (
            <Card key={game.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <Link to={`/games/${game.id}`}>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-phase10-darkBlue">
                        {formatDate(game.date)}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {game.rounds.length} {game.rounds.length === 1 ? "round" : "rounds"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {game.players.map((player) => (
                        <div 
                          key={player.id}
                          className="bg-gray-100 rounded-full px-3 py-1 text-sm"
                        >
                          {player.name}: {calculateTotalScore(game, player.id)}
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
                <div className="bg-gray-50 p-2 border-t flex justify-end">
                  <AlertDialog open={gameToDelete === game.id} onOpenChange={(open) => !open && setGameToDelete(null)}>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-500 hover:text-red-600"
                        onClick={(e) => {
                          e.preventDefault();
                          setGameToDelete(game.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Game</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this game? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
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
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Players</h2>
          <div className="flex flex-wrap gap-2">
            {players.map(player => (
              <div 
                key={player.id} 
                className="bg-phase10-lightBlue bg-opacity-50 px-3 py-1 rounded-full text-phase10-darkBlue"
              >
                {player.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Index;
