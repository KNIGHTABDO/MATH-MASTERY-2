import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { AuthContextType, User } from '../types';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          await fetchUserProfile(session.user.id);
        } else if (mounted) {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await fetchUserProfile(session.user.id);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // First get the user data
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user:', userError);
        setUser(null);
        setLoading(false);
        return;
      }

      if (!userData.user) {
        console.log('No user found');
        setUser(null);
        setLoading(false);
        return;
      }

      // Then try to get the profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no profile exists

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error fetching user profile:', profileError);
      }

      const newUser: User = {
        id: userData.user.id,
        email: userData.user.email!,
        role: userData.user.user_metadata?.role || 'student',
        created_at: userData.user.created_at,
        profile: profile || undefined
      };

      console.log('Setting user:', newUser);
      setUser(newUser);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'student',
            first_name: firstName,
            last_name: lastName
          }
        }
      });

      if (error) throw error;

      if (data.user && !data.session) {
        // Email confirmation required
        toast.success('Compte créé! Vérifiez votre email pour confirmer votre compte.');
      } else if (data.user && data.session) {
        // Auto-confirmed
        toast.success('Compte créé avec succès!');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast.success('Connexion réussie!');
    } catch (error: any) {
      console.error('Signin error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      toast.success('Déconnexion réussie!');
    } catch (error: any) {
      console.error('Signout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === 'admin';

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};