
import React from "react";
import { ChevronDown, Import, Export, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import ExportImportModal from "@/components/ExportImportModal";

interface UserMenuProps {
  showNewGameButton?: boolean;
}

const UserMenu: React.FC<UserMenuProps> = () => {
  const { user, signOut } = useAuth();
  const [isImportExportOpen, setIsImportExportOpen] = React.useState(false);
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || "User";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <User size={16} className="text-gray-600 dark:text-gray-400" />
            <span className="max-w-[120px] truncate">{displayName}</span>
            <ChevronDown size={14} className="opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setIsImportExportOpen(true)}>
            <div className="flex items-center gap-2 w-full">
              <Import size={16} className="mr-1" />
              <Export size={16} className="mr-1" />
              <span>Import/Export</span>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleSignOut}>
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 w-full">
              <LogOut size={16} className="mr-1" />
              <span>Sign Out</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <ExportImportModal 
        open={isImportExportOpen}
        onOpenChange={setIsImportExportOpen}
      />
    </>
  );
};

export default UserMenu;
