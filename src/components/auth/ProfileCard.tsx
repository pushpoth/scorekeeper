
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import PlayerAvatar from "@/components/PlayerAvatar";
import { useAuth } from "@/context/AuthContext";
import { Player } from "@/types";
import { useGameContext } from "@/context/GameContext";

interface ProfileCardProps {
  player?: Player;
  onComplete?: () => void;
}

export function ProfileCard({ player, onComplete }: ProfileCardProps) {
  const { user, updateProfile } = useAuth();
  const { addPlayer } = useGameContext();
  
  const [name, setName] = useState(user?.user_metadata?.name || "");
  const [playerName, setPlayerName] = useState(user?.user_metadata?.playerName || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      if (!name.trim()) {
        throw new Error("Please enter your name");
      }
      
      if (!playerName.trim()) {
        throw new Error("Please enter a player name");
      }
      
      const { error } = await updateProfile({
        name: name.trim(),
        playerName: playerName.trim()
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Add as a player if needed
      if (!player) {
        addPlayer(playerName.trim());
      }
      
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Your Profile</CardTitle>
        <CardDescription className="text-center">
          Set up your account information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {player && (
            <div className="flex justify-center mb-4">
              <PlayerAvatar player={player} size="lg" />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="playerName">Player Name</Label>
            <Input
              id="playerName"
              placeholder="What name do you want to use in games?"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              disabled={isLoading || !!player}
            />
            {player && (
              <p className="text-xs text-muted-foreground">
                You already have a player profile with this name
              </p>
            )}
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-phase10-blue hover:bg-phase10-darkBlue text-white"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center text-sm text-muted-foreground">
        You can update your profile information at any time
      </CardFooter>
    </Card>
  );
}
