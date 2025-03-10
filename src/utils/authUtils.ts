
import { User } from '../types/auth';
import { supabase } from '@/integrations/supabase/client';

// Create a driver profile in Supabase
export const createDriverProfile = async (driverData: Partial<User>) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        role: 'driver',
        driver_id: driverData.driverId,
        ambulance_id: driverData.ambulanceId,
        license_number: driverData.licenseNumber,
        status: 'available'
      })
      .eq('id', driverData.id);
    
    if (error) {
      console.error('Error creating driver profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error creating driver profile:', error);
    return null;
  }
};

// Update user in database
export const updateUserInStorage = async (user: User): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        name: user.name,
        username: user.username,
        role: user.role,
        phone: user.phone,
        driver_id: user.driverId,
        ambulance_id: user.ambulanceId,
        license_number: user.licenseNumber,
        photo_url: user.photoUrl,
        status: user.status,
        current_location: user.currentLocation,
        current_job: user.currentJob
      })
      .eq('id', user.id);
    
    if (error) {
      console.error('Error updating user in database:', error);
    }
  } catch (error) {
    console.error('Error updating user in database:', error);
  }
};

// Fetch all users with a specific role
export const fetchUsersByRole = async (role: 'admin' | 'driver' | 'requester'): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role);
    
    if (error) {
      console.error(`Error fetching ${role}s:`, error);
      return [];
    }
    
    // Map the database format to our User format
    return data.map(profile => ({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      username: profile.username,
      role: profile.role,
      phone: profile.phone,
      driverId: profile.driver_id,
      ambulanceId: profile.ambulance_id,
      licenseNumber: profile.license_number,
      photoUrl: profile.photo_url,
      status: profile.status,
      currentLocation: profile.current_location,
      currentJob: profile.current_job
    }));
  } catch (error) {
    console.error(`Error fetching ${role}s:`, error);
    return [];
  }
};
