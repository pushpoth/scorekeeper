
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { PlayerScore, Player, Game, PokerHand } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import PlayerAvatar from "./PlayerAvatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DollarSign } from "lucide-react";

interface RoundEditorProps {
  roundId?: string;
  gameId: string;
  game: Game;
  playerScores?: PlayerScore[];
  players: Player[];
  onSave: (gameId: string, roundId: string, roundData: {
    playerScores: PlayerScore[];
    potAmount?: number;
    winnerId?: string;
    winningHand?: string;
  }) => void;
  onCancel: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const POKER_HANDS: PokerHand[] = [
  "High Card",
  "One Pair",
  "Two Pair",
  "Three of a Kind",
  "Straight",
  "Flush",
  "Full House",
  "Four of a Kind",
  "Straight Flush",
  "Royal Flush"
];

const RoundEditor: React.FC<RoundEditorProps> = ({ 
  roundId, gameId, game, playerScores = [], players, onSave, onCancel, open, onOpenChange
}) => {
  const [scores, setScores] = useState<PlayerScore[]>([]);
  const [potAmount, setPotAmount] = useState<number>(0);
  const [winnerId, setWinnerId] = useState<string>("");
  const [winningHand, setWinningHand] = useState<string>("");
  const isPokerGame = game.gameType === "Poker";

  useEffect(() => {
    if (Array.isArray(playerScores) && playerScores.length > 0) {
      setScores([...playerScores]);
    } else {
      const defaultScores = players.map(player => ({
        id: undefined,
        playerId: player.id,
        score: 0,
        phase: 1,
        completed: false,
        isWinner: false
      }));
      setScores(defaultScores);
    }
    
    // Initialize pot amount and winner from existing round data if available
    if (roundId && game.rounds) {
      const round = game.rounds.find(r => r.id === roundId);
      if (round) {
        setPotAmount(round.potAmount || 0);
        setWinnerId(round.winnerId || "");
        setWinningHand(round.winningHand || "");
      }
    }
  }, [playerScores, players, roundId, game.rounds]);

  const handleScoreChange = (playerId: string, value: string) => {
    const score = parseInt(value) || 0;
    setScores(prev => 
      prev.map(ps => ps.playerId === playerId ? { ...ps, score } : ps)
    );
  };

  const handlePhaseChange = (playerId: string, phase: string) => {
    const phaseNumber = parseInt(phase) || 1;
    setScores(prev => 
      prev.map(ps => ps.playerId === playerId ? { ...ps, phase: phaseNumber } : ps)
    );
  };

  const handleCompletedChange = (playerId: string, checked: boolean) => {
    setScores(prev => 
      prev.map(ps => ps.playerId === playerId ? { ...ps, completed: checked } : ps)
    );
  };

  const handleWinnerChange = (playerId: string, checked: boolean) => {
    // In Phase 10, the winner is the player with the lowest score
    // In Poker, the winner is explicitly selected
    if (isPokerGame) {
      setWinnerId(checked ? playerId : "");
      // Update isWinner flag in player scores
      setScores(prev => 
        prev.map(ps => ({
          ...ps, 
          isWinner: ps.playerId === playerId ? checked : false
        }))
      );
    }
  };

  const handleSave = () => {
    const finalRoundId = roundId || `round-${Date.now()}`;
    
    // For Phase 10, determine the winner based on the lowest score
    let finalWinnerId = winnerId;
    
    if (!isPokerGame && scores.length > 0) {
      const lowestScorePlayer = [...scores].sort((a, b) => a.score - b.score)[0];
      finalWinnerId = lowestScorePlayer.playerId;
      
      // Update isWinner flag
      setScores(prev => 
        prev.map(ps => ({
          ...ps, 
          isWinner: ps.playerId === finalWinnerId
        }))
      );
    }
    
    onSave(gameId, finalRoundId, {
      playerScores: scores,
      potAmount,
      winnerId: finalWinnerId,
      winningHand: isPokerGame ? winningHand : undefined
    });
  };

  const content = (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-center mb-4">
        {roundId ? "Edit Round" : "Add Round"}
      </h3>
      
      {/* Pot Amount */}
      <div className="mb-4">
        <Label htmlFor="potAmount">Pot Amount</Label>
        <div className="flex items-center mt-1">
          <DollarSign className="h-5 w-5 text-gray-500 mr-1" />
          <Input
            id="potAmount"
            type="number"
            min="0"
            value={potAmount}
            onChange={(e) => setPotAmount(parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Winning Hand (Poker only) */}
      {isPokerGame && (
        <div className="mb-4">
          <Label htmlFor="winningHand">Winning Hand</Label>
          <Select 
            value={winningHand}
            onValueChange={setWinningHand}
          >
            <SelectTrigger className="w-full mt-1" id="winningHand">
              <SelectValue placeholder="Select winning hand" />
            </SelectTrigger>
            <SelectContent>
              {POKER_HANDS.map((hand) => (
                <SelectItem key={hand} value={hand}>
                  {hand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <ScrollArea className="h-[320px] pr-4">
        <div className="space-y-6">
          {players.map((player) => {
            const playerScore = scores.find(ps => ps.playerId === player.id) || {
              playerId: player.id,
              score: 0,
              phase: 1,
              completed: false,
              isWinner: false
            };
            
            return (
              <div key={player.id} className="pb-4 border-b last:border-0">
                <div className="flex items-center gap-2 font-medium mb-2">
                  <PlayerAvatar player={player} size="sm" />
                  <span>{player.name}</span>
                  
                  {/* Winner checkbox for Poker */}
                  {isPokerGame && (
                    <div className="ml-auto flex items-center space-x-2">
                      <Checkbox
                        id={`winner-${player.id}`}
                        checked={playerScore.isWinner || player.id === winnerId}
                        onCheckedChange={(checked) => 
                          handleWinnerChange(player.id, checked === true)
                        }
                      />
                      <Label htmlFor={`winner-${player.id}`} className="text-sm text-green-600">Winner</Label>
                    </div>
                  )}
                </div>
                
                {/* Phase 10 specific inputs */}
                {!isPokerGame && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`score-${player.id}`}>Score</Label>
                      <Input
                        id={`score-${player.id}`}
                        type="number"
                        value={playerScore.score}
                        onChange={(e) => handleScoreChange(player.id, e.target.value)}
                        className="mt-1"
                        min={0}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`phase-${player.id}`}>Phase</Label>
                      <div className="flex items-center gap-2">
                        <Select 
                          value={String(playerScore.phase || 1)}
                          onValueChange={(value) => handlePhaseChange(player.id, value)}
                        >
                          <SelectTrigger className="w-full mt-1 flex-1" id={`phase-${player.id}`}>
                            <SelectValue placeholder="Select phase" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map((phase) => (
                              <SelectItem key={phase} value={String(phase)}>
                                Phase {phase}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <div className="flex items-center mt-1">
                          <Checkbox
                            id={`completed-${player.id}`}
                            checked={playerScore.completed}
                            onCheckedChange={(checked) => 
                              handleCompletedChange(player.id, checked === true)
                            }
                          />
                          <Label htmlFor={`completed-${player.id}`} className="ml-2 text-sm">Completed</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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

  if (typeof open !== 'undefined' && onOpenChange) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{roundId ? "Edit Round" : "Add New Round"}</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return content;
};

export default RoundEditor;
