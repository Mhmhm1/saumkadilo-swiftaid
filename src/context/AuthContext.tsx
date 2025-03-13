
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { User, AuthContextType } from '../types/auth';
import { 
  initialRegisteredUsers, 
  validateCredentials, 
  updateUserInStorage, 
  registerUser,
  setupDataSync
} from '../utils/authUtils';
import { syncDriverWithUser } from '../utils/mockData';
import {
  syncLocalToFirebase,
  syncFirebaseToLocal,
  firebaseLogin,
  firebaseRegister,
  firebaseLogout,
  updateUserInFirebase
} from '../utils/firebaseUtils';

// Initialize the registered users array once
let registeredUsers = initialRegisteredUsers();

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncEnabled, setSyncEnabled] = useState<boolean>(false);
  const navigate = useNavigate();

  // Setup cross-device synchronization
  useEffect(() => {
    // Setup the data sync mechanism
    setupDataSync();
    
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('swiftaid_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('User automatically logged in:', parsedUser.username || parsedUser.email);
        setCurrentUser(parsedUser);
        
        // Attempt to sync with Firebase when user is loaded
        syncLocalToFirebase().then(success => {
          if (success) {
            setSyncEnabled(true);
            toast.success('Data synchronized with cloud');
          }
        });
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('swiftaid_user');
      }
    }
    setLoading(false);
    
    // For cross-tab logout synchronization
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'swiftaid_user' && event.newValue === null) {
        // User logged out in another tab
        setCurrentUser(null);
        navigate('/login');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate]);

  // Sync with Firebase periodically if sync is enabled
  useEffect(() => {
    if (!syncEnabled) return;

    const syncInterval = setInterval(() => {
      syncLocalToFirebase();
    }, 60000); // Sync every minute

    return () => clearInterval(syncInterval);
  }, [syncEnabled]);

  const login = async (usernameOrEmail: string, password: string) => {
    setLoading(true);
    try {
      console.log("Login attempt with:", usernameOrEmail);
      
      // Reload the latest registered users before validating
      registeredUsers = JSON.parse(localStorage.getItem('swiftaid_registered_users') || '[]');
      if (registeredUsers.length === 0) {
        // If somehow we lost all users, reinitialize
        registeredUsers = initialRegisteredUsers();
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let user: User | null = null;
      
      // Try local login first
      user = validateCredentials(usernameOrEmail, password, registeredUsers);
      
      if (!user) {
        try {
          // If local login fails, try Firebase login
          const isEmail = usernameOrEmail.includes('@');
          if (isEmail) {
            user = await firebaseLogin(usernameOrEmail, password);
            // If Firebase login succeeds, sync data
            await syncFirebaseToLocal();
            setSyncEnabled(true);
            toast.success('Cloud sync enabled');
          } else {
            // Username login is only supported locally
            toast.error('Invalid username/email or password');
            setLoading(false);
            return;
          }
        } catch (firebaseError) {
          console.log("Firebase login failed, continuing with local only");
        }
      }
      
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
        
        // Try to sync with Firebase
        syncLocalToFirebase().then(success => {
          if (success) {
            setSyncEnabled(true);
          }
        });
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
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let newUser: User;
      
      // Try to register with Firebase first
      try {
        newUser = await firebaseRegister(email, password, { 
          name, 
          username, 
          role: 'requester' as 'requester' | 'driver' | 'admin',
          phone
        });
        setSyncEnabled(true);
        toast.success('Cloud sync enabled');
      } catch (firebaseError) {
        console.log("Firebase registration failed, continuing with local only:", firebaseError);
        // If Firebase registration fails, register locally
        newUser = registerUser(name, email, password, phone);
      }
      
      // Auto login after registration
      setCurrentUser(newUser);
      localStorage.setItem('swiftaid_user', JSON.stringify(newUser));
      
      toast.success('Registration successful');
      navigate('/dashboard');
      
      // Try to sync with Firebase
      syncLocalToFirebase();
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
    
    // Update in Firebase if sync is enabled
    if (syncEnabled) {
      updateUserInFirebase(updatedUser);
    }
    
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
    
    // Update in Firebase if sync is enabled
    if (syncEnabled) {
      updateUserInFirebase(updatedUser);
    }
    
    // If this is a driver, also update the driver data in mockDrivers
    if (currentUser.role === 'driver') {
      syncDriverWithUser(currentUser.id, updates);
    }
    
    toast.success('Profile updated successfully');
  };

  const logout = async () => {
    // Try to sync before logout
    if (syncEnabled) {
      await syncLocalToFirebase();
      await firebaseLogout();
    }
    
    setCurrentUser(null);
    localStorage.removeItem('swiftaid_user');
    setSyncEnabled(false);
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const toggleSync = async () => {
    if (syncEnabled) {
      setSyncEnabled(false);
      toast.info('Cloud sync disabled');
    } else {
      const success = await syncLocalToFirebase();
      if (success) {
        setSyncEnabled(true);
        toast.success('Cloud sync enabled');
      } else {
        toast.error('Failed to enable cloud sync');
      }
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
    updateUserProfile,
    syncEnabled,
    toggleSync
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
