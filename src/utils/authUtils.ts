
import { User } from '../types/auth';
import { supabase } from '@/integrations/supabase/client';

// Function to get all users (for admin purposes)
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    
    // Map the database users to our app's User type with proper type casting
    const users: User[] = data.map(profile => ({
      id: profile.id,
      name: profile.name,
      email: profile.email || '',
      username: profile.username || '',
      // Cast string to allowed role types
      role: profile.role as 'requester' | 'driver' | 'admin',
      phone: profile.phone || '',
      driverId: profile.driver_id || '',
      ambulanceId: profile.ambulance_id || '',
      licenseNumber: profile.license_number || '',
      photoUrl: profile.photo_url || '',
      // Cast string to allowed status types
      status: profile.status as 'available' | 'busy' | 'offline',
      currentLocation: profile.current_location || '',
      currentJob: profile.current_job || ''
    }));
    
    return users;
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return [];
  }
};

// Mock data for development when no backend is available
export const getRegisteredUsers = (): User[] => {
  // Try to get from localStorage first
  const storedUsers = localStorage.getItem('swiftaid_registered_users');
  if (storedUsers) {
    try {
      const parsedUsers = JSON.parse(storedUsers);
      return parsedUsers.map((user: any) => ({
        ...user,
        // Ensure role is one of the allowed values
        role: user.role as 'requester' | 'driver' | 'admin',
        // Ensure status is one of the allowed values
        status: user.status as 'available' | 'busy' | 'offline'
      }));
    } catch (error) {
      console.error('Error parsing stored users:', error);
      return [];
    }
  }
  
  // If no users in localStorage, return an empty array
  return [];
};

// For development/demo purposes
export const saveRegisteredUser = (user: User): void => {
  const existingUsers = getRegisteredUsers();
  const updatedUsers = existingUsers.some(u => u.id === user.id)
    ? existingUsers.map(u => u.id === user.id ? { ...u, ...user } : u)
    : [...existingUsers, user];
  
  localStorage.setItem('swiftaid_registered_users', JSON.stringify(updatedUsers));
};
