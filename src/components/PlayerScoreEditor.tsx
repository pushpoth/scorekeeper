
import React, { useState } from 'react';
import { Player } from '@/types';
import { useGameContext } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PlayerAvatar from '@/components/PlayerAvatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PlayerScoreEditorProps {
  player: Player;
  calculatedScore: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PlayerScoreEditor: React.FC<PlayerScoreEditorProps> = ({
  player,
  calculatedScore,
  open,
  onOpenChange
}) => {
  const { updatePlayerManualScore } = useGameContext();
  const [manualScore, setManualScore] = useState<string>(
    player.manualTotal !== undefined ? player.manualTotal.toString() : calculatedScore.toString()
  );
  const [isCustomScore, setIsCustomScore] = useState<boolean>(player.manualTotal !== undefined);
  
  const handleSave = () => {
    if (isCustomScore) {
      const score = parseInt(manualScore);
      if (!isNaN(score)) {
        updatePlayerManualScore(player.id, score);
      }
    } else {
      updatePlayerManualScore(player.id, undefined);
    }
    onOpenChange(false);
  };
  
  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualScore(e.target.value);
  };
  
  const handleToggleCustom = () => {
    if (!isCustomScore) {
      setManualScore(calculatedScore.toString());
    }
    setIsCustomScore(!isCustomScore);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlayerAvatar player={player} size="sm" />
            Edit {player.name}'s Total Score
          </DialogTitle>
          <DialogDescription>
            You can manually set a total score or use the calculated total.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="useCustomScore"
              checked={isCustomScore}
              onChange={handleToggleCustom}
              className="mr-2"
            />
            <label htmlFor="useCustomScore" className="text-sm font-medium">
              Use manual score override
            </label>
          </div>
          
          {isCustomScore ? (
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Enter total score:
              </label>
              <Input
                type="number"
                value={manualScore}
                onChange={handleScoreChange}
                className="w-full"
              />
            </div>
          ) : (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm">
                Using calculated total: <span className="font-bold">{calculatedScore}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This total is calculated from all games where {player.name} has participated.
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerScoreEditor;
