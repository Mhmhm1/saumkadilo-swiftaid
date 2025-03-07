import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'requester' | 'driver' | 'admin';
  phone?: string;
  driverId?: string;
  ambulanceId?: string;
  licenseNumber?: string;
  photoUrl?: string;
  status?: 'available' | 'busy' | 'offline';
  currentLocation?: string;
  currentJob?: string;
  username?: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isDriver: boolean;
  isRequester: boolean;
  updateDriverStatus: (status: 'available' | 'busy' | 'offline', location?: string, job?: string) => void;
  updateUserProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Real driver profiles with proper names
const realDriverProfiles: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@swiftaid.com',
    username: 'admin',
    role: 'admin',
    phone: '123-456-7890'
  },
  {
    id: '2',
    name: 'John Smith',
    email: 'john.smith@swiftaid.com',
    username: 'john.smith',
    role: 'driver',
    phone: '123-456-7891',
    driverId: 'DRV001',
    ambulanceId: 'AMB001',
    licenseNumber: 'LIC001',
    status: 'available',
    currentLocation: 'Downtown Medical Center',
    photoUrl: 'https://randomuser.me/api/portraits/men/1.jpg'
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@swiftaid.com',
    username: 'sarah.johnson',
    role: 'driver',
    phone: '123-456-7892',
    driverId: 'DRV002',
    ambulanceId: 'AMB002',
    licenseNumber: 'LIC002',
    status: 'available',
    currentLocation: 'North District Hospital',
    photoUrl: 'https://randomuser.me/api/portraits/women/1.jpg'
  },
  {
    id: '4',
    name: 'Michael Brown',
    email: 'michael.brown@swiftaid.com',
    username: 'michael.brown',
    role: 'driver',
    phone: '123-456-7893',
    driverId: 'DRV003',
    ambulanceId: 'AMB003',
    licenseNumber: 'LIC003',
    status: 'busy',
    currentLocation: 'Central Hospital',
    currentJob: 'Transporting patient to hospital',
    photoUrl: 'https://randomuser.me/api/portraits/men/2.jpg'
  },
  {
    id: '5',
    name: 'Emily Davis',
    email: 'emily.davis@swiftaid.com',
    username: 'emily.davis',
    role: 'driver',
    phone: '123-456-7894',
    driverId: 'DRV004',
    ambulanceId: 'AMB004',
    licenseNumber: 'LIC004',
    status: 'offline',
    currentLocation: 'Off duty',
    photoUrl: 'https://randomuser.me/api/portraits/women/2.jpg'
  },
  {
    id: '6',
    name: 'David Wilson',
    email: 'david.wilson@swiftaid.com',
    username: 'david.wilson',
    role: 'driver',
    phone: '123-456-7895',
    driverId: 'DRV005',
    ambulanceId: 'AMB005',
    licenseNumber: 'LIC005',
    status: 'available',
    currentLocation: 'East Wing Medical Center',
    photoUrl: 'https://randomuser.me/api/portraits/men/3.jpg'
  },
  {
    id: '7',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@swiftaid.com',
    username: 'lisa.anderson',
    role: 'driver',
    phone: '123-456-7896',
    driverId: 'DRV006',
    ambulanceId: 'AMB006',
    licenseNumber: 'LIC006',
    status: 'available',
    currentLocation: 'South Community Hospital',
    photoUrl: 'https://randomuser.me/api/portraits/women/3.jpg'
  },
  {
    id: '8',
    name: 'James Taylor',
    email: 'james.taylor@swiftaid.com',
    username: 'james.taylor',
    role: 'driver',
    phone: '123-456-7897',
    driverId: 'DRV007',
    ambulanceId: 'AMB007',
    licenseNumber: 'LIC007',
    status: 'busy',
    currentLocation: 'Central Hospital',
    currentJob: 'Emergency response to traffic accident',
    photoUrl: 'https://randomuser.me/api/portraits/men/4.jpg'
  },
  {
    id: '9',
    name: 'Jennifer Martin',
    email: 'jennifer.martin@swiftaid.com',
    username: 'jennifer.martin',
    role: 'driver',
    phone: '123-456-7898',
    driverId: 'DRV008',
    ambulanceId: 'AMB008',
    licenseNumber: 'LIC008',
    status: 'available',
    currentLocation: 'Riverside Medical Center',
    photoUrl: 'https://randomuser.me/api/portraits/women/4.jpg'
  },
  {
    id: '10',
    name: 'Robert Thompson',
    email: 'robert.thompson@swiftaid.com',
    username: 'robert.thompson',
    role: 'driver',
    phone: '123-456-7899',
    driverId: 'DRV009',
    ambulanceId: 'AMB009',
    licenseNumber: 'LIC009',
    status: 'offline',
    currentLocation: 'Off duty',
    photoUrl: 'https://randomuser.me/api/portraits/men/5.jpg'
  },
  {
    id: '11',
    name: 'Jessica White',
    email: 'jessica.white@swiftaid.com',
    username: 'jessica.white',
    role: 'driver',
    phone: '123-456-7900',
    driverId: 'DRV010',
    ambulanceId: 'AMB010',
    licenseNumber: 'LIC010',
    status: 'available',
    currentLocation: 'West County Hospital',
    photoUrl: 'https://randomuser.me/api/portraits/women/5.jpg'
  },
  {
    id: '12',
    name: 'William Clark',
    email: 'william.clark@swiftaid.com',
    username: 'william.clark',
    role: 'driver',
    phone: '123-456-7901',
    driverId: 'DRV011',
    ambulanceId: 'AMB011',
    licenseNumber: 'LIC011',
    status: 'busy',
    currentLocation: 'Downtown Area',
    currentJob: 'Patient transfer to specialized facility',
    photoUrl: 'https://randomuser.me/api/portraits/men/6.jpg'
  },
  {
    id: '13',
    name: 'Elizabeth Lee',
    email: 'elizabeth.lee@swiftaid.com',
    username: 'elizabeth.lee',
    role: 'driver',
    phone: '123-456-7902',
    driverId: 'DRV012',
    ambulanceId: 'AMB012',
    licenseNumber: 'LIC012',
    status: 'available',
    currentLocation: 'North District Hospital',
    photoUrl: 'https://randomuser.me/api/portraits/women/6.jpg'
  },
  {
    id: '14',
    name: 'Christopher King',
    email: 'christopher.king@swiftaid.com',
    username: 'christopher.king',
    role: 'driver',
    phone: '123-456-7903',
    driverId: 'DRV013',
    ambulanceId: 'AMB013',
    licenseNumber: 'LIC013',
    status: 'offline',
    currentLocation: 'Off duty',
    photoUrl: 'https://randomuser.me/api/portraits/men/7.jpg'
  },
  {
    id: '15',
    name: 'Margaret Wright',
    email: 'margaret.wright@swiftaid.com',
    username: 'margaret.wright',
    role: 'driver',
    phone: '123-456-7904',
    driverId: 'DRV014',
    ambulanceId: 'AMB014',
    licenseNumber: 'LIC014',
    status: 'available',
    currentLocation: 'Central Hospital',
    photoUrl: 'https://randomuser.me/api/portraits/women/7.jpg'
  },
  {
    id: '16',
    name: 'Daniel Green',
    email: 'daniel.green@swiftaid.com',
    username: 'daniel.green',
    role: 'driver',
    phone: '123-456-7905',
    driverId: 'DRV015',
    ambulanceId: 'AMB015',
    licenseNumber: 'LIC015',
    status: 'busy',
    currentLocation: 'Highway Intersection',
    currentJob: 'Emergency medical response',
    photoUrl: 'https://randomuser.me/api/portraits/men/8.jpg'
  },
  {
    id: '17',
    name: 'Patricia Hall',
    email: 'patricia.hall@swiftaid.com',
    username: 'patricia.hall',
    role: 'driver',
    phone: '123-456-7906',
    driverId: 'DRV016',
    ambulanceId: 'AMB016',
    licenseNumber: 'LIC016',
    status: 'available',
    currentLocation: 'South Community Hospital',
    photoUrl: 'https://randomuser.me/api/portraits/women/8.jpg'
  },
  {
    id: '18',
    name: 'Joseph Adams',
    email: 'joseph.adams@swiftaid.com',
    username: 'joseph.adams',
    role: 'driver',
    phone: '123-456-7907',
    driverId: 'DRV017',
    ambulanceId: 'AMB017',
    licenseNumber: 'LIC017',
    status: 'offline',
    currentLocation: 'Off duty',
    photoUrl: 'https://randomuser.me/api/portraits/men/9.jpg'
  },
  {
    id: '19',
    name: 'Michelle Baker',
    email: 'michelle.baker@swiftaid.com',
    username: 'michelle.baker',
    role: 'driver',
    phone: '123-456-7908',
    driverId: 'DRV018',
    ambulanceId: 'AMB018',
    licenseNumber: 'LIC018',
    status: 'available',
    currentLocation: 'Riverside Medical Center',
    photoUrl: 'https://randomuser.me/api/portraits/women/9.jpg'
  },
  {
    id: '20',
    name: 'Kevin Nelson',
    email: 'kevin.nelson@swiftaid.com',
    username: 'kevin.nelson',
    role: 'driver',
    phone: '123-456-7909',
    driverId: 'DRV019',
    ambulanceId: 'AMB019',
    licenseNumber: 'LIC019',
    status: 'busy',
    currentLocation: 'Downtown Area',
    currentJob: 'Patient transfer to specialized facility',
    photoUrl: 'https://randomuser.me/api/portraits/men/10.jpg'
  },
  {
    id: '21',
    name: 'Laura Carter',
    email: 'laura.carter@swiftaid.com',
    username: 'laura.carter',
    role: 'driver',
    phone: '123-456-7910',
    driverId: 'DRV020',
    ambulanceId: 'AMB020',
    licenseNumber: 'LIC020',
    status: 'available',
    currentLocation: 'West County Hospital',
    photoUrl: 'https://randomuser.me/api/portraits/women/10.jpg'
  }
];

