
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'requester' | 'driver' | 'admin';
  phone?: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isDriver: boolean;
  isRequester: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@swiftaid.com',
    role: 'admin',
    phone: '123-456-7890'
  },
  {
    id: '2',
    name: 'Driver One',
    email: 'driver1@swiftaid.com',
    role: 'driver',
    phone: '123-456-7891'
  },
  {
    id: '3',
    name: 'Driver Two',
    email: 'driver2@swiftaid.com',
    role: 'driver',
    phone: '123-456-7892'
  }
];

export const mockPasswords = {
  'admin@swiftaid.com': 'admin123',
  'driver1@swiftaid.com': 'driver123',
  'driver2@swiftaid.com': 'driver123'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('swiftaid_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check mock users
      const user = mockUsers.find(u => u.email === email);
      
      if (user && mockPasswords[email as keyof typeof mockPasswords] === password) {
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
        toast.error('Invalid email or password');
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
      
      // Check if email already exists
      if (mockUsers.some(u => u.email === email)) {
        toast.error('Email already in use');
        setLoading(false);
        return;
      }
      
      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}`,
        name,
        email,
        role: 'requester',
        phone
      };
      
      // In a real app, we would save to database here
      mockUsers.push(newUser);
      // Also add to mock passwords
      Object.assign(mockPasswords, { [email]: password });
      
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
    isRequester
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
