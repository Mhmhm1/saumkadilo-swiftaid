
// We no longer need to manage passwords manually as Supabase handles authentication
// This file is kept for legacy purposes but could be removed in the future

import { User } from '../types/auth';

// This function is kept for compatibility but will be phased out
export const generateEmailPasswords = (users: User[]): { [key: string]: string } => {
  console.warn('generateEmailPasswords is deprecated. Authentication is now handled by Supabase.');
  return {};
};

// This function is kept for compatibility but will be phased out
export const loadAndSyncPasswords = () => {
  console.warn('loadAndSyncPasswords is deprecated. Authentication is now handled by Supabase.');
  return {};
};

// This function is kept for compatibility but will be phased out
export const addUserPassword = (usernameOrEmail: string, password: string): void => {
  console.warn('addUserPassword is deprecated. Authentication is now handled by Supabase.');
};
