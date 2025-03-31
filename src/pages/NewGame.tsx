import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameContext } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Layout from "@/components/Layout";

const NewGame = () => {
  const { players, addPlayer, createGame } = useGameContext();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const navigate = useNavigate();

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayers((current) =>
      current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : [...current, playerId]
    );
  };

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      const playerId = addPlayer(newPlayerName);
      if (playerId) {
        setSelectedPlayers((current) => [...current, playerId]);
        setNewPlayerName("");
      }
    }
  };

  const handleCreateGame = () => {
    if (selectedPlayers.length === 0) {
      return; // We should have at least one player
    }
    
    const gameId = createGame(selectedDate, selectedPlayers);
    navigate(`/games/${gameId}`);
  };

  return (
    <Layout title="New Game" showBackButton backLink="/">
      <div className="space-y-6">
        <div>
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal mt-1",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <Label>Players</Label>
            <span className="text-sm text-gray-500">
              {selectedPlayers.length} selected
            </span>
          </div>
          {players.length > 0 && (
            <div className="border rounded-md p-4 mb-4 max-h-60 overflow-y-auto">
              <div className="space-y-2">
                {players.map((player) => (
                  <div key={player.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={player.id}
                      checked={selectedPlayers.includes(player.id)}
                      onCheckedChange={() => handlePlayerToggle(player.id)}
                    />
                    <Label
                      htmlFor={player.id}
                      className="cursor-pointer w-full py-1"
                    >
                      {player.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <Input
              placeholder="Add new player"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleAddPlayer}
              variant="secondary"
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </div>

        <Button
          onClick={handleCreateGame}
          className="w-full bg-phase10-blue hover:bg-phase10-darkBlue text-white"
          disabled={selectedPlayers.length === 0}
        >
          Start Game
        </Button>
      </div>
    </Layout>
  );
};

export default NewGame;
