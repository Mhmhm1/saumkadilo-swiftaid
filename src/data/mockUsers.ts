
import { User } from '../types/auth';
import { adminUser } from './admins';
import { realDriverProfiles } from './drivers';
import { mockPasswords, generateEmailPasswords } from './passwords';

// Combine admin user with driver profiles
export const allUsers: User[] = [adminUser, ...realDriverProfiles];

// Export the individual data collections
export { adminUser } from './admins';
export { realDriverProfiles } from './drivers';
export { mockPasswords } from './passwords';

// Add backward compatibility for email-based login
const emailPasswords = generateEmailPasswords(allUsers);

// Merge username and email passwords
export const allPasswords = { ...mockPasswords, ...emailPasswords };
