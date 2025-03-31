
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { AuthForm } from "@/components/auth/AuthForm";
import { ProfileCard } from "@/components/auth/ProfileCard";

const Home = () => {
  const { user, loading } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated but missing profile info
    if (!loading && user) {
      const hasProfile = user.user_metadata?.playerName;
      
      if (hasProfile) {
        navigate("/games");
      } else {
        setShowProfile(true);
      }
    }
  }, [user, loading, navigate]);

  const handleProfileComplete = () => {
    navigate("/games");
  };

  return (
    <Layout 
      title="Phase 10 Score Tracker" 
      hideSignOut={!user}
    >
      <div className="flex flex-col items-center justify-center py-6 md:py-12">
        <div className="max-w-3xl w-full mx-auto text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-phase10-darkBlue dark:text-phase10-lightBlue mb-3">
            Welcome to Phase 10 Score Tracker
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            The easiest way to track your Phase 10 scores and see who's winning
          </p>
        </div>

        <div className="w-full max-w-md mx-auto">
          {loading ? (
            <Card className="w-full p-6">
              <CardContent className="py-8">
                <div className="text-center">Loading...</div>
              </CardContent>
            </Card>
          ) : showProfile ? (
            <ProfileCard onComplete={handleProfileComplete} />
          ) : !user ? (
            <AuthForm />
          ) : (
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-center text-2xl">Continue to App</CardTitle>
                <CardDescription className="text-center">
                  You're signed in and ready to go
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button 
                  onClick={() => navigate("/games")}
                  className="bg-phase10-blue hover:bg-phase10-darkBlue text-white"
                >
                  Go to Games
                </Button>
              </CardContent>
              <CardFooter className="text-center text-sm text-muted-foreground">
                Your games and scores are saved to your account
              </CardFooter>
            </Card>
          )}
        </div>

        <div className="w-full max-w-3xl mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Track Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Easily track scores, phases, and completions for all players in your Phase 10 games.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>See Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  View game history, player rankings, and track progress through the phases.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Save Games</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Create an account to save your games and access them from any device.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
