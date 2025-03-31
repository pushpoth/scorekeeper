
import React from "react";
import { Home, Plus, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const MobileMenu: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-2 px-4 z-10">
      <div className="flex items-center justify-around">
        <Link to="/games" className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-300 hover:text-phase10-blue dark:hover:text-phase10-lightBlue">
          <Home size={24} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link to="/games/new" className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-300 hover:text-phase10-blue dark:hover:text-phase10-lightBlue">
          <Plus size={24} />
          <span className="text-xs mt-1">New Game</span>
        </Link>
        <Link to="/settings" className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-300 hover:text-phase10-blue dark:hover:text-phase10-lightBlue">
          <Settings size={24} />
          <span className="text-xs mt-1">Settings</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileMenu;
