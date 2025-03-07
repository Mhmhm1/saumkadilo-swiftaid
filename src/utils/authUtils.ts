
import { User } from '../types/auth';
import { realDriverProfiles, mockPasswords } from '../data/mockUsers';

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

// Validate user credentials
export const validateCredentials = (usernameOrEmail: string, password: string, users: User[]): User | null => {
  const user = users.find(u => 
    (u.username === usernameOrEmail) || (u.email === usernameOrEmail)
  );
  
  if (user && (mockPasswords[user.username || ''] === password || mockPasswords[user.email || ''] === password)) {
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
};
