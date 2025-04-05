import { useState } from "react";
import { useParams, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useGameContext } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  AlertDialog, 
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogHeader,
  AlertDialogFooter
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate, calculateTotalScore } from "@/utils/gameUtils";
import Layout from "@/components/Layout";
import PlayerAvatar from "@/components/PlayerAvatar";
import RoundEditor from "@/components/RoundEditor";
import { Trash2, Plus, Copy, Check } from "lucide-react";
import { useSelection } from "@/hooks/useSelection";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const GameDetail = () => {
  const { id, code } = useParams<{ id?: string; code?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    games, 
    getGame, 
    getGameByCode,
    addRound,
    deleteRound, 
    deleteMultipleRounds,
    loading
  } = useGameContext();
  
  const [isAddingRound, setIsAddingRound] = useState(false);
  const [roundToDelete, setRoundToDelete] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const roundSelection = useSelection();
  
  let game;
  if (code) {
    game = getGameByCode(code);
  } else if (id) {
    game = getGame(id);
  }
  
  const isCodeRoute = location.pathname.includes('/code/');

  if (!loading && !game) {
    return <Navigate to="/404" />;
  }

  if (loading || !game) {
    return (
      <Layout title="Loading Game..." showBackButton backLink="/games">
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-phase10-blue mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading game details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleDeleteRound = () => {
    if (roundToDelete) {
      deleteRound(game.id, roundToDelete);
      setRoundToDelete(null);
    }
  };

  const handleDeleteSelectedRounds = () => {
    if (roundSelection.selectedItems.length > 0) {
      deleteMultipleRounds(game.id, roundSelection.selectedItems);
      roundSelection.deselectAll();
    }
  };

  const handleCopyGameCode = () => {
    if (game.uniqueCode) {
      navigator.clipboard.writeText(game.uniqueCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      
      toast({
        title: "Code copied",
        description: "Game code copied to clipboard",
      });
    }
  };
  
  if (isCodeRoute && game.id && user) {
    return <Navigate to={`/games/${game.id}`} replace />;
  }

  return (
    <Layout title="Game Details" showBackButton backLink="/games">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <h2 onClick={() => navigate(`/games/${game.id}`)} className="text-xl font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-phase10-blue">
            {formatDate(game.date)}
          </h2>
          
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
            <span>Code: {game.uniqueCode}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={handleCopyGameCode}
            >
              {copiedCode ? (
                <Check size={14} className="text-green-500" />
              ) : (
                <Copy size={14} />
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">Players:</span>
          {game.players.map((player) => (
            <div 
              key={player.id}
              className="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 flex items-center gap-1.5"
            >
              <PlayerAvatar player={player} size="sm" />
              <span>{player.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Final Scores - Now ABOVE the rounds list */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Final Scores</h3>
        <Card className="overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="space-y-3">
              {game.players
                .map(player => ({
                  player,
                  score: calculateTotalScore(game, player.id)
                }))
                .sort((a, b) => a.score - b.score)
                .map((item, index) => (
                  <div 
                    key={item.player.id}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      index === 0 
                        ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" 
                        : "bg-gray-50 dark:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {index === 0 && <Badge className="bg-green-500">Winner</Badge>}
                      <PlayerAvatar player={item.player} size="sm" />
                      <span className="font-medium">{item.player.name}</span>
                    </div>
                    <span className={`text-lg font-bold ${
                      index === 0 ? "text-green-600 dark:text-green-400" : ""
                    }`}>
                      {item.score}
                    </span>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Rounds</h3>
          <div className="flex gap-2">
            {roundSelection.someSelected() && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    <span>Delete ({roundSelection.selectedItems.length})</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="dark:text-white">Delete Selected Rounds</AlertDialogTitle>
                    <AlertDialogDescription className="dark:text-gray-400">
                      Are you sure you want to delete {roundSelection.selectedItems.length} selected rounds? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="dark:bg-gray-700 dark:text-white">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteSelectedRounds} className="bg-red-600 text-white hover:bg-red-700">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            
            <Button 
              size="sm" 
              className="bg-phase10-blue hover:bg-phase10-darkBlue text-white"
              onClick={() => setIsAddingRound(true)}
            >
              <Plus size={14} className="mr-1" />
              Add Round
            </Button>
          </div>
        </div>
        
        {game.rounds.length > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <Checkbox 
              id="select-all-rounds" 
              checked={roundSelection.allSelected(game.rounds.length)}
              onCheckedChange={(checked) => {
                if (checked) {
                  roundSelection.selectAll(game.rounds.map(r => r.id));
                } else {
                  roundSelection.deselectAll();
                }
              }}
            />
            <label htmlFor="select-all-rounds" className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
              {roundSelection.allSelected(game.rounds.length) 
                ? "Deselect all" 
                : roundSelection.someSelected()
                  ? "Select all"
                  : "Select all rounds"}
            </label>
          </div>
        )}
        
        {game.rounds.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-6">
            No rounds yet. Add your first round to start tracking scores.
          </p>
        ) : (
          <div className="space-y-4">
            {game.rounds.map((round, index) => {
              const roundScores = round.playerScores.map(ps => {
                const player = game.players.find(p => p.id === ps.playerId);
                return {
                  player: player,
                  ...ps
                };
              });
              
              return (
                <Card key={round.id} className="overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          checked={roundSelection.isSelected(round.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              roundSelection.selectItem(round.id);
                            } else {
                              roundSelection.deselectItem(round.id);
                            }
                          }}
                          className="mr-1"
                        />
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                          Round {index + 1}
                        </h4>
                      </div>
                      
                      <AlertDialog open={roundToDelete === round.id} onOpenChange={(open) => !open && setRoundToDelete(null)}>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                            onClick={() => setRoundToDelete(round.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="dark:text-white">Delete Round</AlertDialogTitle>
                            <AlertDialogDescription className="dark:text-gray-400">
                              Are you sure you want to delete Round {index + 1}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="dark:bg-gray-700 dark:text-white">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteRound} className="bg-red-600 text-white hover:bg-red-700">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                      {roundScores.map((score) => (
                        <div 
                          key={score.playerId}
                          className="flex-1 min-w-[200px] p-3 rounded-lg"
                          style={{ 
                            backgroundColor: score.player?.color ? `${score.player.color}20` : 'rgba(229, 231, 235, 0.5)',
                            borderLeft: score.player?.color ? `4px solid ${score.player.color}` : '4px solid #e5e7eb'
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {score.player && <PlayerAvatar player={score.player} size="sm" />}
                              <span className="font-medium">{score.player?.name}</span>
                            </div>
                            <Badge 
                              variant={score.completed ? "default" : "outline"} 
                              className={score.completed 
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : "bg-amber-50 border-amber-200 text-amber-800 dark:bg-transparent dark:border-amber-700 dark:text-amber-400"
                              }
                            >
                              Phase {score.phase}
                              {score.completed ? " ✓" : ""}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Score:</span>
                            <span className="text-lg font-bold">{score.score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                        {game.players.map(player => {
                          const runningTotal = game.rounds
                            .slice(0, index + 1)
                            .reduce((sum, r) => {
                              const playerScore = r.playerScores.find(ps => ps.playerId === player.id);
                              return sum + (playerScore ? playerScore.score : 0);
                            }, 0);
                          
                          return (
                            <div key={player.id} className="flex items-center gap-1">
                              <PlayerAvatar player={player} size="sm" />
                              <span className="font-medium">{player.name}:</span>
                              <span>{runningTotal}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      <RoundEditor
        gameId={game.id}
        game={game}
        players={game.players}
        open={isAddingRound}
        onOpenChange={setIsAddingRound}
        onSave={(gameId, roundId, playerScores) => {
          addRound(gameId, playerScores);
          setIsAddingRound(false);
        }}
        onCancel={() => setIsAddingRound(false)}
      />
    </Layout>
  );
};

export default GameDetail;
