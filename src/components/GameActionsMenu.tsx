
import React, { useState } from 'react';
import { useGameContext } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  MoreVertical, 
  Download, 
  Upload, 
  FileJson, 
  FileSpreadsheet,
  Plus
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ImportDataDialog from '@/components/ImportDataDialog';

interface GameActionsMenuProps {
  showNewGameButton?: boolean;
}

const GameActionsMenu: React.FC<GameActionsMenuProps> = ({ showNewGameButton = true }) => {
  const { exportGameData, exportCsvData } = useGameContext();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importType, setImportType] = useState<'json' | 'csv'>('json');
  
  const handleImportClick = (type: 'json' | 'csv') => {
    setImportType(type);
    setImportDialogOpen(true);
  };
  
  return (
    <div className="flex items-center gap-2">
      {showNewGameButton && (
        <Link to="/games/new">
          <Button className="bg-phase10-blue hover:bg-phase10-darkBlue text-white">
            <Plus size={16} /> New Game
          </Button>
        </Link>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreVertical size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Game Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Export</DropdownMenuLabel>
          <DropdownMenuItem onClick={exportGameData} className="cursor-pointer">
            <FileJson className="mr-2 h-4 w-4" />
            <span>Export JSON Data</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportCsvData} className="cursor-pointer">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span>Export CSV Data</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Import</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleImportClick('json')} className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            <span>Import JSON Data</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleImportClick('csv')} className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            <span>Import CSV Data</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <ImportDataDialog 
        open={importDialogOpen} 
        onOpenChange={setImportDialogOpen}
        importType={importType} 
      />
    </div>
  );
};

export default GameActionsMenu;