// Add passwords for the users
export const mockPasswords: Record<string, string> = {
  'admin': 'admin123',
  'john.smith': 'JohnSmith123',
  'sarah.johnson': 'SarahJohnson123',
  'michael.brown': 'MichaelBrown123',
  'emily.davis': 'EmilyDavis123',
  'david.wilson': 'DavidWilson123',
  'lisa.anderson': 'LisaAnderson123',
  'james.taylor': 'JamesTaylor123',
  'jennifer.martin': 'JenniferMartin123',
  'robert.thompson': 'RobertThompson123',
  'jessica.white': 'JessicaWhite123',
  'william.clark': 'WilliamClark123',
  'elizabeth.lee': 'ElizabethLee123',
  'christopher.king': 'ChristopherKing123',
  'margaret.wright': 'MargaretWright123',
  'daniel.green': 'DanielGreen123',
  'patricia.hall': 'PatriciaHall123',
  'joseph.adams': 'JosephAdams123',
  'michelle.baker': 'MichelleBaker123',
  'kevin.nelson': 'KevinNelson123',
  'laura.carter': 'LauraCarter123'
};

// Add backward compatibility for email-based login
realDriverProfiles.forEach(user => {
  if (user.email && user.username) {
    mockPasswords[user.email] = mockPasswords[user.username];
  }
});

