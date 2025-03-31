
import React from "react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-4 mt-auto">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
        <div>
          &copy; {currentYear} ScoreKeeper. All rights reserved.
        </div>
        <div className="mt-2 md:mt-0">
          Made with Lovable
        </div>
      </div>
    </footer>
  );
};

export default Footer;
