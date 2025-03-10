
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { User, AuthContextType } from '../types/auth';
import { supabase } from '@/integrations/supabase/client';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Check for active session and user data on mount
  useEffect(() => {
    async function getInitialSession() {
      setLoading(true);
      
      try {
        // Check for an active session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Get the user profile data
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error('Error fetching user profile:', error);
            throw error;
          }
          
          // Map Supabase profile to our User type with proper type casting
          const user: User = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            username: profile.username,
            // Cast string to allowed role types
            role: profile.role as 'requester' | 'driver' | 'admin',
            phone: profile.phone,
            driverId: profile.driver_id,
            ambulanceId: profile.ambulance_id,
            licenseNumber: profile.license_number,
            photoUrl: profile.photo_url,
            // Cast string to allowed status types
            status: profile.status as 'available' | 'busy' | 'offline',
            currentLocation: profile.current_location,
            currentJob: profile.current_job
          };
          
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    }
    
    getInitialSession();
    
    // Set up listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Get the user profile
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error('Error fetching user profile:', error);
            return;
          }
          
          // Map Supabase profile to our User type with proper type casting
          const user: User = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            username: profile.username,
            // Cast string to allowed role types
            role: profile.role as 'requester' | 'driver' | 'admin',
            phone: profile.phone,
            driverId: profile.driver_id,
            ambulanceId: profile.ambulance_id,
            licenseNumber: profile.license_number,
            photoUrl: profile.photo_url,
            // Cast string to allowed status types
            status: profile.status as 'available' | 'busy' | 'offline',
            currentLocation: profile.current_location,
            currentJob: profile.current_job
          };
          
          setCurrentUser(user);
          
          // Redirect based on role
          if (user.role === 'admin') {
            navigate('/admin');
          } else if (user.role === 'driver') {
            navigate('/driver');
          } else {
            navigate('/dashboard');
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          navigate('/login');
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const login = async (usernameOrEmail: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail}@swiftaid.com`,
        password
      });
      
      if (error) {
        console.error('Login error:', error);
        toast.error(error.message || 'Invalid login credentials');
        return;
      }
      
      toast.success('Login successful');
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    setLoading(true);
    try {
      // Generate a username from email
      const username = email.split('@')[0];
      
      // 1. Create the auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            username,
            role: 'requester',
            phone
          }
        }
      });
      
      if (error) {
        console.error('Registration error:', error);
        toast.error(error.message || 'Registration failed');
        return;
      }
      
      toast.success('Registration successful');
    } catch (error) {
      console.error('Unexpected registration error:', error);
      toast.error('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const updateDriverStatus = async (status: 'available' | 'busy' | 'offline', location?: string, job?: string) => {
    if (!currentUser) {
      return;
    }

    try {
      const updates = {
        status,
        current_location: location || currentUser.currentLocation,
        current_job: job || currentUser.currentJob
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', currentUser.id);
      
      if (error) {
        console.error('Error updating driver status:', error);
        toast.error('Failed to update status');
        return;
      }
      
      // Update local state
      setCurrentUser({
        ...currentUser,
        status,
        currentLocation: location || currentUser.currentLocation,
        currentJob: job || currentUser.currentJob
      });
      
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      console.error('Error updating driver status:', error);
      toast.error('Failed to update status');
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!currentUser) {
      return;
    }

    try {
      // Convert from our app's User format to Supabase profile format
      const profileUpdates = {
        name: updates.name,
        phone: updates.phone,
        driver_id: updates.driverId,
        ambulance_id: updates.ambulanceId,
        license_number: updates.licenseNumber,
        photo_url: updates.photoUrl
      };
      
      // Remove undefined values
      Object.keys(profileUpdates).forEach(key => {
        if (profileUpdates[key] === undefined) {
          delete profileUpdates[key];
        }
      });
      
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', currentUser.id);
      
      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
        return;
      }
      
      // Update local state
      setCurrentUser({
        ...currentUser,
        ...updates
      });
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast.error('Error signing out');
        return;
      }
      
      setCurrentUser(null);
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Unexpected logout error:', error);
      toast.error('An error occurred during logout');
    }
  };

  const isAdmin = currentUser?.role === 'admin';
  const isDriver = currentUser?.role === 'driver';
  const isRequester = currentUser?.role === 'requester';

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isDriver,
    isRequester,
    updateDriverStatus,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
