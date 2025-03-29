
import React from "react";
import { Link } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  backLink?: string;
  backText?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, backLink, backText }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-4">
        <header className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-phase10-darkBlue">{title}</h1>
            {backLink && (
              <Link 
                to={backLink} 
                className="flex items-center text-phase10-blue hover:text-phase10-darkBlue transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                {backText || "Back"}
              </Link>
            )}
          </div>
          <div className="h-1 bg-gradient-to-r from-phase10-blue to-phase10-lightBlue rounded-full"></div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
