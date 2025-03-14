
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';
import { allUsers, allPasswords } from '@/data/mockUsers';

// Function to migrate mock users to Supabase
export const migrateUsersToSupabase = async () => {
  try {
    // Check if migration has already been performed
    const migrationFlag = localStorage.getItem('swiftaid_migration_completed');
    if (migrationFlag === 'true') {
      console.log('Migration already completed');
      return;
    }

    console.log('Starting migration of users to Supabase');
    
    // Get all mock users
    const usersToMigrate = [...allUsers];
    
    // Get any registered users from localStorage
    const storedUsers = localStorage.getItem('swiftaid_registered_users');
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      // Add users that aren't already in the allUsers array
      parsedUsers.forEach((user: User) => {
        if (!usersToMigrate.some(u => u.email === user.email || u.username === user.username)) {
          usersToMigrate.push(user);
        }
      });
    }
    
    // Get passwords
    const storedPasswords = localStorage.getItem('swiftaid_passwords');
    const passwords = storedPasswords ? JSON.parse(storedPasswords) : allPasswords;
    
    // Migrate each user
    for (const user of usersToMigrate) {
      // Find the password for this user
      const password = passwords[user.username || ''] || 
                      passwords[user.email || ''] || 
                      'password123';
      
      // Create user in Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password,
        options: {
          data: {
            name: user.name,
            role: user.role,
            username: user.username || user.email.split('@')[0]
          }
        }
      });
      
      if (authError) {
        console.error(`Error creating auth user ${user.email}:`, authError);
        continue;
      }
      
      // Update the user profile with additional information
      if (authData.user) {
        const { error: updateError } = await supabase
          .from('users')
          .update({
            phone: user.phone,
            driver_id: user.driverId,
            ambulance_id: user.ambulanceId,
            license_number: user.licenseNumber,
            photo_url: user.photoUrl,
            status: user.status || 'available',
            current_location: user.currentLocation,
            current_job: user.currentJob,
            sms_notifications: user.smsNotifications || false,
            last_active: user.lastActive || Date.now()
          })
          .eq('id', authData.user.id);
        
        if (updateError) {
          console.error(`Error updating user profile for ${user.email}:`, updateError);
        }
      }
    }
    
    // Mark migration as completed
    localStorage.setItem('swiftaid_migration_completed', 'true');
    console.log('Migration completed successfully');
    
  } catch (error) {
    console.error('Migration error:', error);
  }
};
