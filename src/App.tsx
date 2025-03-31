
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GameProvider } from "@/context/GameContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import Home from "./pages/Home";
import Index from "./pages/Index";
import GameDetail from "./pages/GameDetail";
import NewGame from "./pages/NewGame";
import NotFound from "./pages/NotFound";
import { useAuth } from "@/context/AuthContext";
import { ReactNode } from "react";

const queryClient = new QueryClient();

// Protected route component
interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  
  // Show nothing while checking authentication
  if (loading) return null;
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

// Main App component
const AppContent = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/games" 
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/games/new" 
          element={
            <ProtectedRoute>
              <NewGame />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/games/:gameId" 
          element={
            <ProtectedRoute>
              <GameDetail />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

// Root App with providers
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <GameProvider>
            <Toaster />
            <Sonner />
            <AppContent />
          </GameProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
