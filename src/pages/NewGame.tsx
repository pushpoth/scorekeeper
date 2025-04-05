import { useState, useEffect } from "react";
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
import { 
  CalendarIcon, 
  Plus, 
  DollarSign,
  Cards,
  Coins
} from "lucide-react";
import { cn } from "@/lib/utils";
import Layout from "@/components/Layout";
import { Player, GameType } from "@/types";
import PlayerAvatar from "@/components/PlayerAvatar";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";

const NewGame = () => {
  const { players, addPlayer, createGame, updatePlayerMoney } = useGameContext();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [initialMoney, setInitialMoney] = useState<number>(0);
  const [playerMoney, setPlayerMoney] = useState<Record<string, number>>({});
  const [gameType, setGameType] = useState<GameType>("Phase 10");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const initialPlayerMoney: Record<string, number> = {};
    players.forEach(player => {
      initialPlayerMoney[player.id] = player.money || 0;
    });
    setPlayerMoney(initialPlayerMoney);
  }, [players]);

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayers((current) =>
      current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : [...current, playerId]
    );
  };

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      const playerId = addPlayer(newPlayerName, initialMoney);
      if (playerId) {
        setSelectedPlayers((current) => [...current, playerId]);
        setNewPlayerName("");
      }
    }
  };

  const handleUpdatePlayerMoney = (playerId: string, amount: number) => {
    setPlayerMoney(prev => ({
      ...prev,
      [playerId]: amount
    }));
  };

  const handleCreateGame = () => {
    if (selectedPlayers.length === 0) {
      return; // We should have at least one player
    }
    
    selectedPlayers.forEach(playerId => {
      if (playerMoney[playerId] !== undefined) {
        updatePlayerMoney(playerId, playerMoney[playerId]);
      }
    });
    
    const gameId = createGame(selectedDate, selectedPlayers, gameType);
    navigate(`/games/${gameId}`);
  };

  return (
    <Layout title="New Game" showBackButton backLink="/">
      <div className="space-y-6">
        <Tabs defaultValue="gameSettings" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="gameSettings">Game Settings</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
          </TabsList>
          
          <TabsContent value="gameSettings" className="space-y-4">
            <div>
              <Label>Game Type</Label>
              <div className="grid grid-cols-2 gap-4 mt-1">
                <Card 
                  className={cn(
                    "border-2 cursor-pointer transition-all",
                    gameType === "Phase 10" 
                      ? "border-phase10-blue bg-phase10-lightBlue/10" 
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                  onClick={() => setGameType("Phase 10")}
                >
                  <CardContent className="p-4 flex items-center justify-center flex-col">
                    <Cards className="h-10 w-10 mb-2 text-phase10-blue" />
                    <span className="font-medium">Phase 10</span>
                  </CardContent>
                </Card>
                
                <Card 
                  className={cn(
                    "border-2 cursor-pointer transition-all",
                    gameType === "Poker" 
                      ? "border-phase10-blue bg-phase10-lightBlue/10" 
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                  onClick={() => setGameType("Poker")}
                >
                  <CardContent className="p-4 flex items-center justify-center flex-col">
                    <Coins className="h-10 w-10 mb-2 text-phase10-blue" />
                    <span className="font-medium">Poker</span>
                  </CardContent>
                </Card>
              </div>
            </div>

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
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="initialMoney">Initial Money for New Players</Label>
              <div className="flex items-center mt-1">
                <DollarSign className="h-5 w-5 text-gray-500 mr-1" />
                <Input
                  id="initialMoney"
                  type="number"
                  min="0"
                  value={initialMoney}
                  onChange={(e) => setInitialMoney(parseInt(e.target.value) || 0)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This amount will be added to newly created players
              </p>
            </div>
            
            <Button
              onClick={handleCreateGame}
              className="w-full bg-phase10-blue hover:bg-phase10-darkBlue text-white mt-4"
              disabled={selectedPlayers.length === 0}
            >
              Start Game
            </Button>
          </TabsContent>
          
          <TabsContent value="players" className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Players</Label>
                <span className="text-sm text-gray-500">
                  {selectedPlayers.length} selected
                </span>
              </div>
              
              {players.length > 0 && (
                <div className="border rounded-md p-4 mb-4 max-h-60 overflow-y-auto">
                  <div className="space-y-3">
                    {players.map((player) => (
                      <div key={player.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={player.id}
                            checked={selectedPlayers.includes(player.id)}
                            onCheckedChange={() => handlePlayerToggle(player.id)}
                          />
                          <Label
                            htmlFor={player.id}
                            className="cursor-pointer flex items-center gap-2"
                          >
                            <PlayerAvatar player={player} size="sm" />
                            {player.name}
                          </Label>
                        </div>
                        
                        {selectedPlayers.includes(player.id) && (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <Input
                              type="number"
                              min="0"
                              value={playerMoney[player.id] || 0}
                              onChange={(e) => handleUpdatePlayerMoney(player.id, parseInt(e.target.value) || 0)}
                              className="w-20 h-8 ml-1"
                            />
                          </div>
                        )}
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
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default NewGame;
