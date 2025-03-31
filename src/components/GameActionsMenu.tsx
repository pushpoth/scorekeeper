
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, LogOut } from 'lucide-react';
import ExportImportModal from '@/components/ExportImportModal';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { MoonIcon, SunIcon } from 'lucide-react';

interface GameActionsMenuProps {
  showNewGameButton?: boolean;
}

const GameActionsMenu: React.FC<GameActionsMenuProps> = ({ showNewGameButton = true }) => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
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
      
      <ExportImportModal 
        trigger={
          <Button variant="outline">
            Import/Export
          </Button>
        }
      />
      
      {user && (
        <Button 
          variant="outline" 
          className="ml-2" 
          onClick={handleSignOut}
          title="Sign out"
        >
          <LogOut size={16} className="mr-1" /> Sign Out
        </Button>
      )}
    </div>
  );
};

export default GameActionsMenu;
