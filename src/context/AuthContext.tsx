
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { User, AuthContextType } from '../types/auth';
import { initialRegisteredUsers, validateCredentials, updateUserInStorage, setupDataSync } from '../utils/authUtils';
import { syncDriverWithUser } from '../utils/mockData';
import { loadAndSyncPasswords } from '../data/passwords';

// Initialize the registered users array
let registeredUsers = initialRegisteredUsers();

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Setup cross-device synchronization
  useEffect(() => {
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
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate, currentUser]);

  const login = async (usernameOrEmail: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reload the latest registered users
      registeredUsers = JSON.parse(localStorage.getItem('swiftaid_registered_users') || '[]');
      
      console.log("Trying to login with:", usernameOrEmail);
      console.log("Available users:", registeredUsers.map(u => u.username || u.email));
      
      const user = validateCredentials(usernameOrEmail, password, registeredUsers);
      
      console.log("Found user:", user);
      console.log("Password check:", user && (password === password)); // Simplified for logging
      
      if (user) {
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      
      // Create new user
      const newUser: User = {
        id: `user_${Date.now().toString(36)}`,
        name,
        email,
        username,
        role: 'requester',
        phone
      };
      
      // Add to registered users
      registeredUsers.push(newUser);
      
      // Update localStorage with new registered users
      localStorage.setItem('swiftaid_registered_users', JSON.stringify(registeredUsers));
      
      // Update passwords in localStorage
      let storedPasswords = JSON.parse(localStorage.getItem('swiftaid_passwords') || '{}');
      storedPasswords[email] = password;
      storedPasswords[username] = password;
      localStorage.setItem('swiftaid_passwords', JSON.stringify(storedPasswords));
      
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
