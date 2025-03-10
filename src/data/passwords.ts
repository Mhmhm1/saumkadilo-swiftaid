import { User } from '../types/auth';

// Mock password entries for our users
export const mockPasswords: { [key: string]: string } = {
  'admin': 'admin123',
  'kivinga.wambua': 'driver123',
  'elizabeth.kadzo': 'driver123',
  'cyrus.wambua': 'driver123',
  'dunson.mwandwa': 'driver123',
  'masha.ngovi': 'driver123',
  'godfrey.mambo': 'driver123',
  'firdaus.said': 'driver123',
  'saida.seif': 'driver123',
  'anna.stephen': 'driver123',
  'laura.achieng': 'driver123',
  'moses.muyoga': 'driver123',
  'obare.mercy': 'driver123',
  'salim.bizi': 'driver123',
  'reagan.mutua': 'driver123',
  'enly.masinde': 'driver123',
  'kenya.nassir': 'driver123',
  'said.swaleh': 'driver123',
  'tabitha.ndumi': 'driver123',
  'alice.matano': 'driver123',
  'mary.shirleen': 'driver123'
};

// Function to generate email-based login passwords
export const generateEmailPasswords = (users: User[]): { [key: string]: string } => {
  const emailPasswords: { [key: string]: string } = {};
  
  users.forEach(user => {
    if (user.email) {
      const username = user.username || user.email.split('@')[0];
      
      // Skip if we already have this username in mockPasswords
      if (!mockPasswords[username]) {
        emailPasswords[user.email] = mockPasswords[username] || 'password123';
      }
    }
  });
  
  return emailPasswords;
};

// Use sessionStorage for temporary session data, while keeping localStorage for persistent data
// This helps synchronize across tabs within the same browser while maintaining device independence
export const loadAndSyncPasswords = () => {
  // Default passwords from our predefined list
  let allSyncedPasswords = { ...mockPasswords };
  
  try {
    // Try to load from localStorage (persistent across browser sessions)
    const storedPasswords = localStorage.getItem('swiftaid_passwords');
    if (storedPasswords) {
      const parsedPasswords = JSON.parse(storedPasswords);
      allSyncedPasswords = { ...allSyncedPasswords, ...parsedPasswords };
    }
    
    // Always ensure localStorage has the latest combined passwords
    localStorage.setItem('swiftaid_passwords', JSON.stringify(allSyncedPasswords));
    
    // Use sessionStorage for the current session
    sessionStorage.setItem('swiftaid_current_passwords', JSON.stringify(allSyncedPasswords));
    
    return allSyncedPasswords;
  } catch (error) {
    console.error('Error processing passwords:', error);
    return mockPasswords; // Fallback to defaults if there's an error
  }
};

// New function to add a user's password and sync it
export const addUserPassword = (usernameOrEmail: string, password: string): void => {
  try {
    let storedPasswords = JSON.parse(localStorage.getItem('swiftaid_passwords') || '{}');
    storedPasswords = { ...storedPasswords, [usernameOrEmail]: password };
    localStorage.setItem('swiftaid_passwords', JSON.stringify(storedPasswords));
    
    // Update session storage too
    sessionStorage.setItem('swiftaid_current_passwords', JSON.stringify(storedPasswords));
    
    // Dispatch a custom event for other tabs to pick up
    const event = new CustomEvent('swiftaid_password_updated', { 
      detail: { timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  } catch (error) {
    console.error('Error adding user password:', error);
  }
};