// Load registered users from localStorage on app initialization
const loadRegisteredUsers = (): User[] => {
  const storedUsers = localStorage.getItem('swiftaid_registered_users');
  if (storedUsers) {
    return JSON.parse(storedUsers);
  }
  return [];
};

// Initialize registered users with the real profiles and any previously registered users
const initialRegisteredUsers = (): User[] => {
  const storedUsers = loadRegisteredUsers();
  
  // Check if we already initialized the real profiles
  const hasInitialized = localStorage.getItem('swiftaid_profiles_initialized');
  
  // Clear initialization flag to ensure profiles are always properly loaded
  localStorage.removeItem('swiftaid_profiles_initialized');
  
  // First time initialization or refresh of profiles
  const existingUsernames = new Set(storedUsers.map((user: User) => user.username));
  const existingEmails = new Set(storedUsers.map((user: User) => user.email));
  
  // Remove existing real profiles to avoid duplicates with different data
  const filteredUsers = storedUsers.filter((user: User) => 
    !realDriverProfiles.some(profile => 
      profile.username === user.username || profile.email === user.email
    )
  );
  
  // Add real profiles
  const combinedUsers = [...filteredUsers, ...realDriverProfiles];
  
  // Save to localStorage
  localStorage.setItem('swiftaid_registered_users', JSON.stringify(combinedUsers));
  localStorage.setItem('swiftaid_profiles_initialized', 'true');
  
  return combinedUsers;
};

// Initialize the registered users array
let registeredUsers = initialRegisteredUsers();

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

  const login = async (usernameOrEmail: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reload the latest registered users
      registeredUsers = JSON.parse(localStorage.getItem('swiftaid_registered_users') || '[]');
      
      console.log("Trying to login with:", usernameOrEmail);
      console.log("Available users:", registeredUsers.map(u => u.username || u.email));
      
      // Check if login is with username or email
      const user = registeredUsers.find(u => 
        (u.username === usernameOrEmail) || (u.email === usernameOrEmail)
      );
      
      console.log("Found user:", user);
      console.log("Password check:", user && (mockPasswords[user.username || ''] === password || mockPasswords[user.email || ''] === password));
      
      if (user && (mockPasswords[user.username || ''] === password || mockPasswords[user.email || ''] === password)) {
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
      
      // Also add to mock passwords
      mockPasswords[email] = password;
      mockPasswords[username] = password;
      
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
    localStorage.setItem('swiftaid_user', JSON.stringify(updatedUser));

    // Update user in registered users
    registeredUsers = JSON.parse(localStorage.getItem('swiftaid_registered_users') || '[]');
    const userIndex = registeredUsers.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      registeredUsers[userIndex] = updatedUser;
      localStorage.setItem('swiftaid_registered_users', JSON.stringify(registeredUsers));
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
    localStorage.setItem('swiftaid_user', JSON.stringify(updatedUser));

    // Update user in registered users
    registeredUsers = JSON.parse(localStorage.getItem('swiftaid_registered_users') || '[]');
    const userIndex = registeredUsers.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      registeredUsers[userIndex] = updatedUser;
      localStorage.setItem('swiftaid_registered_users', JSON.stringify(registeredUsers));
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
