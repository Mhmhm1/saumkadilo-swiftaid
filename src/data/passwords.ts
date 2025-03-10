
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

// Global password storage approach
export const loadAndSyncPasswords = () => {
  // Default passwords from our predefined list
  let allPasswords = { ...mockPasswords };
  
  try {
    // Try to load user passwords from localStorage
    const storedPasswords = localStorage.getItem('swiftaid_passwords');
    if (storedPasswords) {
      const parsedPasswords = JSON.parse(storedPasswords);
      // Merge with our default passwords, giving priority to stored passwords
      allPasswords = { ...allPasswords, ...parsedPasswords };
    }
    
    // Always update localStorage with the latest combined passwords
    localStorage.setItem('swiftaid_passwords', JSON.stringify(allPasswords));
    
    return allPasswords;
  } catch (error) {
    console.error('Error processing passwords:', error);
    return mockPasswords; // Fallback to defaults if there's an error
  }
};

// New function to add a user's password and sync it
export const addUserPassword = (usernameOrEmail: string, password: string): void => {
  try {
    // Load current passwords
    const allPasswords = loadAndSyncPasswords();
    
    // Add or update the password
    const updatedPasswords = { 
      ...allPasswords, 
      [usernameOrEmail]: password 
    };
    
    // Save back to localStorage
    localStorage.setItem('swiftaid_passwords', JSON.stringify(updatedPasswords));
    
    console.log(`Password saved for: ${usernameOrEmail}`);
  } catch (error) {
    console.error('Error adding user password:', error);
  }
};
