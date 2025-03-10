
import { User } from '../types/auth';
import { adminUser } from './admins';
import { realDriverProfiles } from './drivers';
import { generateEmailPasswords } from './passwords';

// Combine admin user with driver profiles
export const allUsers: User[] = [adminUser, ...realDriverProfiles];

// Export the individual data collections
export { adminUser } from './admins';
export { realDriverProfiles } from './drivers';

// Add backward compatibility for email-based login
const emailPasswords = generateEmailPasswords(allUsers);

// Export only email passwords as we don't have mockPasswords anymore
export const allPasswords = { ...emailPasswords };
