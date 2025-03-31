
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ExportImportModal from '@/components/ExportImportModal';

interface GameActionsMenuProps {
  showNewGameButton?: boolean;
}

const GameActionsMenu: React.FC<GameActionsMenuProps> = ({ showNewGameButton = true }) => {
  return (
    <div className="flex items-center gap-2">
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
    </div>
  );
};

export default GameActionsMenu;
