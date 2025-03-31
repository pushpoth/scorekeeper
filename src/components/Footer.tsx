
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-4 border-t dark:border-gray-800">
      <div className="container mx-auto px-4 flex justify-between items-center flex-wrap">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Copyright 2025
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Made with Lovable
        </div>
      </div>
    </footer>
  );
};

export default Footer;
