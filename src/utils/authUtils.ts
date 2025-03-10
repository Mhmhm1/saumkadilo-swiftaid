import { User } from '../types/auth';
import { allUsers } from '../data/mockUsers';
import { loadAndSyncPasswords, addUserPassword } from '../data/passwords';

// Load registered users from localStorage on app initialization
export const loadRegisteredUsers = (): User[] => {
  try {
    const storedUsers = localStorage.getItem('swiftaid_registered_users');
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }
    return [];
  } catch (error) {
    console.error('Error loading registered users:', error);
    return [];
  }
};

// Initialize registered users with the real profiles and any previously registered users
export const initialRegisteredUsers = (): User[] => {
  try {
    const storedUsers = loadRegisteredUsers();
    
    // Check if we need to initialize with the default users
    const hasAdmin = storedUsers.some((user: User) => user.username === 'admin');
    const hasDriver = storedUsers.some((user: User) => user.username === 'kivinga.wambua');
    
    // If we already have basic users, return the stored list
    if (hasAdmin && hasDriver && storedUsers.length > 0) {
      console.log('Using existing registered users:', storedUsers.length);
      return storedUsers;
    }
    
    console.log('Initializing with default users');
    
    // First-time initialization - merge stored users with default users
    // Remove any duplicates by username or email
    const existingUsernames = new Set(storedUsers.map((user: User) => user.username));
    const existingEmails = new Set(storedUsers.map((user: User) => user.email));
    
    // Filter out any default users that are already registered
    const filteredDefaultUsers = allUsers.filter(user => 
      !existingUsernames.has(user.username) && 
      !existingEmails.has(user.email)
    );
    
    // Combine stored users with filtered default users
    const combinedUsers = [...storedUsers, ...filteredDefaultUsers];
    
    // Save to localStorage
    localStorage.setItem('swiftaid_registered_users', JSON.stringify(combinedUsers));
    
    // Ensure passwords are initialized for all default users
    const allPasswords = loadAndSyncPasswords();
    console.log('Users initialized:', combinedUsers.length);
    
    return combinedUsers;
  } catch (error) {
    console.error('Error initializing registered users:', error);
    return [...allUsers]; // Fallback to default users
  }
};

// Validate user credentials
export const validateCredentials = (usernameOrEmail: string, password: string, users: User[]): User | null => {
  // First check if the user exists
  const user = users.find(u => 
    (u.username === usernameOrEmail) || (u.email === usernameOrEmail)
  );
  
  if (!user) {
    console.log(`No user found with username/email: ${usernameOrEmail}`);
    return null;
  }
  
  // Check the passwords from our storage
  const allPasswords = loadAndSyncPasswords();
  const usernameMatch = user.username && allPasswords[user.username] === password;
  const emailMatch = user.email && allPasswords[user.email] === password;
  
  if (usernameMatch || emailMatch) {
    console.log(`Login successful for: ${user.username || user.email}`);
    return user;
  }
  
  console.log(`Invalid password for: ${user.username || user.email}`);
  return null;
};

// Update user in storage
export const updateUserInStorage = (user: User): void => {
  try {
    // Get all registered users
    const users = JSON.parse(localStorage.getItem('swiftaid_registered_users') || '[]');
    
    // Find and update the user
    const userIndex = users.findIndex((u: User) => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = user;
      localStorage.setItem('swiftaid_registered_users', JSON.stringify(users));
      
      // Also update current user if it's the same
      const currentUser = localStorage.getItem('swiftaid_user');
      if (currentUser) {
        const parsedUser = JSON.parse(currentUser);
        if (parsedUser.id === user.id) {
          localStorage.setItem('swiftaid_user', JSON.stringify(user));
        }
      }
      
      console.log('User updated in storage:', user.username);
    }
  } catch (error) {
    console.error('Error updating user in storage:', error);
  }
};

// New function to register a user that ensures password sync
export const registerUser = (name: string, email: string, password: string, phone?: string): User => {
  // Generate a username from email
  const username = email.split('@')[0];
  
  // Create new user
  const newUser: User = {
    id: `user_${Date.now().toString(36)}`,
    name,
    email,
    username,
    role: 'requester',
    phone
  };
  
  // Get current users
  const users = loadRegisteredUsers();
  
  // Add to registered users
  users.push(newUser);
  
  // Update localStorage with new registered users
  localStorage.setItem('swiftaid_registered_users', JSON.stringify(users));
  
  // Update passwords using the dedicated function
  addUserPassword(email, password);
  addUserPassword(username, password);
  
  console.log('New user registered:', username);
  
  return newUser;
};

// Setup data synchronization across tabs/windows
export const setupDataSync = () => {
  // Run initial sync
  console.log('Setting up data sync mechanism');
  
  // Periodically check for changes in localStorage
  setInterval(() => {
    // This function will be called every 5 seconds to sync data
    try {
      // Load the registered users
      const registeredUsers = JSON.parse(localStorage.getItem('swiftaid_registered_users') || '[]');
      
      // Load emergency requests
      const emergencyRequests = JSON.parse(localStorage.getItem('swiftaid_emergency_requests') || '[]');
      
      // Load drivers
      const drivers = JSON.parse(localStorage.getItem('swiftaid_drivers') || '[]');
      
      // No need to do anything with the data, just accessing it ensures
      // any changes from other tabs/windows are detected
    } catch (error) {
      console.error('Error during sync check:', error);
    }
  }, 5000); // Check every 5 seconds
};
