
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
