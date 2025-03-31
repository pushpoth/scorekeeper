
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { MoonIcon, SunIcon } from 'lucide-react';
import UserMenu from './UserMenu';

interface GameActionsMenuProps {
  showNewGameButton?: boolean;
}

const GameActionsMenu: React.FC<GameActionsMenuProps> = ({ showNewGameButton = true }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="mr-2"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
      </Button>
      
      {showNewGameButton && (
        <Link to="/games/new">
          <Button className="bg-phase10-blue hover:bg-phase10-darkBlue text-white">
            <Plus size={16} className="mr-1" /> New Game
          </Button>
        </Link>
      )}
      
      <UserMenu />
    </div>
  );
};

export default GameActionsMenu;
