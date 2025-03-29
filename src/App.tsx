
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "@/context/GameContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Index from "./pages/Index";
import GameDetail from "./pages/GameDetail";
import NewGame from "./pages/NewGame";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <GameProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/games/new" element={<NewGame />} />
              <Route path="/games/:gameId" element={<GameDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </GameProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
