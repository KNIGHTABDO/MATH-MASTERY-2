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
        console.log('Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        console.log('Initial session:', session?.user?.id);

        if (session?.user && mounted) {
          await fetchUserProfile(session.user.id);
        } else if (mounted) {
          console.log('No session found, setting loading to false');
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
      
      if (!mounted) {
        console.log('Component unmounted, ignoring auth change');
        return;
      }

      if (event === 'SIGNED_OUT' || !session?.user) {
        console.log('User signed out or no session');
        setUser(null);
        setLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('User signed in or token refreshed, fetching profile...');
        setLoading(true);
        await fetchUserProfile(session.user.id);
      }

      // Handle other events
      if (event === 'USER_UPDATED') {
        console.log('User updated, refreshing profile...');
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Separate timeout effect to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const loadingTimeout = setTimeout(() => {
        console.warn('Auth loading timeout reached, setting loading to false');
        setLoading(false);
      }, 5000); // 5 seconds timeout

      return () => clearTimeout(loadingTimeout);
    }
  }, [loading]);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId);
      
      // First get the user data
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user:', userError);
        setUser(null);
        return;
      }

      if (!userData.user) {
        console.log('No user found');
        setUser(null);
        return;
      }

      console.log('User data retrieved, now fetching profile...');

      // Then try to get the profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      console.log('Profile query result:', { profile, profileError });

      // If profile doesn't exist, try to create it
      if (!profile && !profileError) {
        console.log('No profile found, attempting to create one...');
        
        const firstName = userData.user.user_metadata?.first_name || 'Prénom';
        const lastName = userData.user.user_metadata?.last_name || 'Nom';
        
        try {
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: userId,
              first_name: firstName,
              last_name: lastName
            })
            .select()
            .single();
            
          if (createError) {
            console.warn('Could not create profile:', createError);
          } else {
            console.log('Profile created successfully:', newProfile);
          }
        } catch (createError) {
          console.warn('Profile creation failed:', createError);
        }
      }

      if (profileError && typeof profileError === 'object' && 'code' in profileError && profileError.code !== 'PGRST116') { 
        console.error('Error fetching user profile:', profileError);
      }

      // Get the role from user metadata or profile, fallback to 'student'
      const userRole = userData.user.user_metadata?.role || profile?.role || 'student';

      const newUser: User = {
        id: userData.user.id,
        email: userData.user.email!,
        role: userRole,
        created_at: userData.user.created_at,
        profile: profile || undefined
      };

      console.log('Setting user:', newUser);
      setUser(newUser);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      
      // Try to set a basic user even if profile fetch fails
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          console.log('Setting basic user data due to profile error');
          const basicUser: User = {
            id: userData.user.id,
            email: userData.user.email!,
            role: userData.user.user_metadata?.role || 'student',
            created_at: userData.user.created_at,
            profile: undefined
          };
          setUser(basicUser);
          return;
        }
      } catch (basicError) {
        console.error('Could not set basic user:', basicError);
      }
      
      setUser(null);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    setLoading(true);
    try {
      console.log('Starting signup process...');
      
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

      if (error) {
        console.error('Supabase signup error:', error);
        throw error;
      }

      console.log('Signup successful:', data);

      // If user is created but no session (email confirmation required)
      if (data.user && !data.session) {
        toast.success('Compte créé! Vérifiez votre email pour confirmer votre compte.');
      } 
      // If user is created and session exists (auto-confirmed)
      else if (data.user && data.session) {
        toast.success('Compte créé avec succès!');
        
        // Try to create profile manually if the trigger fails
        try {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: data.user.id,
              first_name: firstName,
              last_name: lastName
            });
            
          if (profileError && profileError.code !== '23505') { // 23505 is unique constraint violation (profile already exists)
            console.warn('Profile creation warning:', profileError);
          }
        } catch (profileError) {
          console.warn('Could not create profile, but signup succeeded:', profileError);
        }
      }
    } catch (error: unknown) {
      console.error('Signup error:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('already registered')) {
          throw new Error('Un compte avec cette adresse email existe déjà.');
        } else if (error.message.includes('Invalid email')) {
          throw new Error('Format d\'email invalide.');
        } else if (error.message.includes('weak password')) {
          throw new Error('Le mot de passe doit contenir au moins 6 caractères.');
        } else if (error.message.includes('Database error')) {
          throw new Error('Erreur temporaire. Veuillez réessayer dans quelques instants.');
        }
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Starting signin process...');
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Signin error:', error);
        
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou mot de passe incorrect.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Veuillez confirmer votre email avant de vous connecter.');
        }
        
        throw error;
      }

      console.log('Signin successful');
      toast.success('Connexion réussie!');
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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