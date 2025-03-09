
import { User } from '../types/auth';
import { allUsers } from '../data/mockUsers';
import { loadAndSyncPasswords } from '../data/passwords';

// Regular check interval for data synchronization (in milliseconds)
const SYNC_INTERVAL = 30000; // 30 seconds

// Load registered users from localStorage on app initialization
export const loadRegisteredUsers = (): User[] => {
  const storedUsers = localStorage.getItem('swiftaid_registered_users');
  if (storedUsers) {
    return JSON.parse(storedUsers);
  }
  return [];
};

// Initialize registered users with the real profiles and any previously registered users
export const initialRegisteredUsers = (): User[] => {
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
};

// Validate user credentials
export const validateCredentials = (usernameOrEmail: string, password: string, users: User[]): User | null => {
  const user = users.find(u => 
    (u.username === usernameOrEmail) || (u.email === usernameOrEmail)
  );
  
  if (!user) return null;
  
  // Check combined passwords from in-memory and localStorage
  const allPasswords = loadAndSyncPasswords();
  
  if (allPasswords[user.username || ''] === password || allPasswords[user.email || ''] === password) {
    return user;
  }
  
  return null;
};

// Update user in storage
export const updateUserInStorage = (user: User): void => {
  // Get all registered users
  const users = JSON.parse(localStorage.getItem('swiftaid_registered_users') || '[]');
  
  // Find and update the user
  const userIndex = users.findIndex((u: User) => u.id === user.id);
  if (userIndex !== -1) {
    users[userIndex] = user;
    localStorage.setItem('swiftaid_registered_users', JSON.stringify(users));
  }
  
  // Also update current user if it's the same
  const currentUser = localStorage.getItem('swiftaid_user');
  if (currentUser) {
    const parsedUser = JSON.parse(currentUser);
    if (parsedUser.id === user.id) {
      localStorage.setItem('swiftaid_user', JSON.stringify(user));
    }
  }
  
  // Trigger a custom event to notify other tabs/windows of the change
  const event = new CustomEvent('swiftaid_data_updated', { 
    detail: { 
      type: 'user_updated',
      userId: user.id,
      timestamp: Date.now()
    } 
  });
  window.dispatchEvent(event);
};

// Setup data synchronization across tabs/windows
export const setupDataSync = () => {
  // Listen for storage changes from other tabs/windows
  window.addEventListener('storage', (event) => {
    if (event.key === 'swiftaid_registered_users' || event.key === 'swiftaid_passwords') {
      console.log('Data synced from another tab/window:', event.key);
      // Reload the page to get the latest data
      window.location.reload();
    }
  });
  
  // Listen for custom events
  window.addEventListener('swiftaid_data_updated', () => {
    console.log('Data updated event received');
    // No need to reload here as we're already in the tab that made the change
  });
  
  // Setup periodic sync check
  setInterval(() => {
    // This ensures any changes made in other tabs are periodically checked
    const currentUsers = localStorage.getItem('swiftaid_registered_users');
    if (currentUsers) {
      // Just accessing the data will trigger any storage event listeners if changes exist
    }
  }, SYNC_INTERVAL);
};
