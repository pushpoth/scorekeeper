
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlayerScore, Player } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import PlayerAvatar from "./PlayerAvatar";

interface RoundEditorProps {
  roundId: string;
  gameId: string;
  playerScores: PlayerScore[];
  players: Player[];
  onSave: (gameId: string, roundId: string, updatedScores: PlayerScore[]) => void;
  onCancel: () => void;
}

const RoundEditor: React.FC<RoundEditorProps> = ({ 
  roundId, gameId, playerScores, players, onSave, onCancel 
}) => {
  const [scores, setScores] = useState<PlayerScore[]>([]);

  useEffect(() => {
    setScores([...playerScores]);
  }, [playerScores]);

  const handleScoreChange = (playerId: string, value: string) => {
    const score = parseInt(value) || 0;
    setScores((prev) => 
      prev.map(ps => ps.playerId === playerId ? { ...ps, score } : ps)
    );
  };

  const handlePhaseChange = (playerId: string, phase: string) => {
    const phaseNumber = parseInt(phase) || 1;
    setScores((prev) => 
      prev.map(ps => ps.playerId === playerId ? { ...ps, phase: phaseNumber } : ps)
    );
  };

  const handleCompletedChange = (playerId: string, checked: boolean) => {
    setScores((prev) => 
      prev.map(ps => ps.playerId === playerId ? { ...ps, completed: checked } : ps)
    );
  };

  const handleSave = () => {
    onSave(gameId, roundId, scores);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-center mb-4">Edit Round</h3>
      
      <ScrollArea className="h-[320px] pr-4">
        <div className="space-y-6">
          {players.map((player) => {
            const playerScore = scores.find(ps => ps.playerId === player.id);
            if (!playerScore) return null;
            
            return (
              <div key={player.id} className="pb-4 border-b last:border-0">
                <div className="flex items-center gap-2 font-medium mb-2">
                  <PlayerAvatar player={player} size="sm" />
                  <span>{player.name}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`score-${player.id}`}>Score</Label>
                    <Input
                      id={`score-${player.id}`}
                      type="number"
                      value={playerScore.score || 0}
                      onChange={(e) => handleScoreChange(player.id, e.target.value)}
                      className="mt-1"
                      min={0}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`phase-${player.id}`}>Phase</Label>
                    <Select 
                      value={playerScore.phase.toString()} 
                      onValueChange={(value) => handlePhaseChange(player.id, value)}
                    >
                      <SelectTrigger className="w-full mt-1">
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
                    id={`completed-${player.id}`}
                    checked={playerScore.completed || false}
                    onCheckedChange={(checked) => 
                      handleCompletedChange(player.id, checked === true)
                    }
                  />
                  <Label htmlFor={`completed-${player.id}`}>Completed phase</Label>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button 
          className="bg-phase10-blue hover:bg-phase10-darkBlue text-white" 
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default RoundEditor;
