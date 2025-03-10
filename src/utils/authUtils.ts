
import { User } from '../types/auth';
import { allUsers } from '../data/mockUsers';
import { loadAndSyncPasswords, addUserPassword } from '../data/passwords';

// Regular check interval for data synchronization (in milliseconds)
const SYNC_INTERVAL = 15000; // 15 seconds

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
    
    // Avoid re-initializing if we already have users
    if (storedUsers.length > 0) {
      // Just check if we have all the default drivers and admin
      const hasAdmin = storedUsers.some((user: User) => user.username === 'admin');
      const hasDriver = storedUsers.some((user: User) => user.username === 'kivinga.wambua');
      
      if (hasAdmin && hasDriver) {
        return storedUsers;
      }
    }
    
    // First time initialization or refresh of profiles
    const existingUsernames = new Set(storedUsers.map((user: User) => user.username));
    const existingEmails = new Set(storedUsers.map((user: User) => user.email));
    
    // Remove existing real profiles to avoid duplicates with different data
    const filteredUsers = storedUsers.filter((user: User) => 
      !allUsers.some(profile => 
        profile.username === user.username || profile.email === user.email
      )
    );
    
    // Add real profiles
    const combinedUsers = [...filteredUsers, ...allUsers];
    
    // Save to localStorage
    localStorage.setItem('swiftaid_registered_users', JSON.stringify(combinedUsers));
    
    // Initialize passwords in localStorage if not already done
    loadAndSyncPasswords();
    
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
  
  // Check combined passwords from localStorage
  const allPasswords = loadAndSyncPasswords();
  
  console.log(`Checking password for ${usernameOrEmail}`);
  console.log('Available credentials:', Object.keys(allPasswords));
  
  if (allPasswords[user.username || ''] === password || allPasswords[user.email || ''] === password) {
    return user;
  }
  
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
      
      // Trigger a custom event to notify of the change
      const event = new CustomEvent('swiftaid_data_updated', { 
        detail: { 
          type: 'user_updated',
          userId: user.id,
          timestamp: Date.now()
        } 
      });
      window.dispatchEvent(event);
    }
  } catch (error) {
    console.error('Error updating user in storage:', error);
  }
};

// Setup data synchronization across tabs/windows
export const setupDataSync = () => {
  // Listen for storage changes from other tabs/windows
  window.addEventListener('storage', (event) => {
    if (event.key === 'swiftaid_registered_users' || 
        event.key === 'swiftaid_passwords' ||
        event.key === 'swiftaid_emergency_requests' || 
        event.key === 'swiftaid_drivers') {
      console.log('Data synced from another tab/window:', event.key);
      
      // Reload specific data based on what changed
      if (event.key === 'swiftaid_emergency_requests' || event.key === 'swiftaid_drivers') {
        // Dispatch event for components to refresh their data
        const refreshEvent = new CustomEvent('swiftaid_refresh_data', {
          detail: { dataType: event.key.replace('swiftaid_', '') }
        });
        window.dispatchEvent(refreshEvent);
      }
    }
  });
  
  // Listen for custom events
  window.addEventListener('swiftaid_data_updated', (e: Event) => {
    const event = e as CustomEvent;
    console.log('Data updated event received:', event.detail);
  });
  
  window.addEventListener('swiftaid_password_updated', () => {
    console.log('Password data updated');
    loadAndSyncPasswords(); // Reload passwords when they change
  });
  
  // Setup periodic sync check
  setInterval(() => {
    // This ensures any changes made in other tabs are periodically checked
    try {
      // Load the latest registered users
      const latestUsers = loadRegisteredUsers();
      
      // Load the latest emergency requests
      const storedRequests = localStorage.getItem('swiftaid_emergency_requests');
      if (storedRequests) {
        // Just accessing it will trigger storage event listeners if needed
      }
      
      // Load the latest drivers
      const storedDrivers = localStorage.getItem('swiftaid_drivers');
      if (storedDrivers) {
        // Just accessing it will trigger storage event listeners if needed
      }
    } catch (error) {
      console.error('Error during sync check:', error);
    }
  }, SYNC_INTERVAL);
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
  
  // Update passwords using the dedicated function to ensure proper syncing
  addUserPassword(email, password);
  addUserPassword(username, password);
  
  return newUser;
};
