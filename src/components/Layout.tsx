
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  backLink?: string;
  backText?: string;
  rightContent?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  backLink, 
  backText,
  rightContent 
}) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-3xl mx-auto p-4">
        <header className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <h1 className="text-2xl md:text-3xl font-bold text-phase10-darkBlue dark:text-phase10-lightBlue">{title}</h1>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme} 
                className="ml-2"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              {backLink && (
                <Link 
                  to={backLink} 
                  className="flex items-center text-phase10-blue hover:text-phase10-darkBlue dark:text-phase10-lightBlue dark:hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  {backText || "Back"}
                </Link>
              )}
              {rightContent}
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-phase10-blue to-phase10-lightBlue rounded-full"></div>
        </header>
        <main className="text-gray-900 dark:text-gray-100">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
