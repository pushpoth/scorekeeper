import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import MobileMenu from "@/components/MobileMenu";
import { useMobile } from "@/hooks/useMobile";
import { useTheme } from "@/context/ThemeContext";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  rightContent?: React.ReactNode;
  showBackButton?: boolean;
  showMobileMenu?: boolean;
  subtitle?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  rightContent, 
  showBackButton = false,
  showMobileMenu = true,
  subtitle
}) => {
  const isMobile = useMobile();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Full-width header with its own background color */}
      <header className="w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center">
              {showBackButton && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="mr-2" 
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            
            {/* Right content (buttons, menu, etc.) */}
            <div className="flex items-center">
              {rightContent}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Mobile menu */}
      {showMobileMenu && isMobile && (
        <MobileMenu />
      )}
    </div>
  );
};

export default Layout;
