
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '../types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getCamelCaseProperties } from '@/utils/propertyUtils';

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
          // Get user data from the session
          const userData = {
            id: session.user.id,
            name: session.user.user_metadata.name,
            email: session.user.email || '',
            role: session.user.user_metadata.role || 'requester',
            phone: session.user.user_metadata.phone,
            driver_id: session.user.user_metadata.driver_id,
            ambulance_id: session.user.user_metadata.ambulance_id,
            license_number: session.user.user_metadata.license_number,
            photo_url: session.user.user_metadata.photo_url,
            status: session.user.user_metadata.status,
            current_location: session.user.user_metadata.current_location,
            current_job: session.user.user_metadata.current_job,
            username: session.user.user_metadata.username,
            sms_notifications: session.user.user_metadata.sms_notifications,
            last_active: session.user.user_metadata.last_active,
            created_at: session.user.created_at,
            updated_at: session.user.updated_at
          } as User;
          
          setCurrentUser(userData);
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
        // Get user data from the session
        const userData = {
          id: session.user.id,
          name: session.user.user_metadata.name,
          email: session.user.email || '',
          role: session.user.user_metadata.role || 'requester',
          phone: session.user.user_metadata.phone,
          driver_id: session.user.user_metadata.driver_id,
          ambulance_id: session.user.user_metadata.ambulance_id,
          license_number: session.user.user_metadata.license_number,
          photo_url: session.user.user_metadata.photo_url,
          status: session.user.user_metadata.status,
          current_location: session.user.user_metadata.current_location,
          current_job: session.user.user_metadata.current_job,
          username: session.user.user_metadata.username,
          sms_notifications: session.user.user_metadata.sms_notifications,
          last_active: session.user.user_metadata.last_active,
          created_at: session.user.created_at,
          updated_at: session.user.updated_at
        } as User;
        
        setCurrentUser(userData);
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
        throw new Error(error.message);
      }
      
      // Update last_active timestamp
      if (data.user) {
        await supabase.auth.updateUser({
          data: {
            last_active: Date.now()
          }
        });
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
            phone,
            last_active: Date.now()
          }
        }
      });

      if (error) {
        throw new Error(error.message);
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
        current_job?: string | null;
      } = { status };
      
      if (location) updates.current_location = location;
      if (status === 'busy' && job) updates.current_job = job;
      if (status !== 'busy') updates.current_job = null;
      
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });
      
      if (error) throw error;
      
      if (data.user) {
        const updatedUser = {
          ...currentUser,
          status: status,
          current_location: location || currentUser.current_location,
          current_job: status === 'busy' ? job : null
        };
        setCurrentUser(updatedUser);
      }
      
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
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });
      
      if (error) throw error;
      
      if (data.user) {
        const updatedUser = {
          ...currentUser,
          ...updates
        };
        setCurrentUser(updatedUser);
      }
      
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
      const { data, error } = await supabase.auth.updateUser({
        data: {
          sms_notifications: enabled
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        const updatedUser = {
          ...currentUser,
          sms_notifications: enabled
        };
        setCurrentUser(updatedUser);
      }
      
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
      await supabase.auth.updateUser({
        data: {
          last_active: Date.now()
        }
      });
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
