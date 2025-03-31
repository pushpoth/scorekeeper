
import React from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  return (
    <Layout title="ScoreKeeper">
      <div className="flex flex-col items-center justify-center py-8 md:py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-phase10-darkBlue dark:text-phase10-lightBlue">
          ScoreKeeper
        </h1>
        
        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-xl">
          Track game scores, manage players, and analyze performance over time.
          All your data is securely stored in the cloud.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          {user ? (
            <Link to="/games">
              <Button className="text-lg px-6 py-6 h-auto bg-phase10-blue hover:bg-phase10-darkBlue text-white">
                View Your Games <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button className="text-lg px-6 py-6 h-auto bg-phase10-blue hover:bg-phase10-darkBlue text-white">
                Sign In or Register <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-3 text-phase10-blue dark:text-phase10-lightBlue">Track Scores</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Keep track of scores across multiple games and rounds. Identify patterns and improve your gameplay.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-3 text-phase10-blue dark:text-phase10-lightBlue">Share Games</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Share games with unique codes. Let others view and contribute to your game scores.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-3 text-phase10-blue dark:text-phase10-lightBlue">Cloud Storage</h3>
            <p className="text-gray-600 dark:text-gray-400">
              All your game data is securely stored in the cloud, accessible from any device at any time.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
