
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: any | null;
  profile: any | null;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, data?: Record<string, any>) => Promise<any>;
  signOut: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          setUser(data.user);
          
          // Get user profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
          if (profileData) {
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        
        // Get user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileData) {
          setProfile(profileData);
        }
        
        // If user does not have a player record, create one
        if (profileData?.player_name) {
          const { data: existingPlayer } = await supabase
            .from('players')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle();
            
          if (!existingPlayer) {
            // Create a default player for this user
            await supabase
              .from('players')
              .insert({
                name: profileData.player_name,
                user_id: session.user.id,
                money: 0
              });
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Welcome back!',
        description: 'You have been signed in successfully.',
      });

      navigate('/');
      return data;
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message || 'Could not sign in. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, data?: Record<string, any>) => {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...data,
            playerName: data?.name || email.split('@')[0], // Use name or first part of email as default player name
          }
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Account created',
        description: 'Your account has been created. Please check your email for confirmation.',
      });

      navigate('/');
      return authData;
    } catch (error: any) {
      toast({
        title: 'Sign up failed',
        description: error.message || 'Could not sign up. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Sign out failed',
        description: error.message || 'Could not sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        signIn,
        signUp,
        signOut,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
