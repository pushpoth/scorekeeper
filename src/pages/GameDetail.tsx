
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
import { formatDate, calculateTotalScore, getPlayerName, getCurrentPhase } from "@/utils/gameUtils";
import { PlayerScore } from "@/types";
import { Check, Plus } from "lucide-react";

const GameDetail = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { games, players, addRound, getGame } = useGameContext();
  const [newScores, setNewScores] = useState<{ [playerId: string]: number }>({});
  const [phases, setPhases] = useState<{ [playerId: string]: number }>({});
  const [completed, setCompleted] = useState<{ [playerId: string]: boolean }>({});
  const [showNewRound, setShowNewRound] = useState(false);

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
    // Clamp between 1 and 10
    const clampedPhase = Math.min(Math.max(phase, 1), 10);
    setPhases((prev) => ({ ...prev, [playerId]: clampedPhase }));
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

  return (
    <Layout title="Game Details" backLink="/">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-700">{formatDate(game.date)}</h2>
          <span className="text-sm text-gray-500">
            {game.rounds.length} {game.rounds.length === 1 ? "round" : "rounds"}
          </span>
        </div>
      </div>

      {/* Score Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-phase10-darkBlue">Score Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {game.players.map((player) => {
              const totalScore = calculateTotalScore(game, player.id);
              const currentPhase = getCurrentPhase(game, player.id);
              
              return (
                <div
                  key={player.id}
                  className="rounded-lg bg-gray-50 p-4 flex flex-col items-center"
                >
                  <div className="text-lg font-semibold mb-1">{player.name}</div>
                  <div className="text-3xl font-bold text-phase10-blue mb-1">
                    {totalScore}
                  </div>
                  <div className="text-sm text-gray-500">
                    Phase {currentPhase > 10 ? "Complete!" : currentPhase}
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
          <h3 className="text-lg font-semibold text-gray-700">Rounds</h3>
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
          <Card className="mb-6 border-2 border-phase10-blue">
            <CardHeader>
              <CardTitle className="text-phase10-darkBlue">New Round</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[280px] pr-4">
                <div className="space-y-6">
                  {game.players.map((player) => {
                    const playerId = player.id;
                    const currentPhase = phases[playerId] || getCurrentPhase(game, playerId);
                    
                    return (
                      <div key={playerId} className="pb-4 border-b last:border-0">
                        <div className="font-medium mb-2">{player.name}</div>
                        
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
                            <Label htmlFor={`phase-${playerId}`}>Phase ({currentPhase})</Label>
                            <Input
                              id={`phase-${playerId}`}
                              type="number"
                              value={phases[playerId] || ""}
                              onChange={(e) => handlePhaseChange(playerId, e.target.value)}
                              className="mt-1"
                              min={1}
                              max={10}
                              placeholder={currentPhase.toString()}
                            />
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
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No rounds recorded yet.</p>
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
              <Card key={round.id}>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Round {game.rounds.length - index}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {game.players.map((player) => {
                      const playerScore = round.playerScores.find(
                        (ps) => ps.playerId === player.id
                      );
                      
                      if (!playerScore) return null;
                      
                      return (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div>
                            <div className="font-medium">{player.name}</div>
                            <div className="text-sm text-gray-500">
                              Phase {playerScore.phase}
                              {playerScore.completed && (
                                <Check className="inline-block h-3 w-3 ml-1 text-phase10-green" />
                              )}
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
