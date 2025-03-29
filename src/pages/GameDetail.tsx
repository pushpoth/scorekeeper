
import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useGameContext } from "@/context/GameContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction, AlertDialogHeader, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { formatDate, calculateTotalScore, getPlayerName, getCurrentPhase } from "@/utils/gameUtils";
import { PlayerScore } from "@/types";
import { Check, Edit, Plus, Trash2 } from "lucide-react";
import PlayerAvatar from "@/components/PlayerAvatar";
import RoundEditor from "@/components/RoundEditor";

const GameDetail = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { games, players, addRound, getGame, deleteRound, updateAllPlayerScores } = useGameContext();
  const [newScores, setNewScores] = useState<{ [playerId: string]: number }>({});
  const [phases, setPhases] = useState<{ [playerId: string]: number }>({});
  const [completed, setCompleted] = useState<{ [playerId: string]: boolean }>({});
  const [showNewRound, setShowNewRound] = useState(false);
  const [editRoundId, setEditRoundId] = useState<string | null>(null);
  const [roundToDelete, setRoundToDelete] = useState<string | null>(null);

  const game = getGame(gameId || "");

  if (!game) {
    return <Navigate to="/" />;
  }

  const handleScoreChange = (playerId: string, value: string) => {
    const score = parseInt(value) || 0;
    setNewScores((prev) => ({ ...prev, [playerId]: score }));
  };

  const handlePhaseChange = (playerId: string, value: string) => {
    const phase = parseInt(value) || 1;
    setPhases((prev) => ({ ...prev, [playerId]: phase }));
  };

  const handleCompletedChange = (playerId: string, checked: boolean) => {
    setCompleted((prev) => ({ ...prev, [playerId]: checked }));
  };

  const handleAddRound = () => {
    const playerScores: PlayerScore[] = game.players.map((player) => ({
      playerId: player.id,
      score: newScores[player.id] || 0,
      phase: phases[player.id] || getCurrentPhase(game, player.id),
      completed: completed[player.id] || false,
    }));

    addRound(game.id, playerScores);
    
    // Reset form
    setNewScores({});
    setPhases({});
    setCompleted({});
    setShowNewRound(false);
  };

  const toggleNewRound = () => {
    if (!showNewRound) {
      // Initialize with current phases
      const initialPhases: { [playerId: string]: number } = {};
      game.players.forEach((player) => {
        initialPhases[player.id] = getCurrentPhase(game, player.id);
      });
      setPhases(initialPhases);
    }
    setShowNewRound(!showNewRound);
  };

  const handleUpdateRound = (gameId: string, roundId: string, updatedScores: PlayerScore[]) => {
    updateAllPlayerScores(gameId, roundId, updatedScores);
    setEditRoundId(null);
  };

  const handleDeleteRound = () => {
    if (roundToDelete && game) {
      deleteRound(game.id, roundToDelete);
      setRoundToDelete(null);
    }
  };

  return (
    <Layout title="Game Details" backLink="/">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">{formatDate(game.date)}</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {game.rounds.length} {game.rounds.length === 1 ? "round" : "rounds"}
          </span>
        </div>
      </div>

      {/* Score Summary */}
      <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-phase10-darkBlue dark:text-phase10-lightBlue">Score Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {game.players.map((player) => {
              const totalScore = calculateTotalScore(game, player.id);
              const currentPhase = getCurrentPhase(game, player.id);
              
              return (
                <div
                  key={player.id}
                  className="rounded-lg bg-gray-50 dark:bg-gray-700 p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <PlayerAvatar player={player} />
                    <div>
                      <div className="text-base font-semibold">{player.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Phase {currentPhase > 10 ? "Complete!" : currentPhase}
                      </div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-phase10-blue dark:text-phase10-lightBlue">
                    {totalScore}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Rounds */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Rounds</h3>
          <Button 
            onClick={toggleNewRound}
            variant={showNewRound ? "outline" : "default"}
            className={!showNewRound ? "bg-phase10-blue hover:bg-phase10-darkBlue text-white" : ""}
          >
            {showNewRound ? "Cancel" : "Add Round"}
          </Button>
        </div>

        {/* New Round Form */}
        {showNewRound && (
          <Card className="mb-6 border-2 border-phase10-blue dark:bg-gray-800 dark:border-phase10-lightBlue">
            <CardHeader>
              <CardTitle className="text-phase10-darkBlue dark:text-phase10-lightBlue">New Round</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[280px] pr-4">
                <div className="space-y-6">
                  {game.players.map((player) => {
                    const playerId = player.id;
                    const currentPhase = phases[playerId] || getCurrentPhase(game, playerId);
                    
                    return (
                      <div key={playerId} className="pb-4 border-b dark:border-gray-700 last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <PlayerAvatar player={player} size="sm" />
                          <span className="font-medium">{player.name}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`score-${playerId}`}>Score</Label>
                            <Input
                              id={`score-${playerId}`}
                              type="number"
                              value={newScores[playerId] || ""}
                              onChange={(e) => handleScoreChange(playerId, e.target.value)}
                              className="mt-1"
                              min={0}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`phase-${playerId}`}>Phase</Label>
                            <Select 
                              value={phases[playerId]?.toString() || currentPhase.toString()} 
                              onValueChange={(value) => handlePhaseChange(playerId, value)}
                            >
                              <SelectTrigger id={`phase-${playerId}`} className="mt-1">
                                <SelectValue placeholder="Select phase" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 10 }, (_, i) => i + 1).map((phase) => (
                                  <SelectItem key={phase} value={phase.toString()}>
                                    Phase {phase}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="mt-2 flex items-center space-x-2">
                          <Checkbox
                            id={`completed-${playerId}`}
                            checked={completed[playerId] || false}
                            onCheckedChange={(checked) => 
                              handleCompletedChange(playerId, checked === true)
                            }
                          />
                          <Label htmlFor={`completed-${playerId}`}>Completed phase</Label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              
              <Button
                onClick={handleAddRound}
                className="w-full mt-4 bg-phase10-blue hover:bg-phase10-darkBlue text-white"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Round
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Round List */}
        {game.rounds.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">No rounds recorded yet.</p>
            <Button 
              onClick={() => setShowNewRound(true)}
              className="mt-2 bg-phase10-blue hover:bg-phase10-darkBlue text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" /> Add First Round
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {[...game.rounds].reverse().map((round, index) => (
              <Card key={round.id} className="dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                      Round {game.rounds.length - index}
                    </h4>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-500 hover:text-phase10-blue"
                            onClick={() => setEditRoundId(round.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        {editRoundId === round.id && (
                          <DialogContent className="sm:max-w-md">
                            <RoundEditor 
                              roundId={round.id}
                              gameId={game.id}
                              playerScores={round.playerScores}
                              players={game.players}
                              onSave={handleUpdateRound}
                              onCancel={() => setEditRoundId(null)}
                            />
                          </DialogContent>
                        )}
                      </Dialog>
                      
                      <AlertDialog 
                        open={roundToDelete === round.id}
                        onOpenChange={(open) => !open && setRoundToDelete(null)}
                      >
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-500 hover:text-red-600"
                            onClick={() => setRoundToDelete(round.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Round</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this round? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteRound}
                              className="bg-red-600 text-white hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {game.players.map((player) => {
                      const playerScore = round.playerScores.find(
                        (ps) => ps.playerId === player.id
                      );
                      
                      if (!playerScore) return null;
                      
                      return (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <PlayerAvatar player={player} size="sm" />
                            <div>
                              <div className="font-medium">{player.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Phase {playerScore.phase}
                                {playerScore.completed && (
                                  <Check className="inline-block h-3 w-3 ml-1 text-phase10-green" />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-xl font-bold">{playerScore.score}</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GameDetail;
