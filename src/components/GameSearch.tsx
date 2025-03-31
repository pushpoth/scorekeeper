
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGameContext } from '@/context/GameContext';
import { isValidCode } from '@/utils/codeGenerator';
import { toast } from '@/hooks/use-toast';

const GameSearch: React.FC = () => {
  const [code, setCode] = useState('');
  const { getGameByCode } = useGameContext();
  const navigate = useNavigate();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please enter a game code",
        variant: "destructive",
      });
      return;
    }
    
    if (!isValidCode(code)) {
      toast({
        title: "Invalid code format",
        description: "Game codes should be three words separated by hyphens",
        variant: "destructive",
      });
      return;
    }
    
    const game = getGameByCode(code);
    if (game) {
      navigate(`/games/${game.id}`);
    } else {
      toast({
        title: "Game not found",
        description: "No game found with this code",
        variant: "destructive",
      });
    }
  };
  
  return (
    <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2 mb-4">
      <Input
        type="text"
        placeholder="Find game by code (e.g. apple-banana-cherry)"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" variant="secondary" size="icon">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default GameSearch;
