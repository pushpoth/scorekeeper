
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import Footer from "@/components/Footer";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  backLink?: string;
  backText?: string;
  rightContent?: React.ReactNode;
  hideSignOut?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  backLink, 
  backText,
  rightContent,
  hideSignOut = false
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <header className="w-full bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <div className="flex items-center w-full md:w-auto justify-between md:justify-start">
              <h1 className="text-2xl md:text-3xl font-bold text-phase10-darkBlue dark:text-phase10-lightBlue">{title}</h1>
              {backLink && (
                <Link 
                  to={backLink} 
                  className="flex items-center text-phase10-blue hover:text-phase10-darkBlue dark:text-phase10-lightBlue dark:hover:text-white transition-colors md:ml-4"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  {backText || "Back"}
                </Link>
              )}
            </div>
            
            <div className="flex items-center space-x-2 w-full md:w-auto justify-end mt-2 md:mt-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleTheme} 
                    className="mr-2"
                  >
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle {theme === 'dark' ? 'light' : 'dark'} mode</p>
                </TooltipContent>
              </Tooltip>
              
              {rightContent}
              
              {user && !hideSignOut && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSignOut}
                      className="ml-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sign Out</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
          <div className="h-1 mt-2 bg-gradient-to-r from-phase10-blue to-phase10-lightBlue rounded-full"></div>
        </div>
      </header>
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto p-4 text-gray-900 dark:text-gray-100">
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;
