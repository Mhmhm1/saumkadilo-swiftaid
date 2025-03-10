import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { User, AuthContextType } from '../types/auth';
import { 
  initialRegisteredUsers, 
  validateCredentials, 
  updateUserInStorage, 
  setupDataSync,
  registerUser
} from '../utils/authUtils';
import { syncDriverWithUser } from '../utils/mockData';

// Initialize the registered users array
let registeredUsers = initialRegisteredUsers();

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Setup cross-device synchronization
  useEffect(() => {
    // Initialize data sync mechanism
    setupDataSync();
    
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('swiftaid_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Re-validate user data from the latest registered users
        const latestRegisteredUsers = JSON.parse(localStorage.getItem('swiftaid_registered_users') || '[]');
        const updatedUser = latestRegisteredUsers.find((u: User) => u.id === parsedUser.id);
        
        // Use the latest user data if available, otherwise use the stored user
        setCurrentUser(updatedUser || parsedUser);
        console.log('User automatically logged in:', updatedUser?.username || parsedUser.username);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('swiftaid_user');
      }
    }
    setLoading(false);
    
    // Listen for storage events from other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'swiftaid_user' && event.newValue === null) {
        // User logged out in another tab
        setCurrentUser(null);
        navigate('/login');
      } else if (event.key === 'swiftaid_registered_users' && currentUser) {
        // User data changed in another tab, refresh current user
        try {
          const updatedUsers = JSON.parse(event.newValue || '[]');
          const updatedUser = updatedUsers.find((u: User) => currentUser && u.id === currentUser.id);
          if (updatedUser) {
            setCurrentUser(updatedUser);
          }
        } catch (error) {
          console.error('Error processing storage event:', error);
        }
      }
    };
    
    // Listen for data refresh events
    const handleDataRefresh = () => {
      // Reload the latest registered users to keep them in sync
      registeredUsers = JSON.parse(localStorage.getItem('swiftaid_registered_users') || '[]');
      
      // If user is logged in, make sure they have the latest data
      if (currentUser) {
        const updatedUser = registeredUsers.find(u => u.id === currentUser.id);
        if (updatedUser && JSON.stringify(updatedUser) !== JSON.stringify(currentUser)) {
          setCurrentUser(updatedUser);
          localStorage.setItem('swiftaid_user', JSON.stringify(updatedUser));
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('swiftaid_refresh_data', handleDataRefresh);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('swiftaid_refresh_data', handleDataRefresh);
    };
  }, [navigate, currentUser]);

  const login = async (usernameOrEmail: string, password: string) => {
    setLoading(true);
    try {
      console.log("Login attempt with:", usernameOrEmail);
      
      // Reload the latest registered users to ensure we have the most up-to-date data
      registeredUsers = JSON.parse(localStorage.getItem('swiftaid_registered_users') || '[]');
      if (registeredUsers.length === 0) {
        // If somehow we have no users, reinitialize
        registeredUsers = initialRegisteredUsers();
      }
      
      console.log("Available users:", registeredUsers.map(u => u.username || u.email));
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const user = validateCredentials(usernameOrEmail, password, registeredUsers);
      
      if (user) {
        console.log("Login successful for:", user.username || user.email);
        setCurrentUser(user);
        localStorage.setItem('swiftaid_user', JSON.stringify(user));
        
        // Redirect based on role
        if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'driver') {
          navigate('/driver');
        } else {
          navigate('/dashboard');
        }
        
        toast.success(`Welcome back, ${user.name}!`);
      } else {
        console.log("Login failed for:", usernameOrEmail);
        toast.error('Invalid username/email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Reload the latest registered users
      registeredUsers = JSON.parse(localStorage.getItem('swiftaid_registered_users') || '[]');
      
      // Generate a username from email
      const username = email.split('@')[0];
      
      // Check if email or username already exists
      if (registeredUsers.some(u => u.email === email || u.username === username)) {
        toast.error('Email or username already in use');
        setLoading(false);
        return;
      }
      
      // Register the user with our helper function
      const newUser = registerUser(name, email, password, phone);
      
      // Auto login after registration
      setCurrentUser(newUser);
      localStorage.setItem('swiftaid_user', JSON.stringify(newUser));
      
      toast.success('Registration successful');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const updateDriverStatus = (status: 'available' | 'busy' | 'offline', location?: string, job?: string) => {
    if (!currentUser || currentUser.role !== 'driver') {
      return;
    }

    const updatedUser = {
      ...currentUser,
      status,
      currentLocation: location || currentUser.currentLocation,
      currentJob: job || currentUser.currentJob
    };

    setCurrentUser(updatedUser);
    updateUserInStorage(updatedUser);
    toast.success(`Status updated to ${status}`);
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!currentUser) {
      return;
    }

    const updatedUser = {
      ...currentUser,
      ...updates
    };

    setCurrentUser(updatedUser);
    updateUserInStorage(updatedUser);
    
    // If this is a driver, also update the driver data in mockDrivers
    if (currentUser.role === 'driver') {
      syncDriverWithUser(currentUser.id, updates);
    }
    
    toast.success('Profile updated successfully');
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('swiftaid_user');
    navigate('/login');
    toast.success('Logged out successfully');
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
