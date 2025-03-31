
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useGameContext } from '@/context/GameContext';
import { Search } from 'lucide-react';

const GameSearch: React.FC = () => {
  const [searchCode, setSearchCode] = useState('');
  const navigate = useNavigate();
  const { getGameByCode } = useGameContext();

  const handleSearch = () => {
    if (!searchCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a game code",
        variant: "destructive",
      });
      return;
    }

    const game = getGameByCode(searchCode.trim());

    if (game) {
      navigate(`/games/${game.id}`);
    } else {
      toast({
        title: "Game not found",
        description: "No game found with that code",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full mb-6">
      <div className="flex gap-2">
        <div className="relative flex-grow">
          <Input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="Enter game code"
            className="pr-10"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
            <Search size={18} />
          </div>
        </div>
        <Button 
          onClick={handleSearch}
          className="bg-phase10-blue hover:bg-phase10-darkBlue text-white"
        >
          Find Game
        </Button>
      </div>
    </div>
  );
};

export default GameSearch;
