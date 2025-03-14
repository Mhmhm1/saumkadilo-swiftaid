
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '../types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isAdmin: false,
  isDriver: false,
  isRequester: false,
  updateDriverStatus: () => {},
  updateUserProfile: () => {},
  sendSmsNotification: async () => false,
  toggleSmsNotifications: () => {},
  checkUserActivity: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Derived state
  const isAdmin = Boolean(currentUser?.role === 'admin');
  const isDriver = Boolean(currentUser?.role === 'driver');
  const isRequester = Boolean(currentUser?.role === 'requester');

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if there's an active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          // Fetch user profile from the database
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userError) {
            console.error('Error fetching user data:', userError);
            setLoading(false);
            return;
          }
          
          setCurrentUser(userData as User);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session) {
        // Fetch user profile after sign in
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (userError) {
          console.error('Error fetching user data:', userError);
          return;
        }
        
        setCurrentUser(userData as User);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (usernameOrEmail: string, password: string) => {
    setLoading(true);
    try {
      // Try to sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail}@example.com`,
        password,
      });

      if (error) {
        // Try username-based login if email login fails
        if (!usernameOrEmail.includes('@')) {
          // Get the user with this username
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('email')
            .eq('username', usernameOrEmail)
            .single();
          
          if (userError) {
            throw new Error('Invalid username or password');
          }
          
          // Try again with the email
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: userData.email,
            password,
          });
          
          if (loginError) {
            throw new Error('Invalid username or password');
          }
        } else {
          throw new Error(error.message);
        }
      }
      
      // Update last_active timestamp
      if (data.user) {
        await supabase
          .from('users')
          .update({ last_active: Date.now() })
          .eq('id', data.user.id);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string, phone?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'requester',
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Update phone number if provided
      if (phone && data.user) {
        await supabase
          .from('users')
          .update({ phone })
          .eq('id', data.user.id);
      }

      toast({
        title: "Registration Successful",
        description: "Your account has been created. You are now logged in.",
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Failed",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    }
  };

  // Update driver status
  const updateDriverStatus = async (status: 'available' | 'busy' | 'offline', location?: string, job?: string) => {
    if (!currentUser) return;
    
    try {
      const updates: {
        status: 'available' | 'busy' | 'offline';
        current_location?: string;
        current_job?: string;
      } = { status };
      
      if (location) updates.current_location = location;
      if (status === 'busy' && job) updates.current_job = job;
      if (status !== 'busy') updates.current_job = null;
      
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', currentUser.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setCurrentUser(prev => prev ? { ...prev, ...data } as User : null);
      
      toast({
        title: "Status Updated",
        description: `Your status is now set to ${status}`,
      });
    } catch (error) {
      console.error('Error updating driver status:', error);
      toast({
        title: "Status Update Failed",
        description: "Failed to update your status.",
        variant: "destructive",
      });
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;
    
    try {
      // Convert snake_case keys for Supabase
      const dbUpdates: Record<string, any> = {};
      Object.entries(updates).forEach(([key, value]) => {
        // Convert camelCase to snake_case
        const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        dbUpdates[snakeKey] = value;
      });
      
      const { data, error } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', currentUser.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      setCurrentUser(prev => prev ? { ...prev, ...data } as User : null);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Profile Update Failed",
        description: "Failed to update your profile.",
        variant: "destructive",
      });
    }
  };

  // Send SMS notification
  const sendSmsNotification = async (userId: string, message: string): Promise<boolean> => {
    try {
      // Here you would integrate with an SMS service
      // For now, we'll simulate it with a console log
      console.log(`Sending SMS to user ${userId}: ${message}`);
      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  };

  // Toggle SMS notifications
  const toggleSmsNotifications = async (enabled: boolean) => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ sms_notifications: enabled })
        .eq('id', currentUser.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setCurrentUser(prev => prev ? { ...prev, ...data } as User : null);
      
      toast({
        title: `SMS Notifications ${enabled ? 'Enabled' : 'Disabled'}`,
        description: `You will ${enabled ? 'now' : 'no longer'} receive SMS notifications.`,
      });
    } catch (error) {
      console.error('Error toggling SMS notifications:', error);
      toast({
        title: "Failed to Update Notifications",
        description: "An error occurred while updating your notification preferences.",
        variant: "destructive",
      });
    }
  };

  // Check user activity
  const checkUserActivity = async () => {
    if (!currentUser) return;
    
    try {
      await supabase
        .from('users')
        .update({ last_active: Date.now() })
        .eq('id', currentUser.id);
    } catch (error) {
      console.error('Error updating last active timestamp:', error);
    }
  };

  // Context value
  const contextValue: AuthContextType = {
    currentUser,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isDriver,
    isRequester,
    updateDriverStatus,
    updateUserProfile,
    sendSmsNotification,
    toggleSmsNotifications,
    checkUserActivity,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
