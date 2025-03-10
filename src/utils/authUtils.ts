
import { User } from '../types/auth';
import { supabase } from '@/integrations/supabase/client';

// Function to create a demo account
export const createDemoAccount = async (
  email: string,
  password: string,
  name: string,
  role: 'admin' | 'driver' | 'requester',
  additionalData?: Partial<User>
) => {
  try {
    // Check if the user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const userExists = existingUsers?.users.some(user => user.email === email);
    
    if (!userExists) {
      // Create the user in Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          role,
          ...additionalData
        }
      });
      
      if (error) {
        console.error('Error creating demo account:', error);
        return;
      }
      
      // The profile should be created automatically via the database trigger
      console.log(`Demo account created: ${email}`);
      return data.user;
    }
    
    console.log(`Demo account already exists: ${email}`);
  } catch (error) {
    console.error('Error creating demo account:', error);
  }
};

// Function to seed demo data
export const seedDemoData = async () => {
  // Create demo accounts
  await createDemoAccount(
    'admin@swiftaid.com',
    'admin123',
    'Admin User',
    'admin'
  );
  
  await createDemoAccount(
    'driver1@swiftaid.com',
    'driver123',
    'John Driver',
    'driver',
    {
      phone: '+25471234567',
      driverId: 'DR001',
      ambulanceId: 'AMB001',
      licenseNumber: 'L12345',
      status: 'available'
    }
  );
  
  await createDemoAccount(
    'driver2@swiftaid.com',
    'driver123',
    'Mary Driver',
    'driver',
    {
      phone: '+25472345678',
      driverId: 'DR002',
      ambulanceId: 'AMB002',
      licenseNumber: 'L23456',
      status: 'busy'
    }
  );
  
  await createDemoAccount(
    'user@swiftaid.com',
    'user123',
    'Regular User',
    'requester',
    {
      phone: '+25473456789'
    }
  );
};

// Get all users that match a specific role
export const getUsersByRole = async (role: 'admin' | 'driver' | 'requester'): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role);
    
    if (error) {
      console.error('Error fetching users by role:', error);
      return [];
    }
    
    // Convert database format to User type with proper type casting
    return data.map(profile => ({
      id: profile.id,
      name: profile.name,
      email: profile.email || '',
      username: profile.username || '',
      role: profile.role as 'requester' | 'driver' | 'admin',
      phone: profile.phone || '',
      driverId: profile.driver_id || '',
      ambulanceId: profile.ambulance_id || '',
      licenseNumber: profile.license_number || '',
      photoUrl: profile.photo_url || '',
      status: profile.status as 'available' | 'busy' | 'offline' || undefined,
      currentLocation: profile.current_location || '',
      currentJob: profile.current_job || ''
    }));
  } catch (error) {
    console.error('Error fetching users by role:', error);
    return [];
  }
};
