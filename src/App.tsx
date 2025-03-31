
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { GameProvider } from "./context/GameContext";
import { AuthProvider as AuthContextProvider } from "./context/AuthContext";
import { Toaster } from "./components/ui/toaster";

import Index from "./pages/Index";
import GameDetail from "./pages/GameDetail";
import NewGame from "./pages/NewGame";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import AuthProvider from "./components/AuthProvider";

function App() {
  return (
    <AuthContextProvider>
      <ThemeProvider>
        <GameProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={
              <AuthProvider requireAuth={false}>
                <Auth />
              </AuthProvider>
            } />
            
            {/* Protected routes */}
            <Route path="/games" element={
              <AuthProvider>
                <Index />
              </AuthProvider>
            } />
            <Route path="/games/:id" element={
              <AuthProvider>
                <GameDetail />
              </AuthProvider>
            } />
            <Route path="/games/new" element={
              <AuthProvider>
                <NewGame />
              </AuthProvider>
            } />
            <Route path="/code/:code" element={
              <AuthProvider>
                <GameDetail />
              </AuthProvider>
            } />
            
            {/* Fallback routes */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" />} />
          </Routes>
          <Toaster />
        </GameProvider>
      </ThemeProvider>
    </AuthContextProvider>
  );
}

export default App;
