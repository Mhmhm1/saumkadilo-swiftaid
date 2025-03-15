
import { toast } from "sonner";
import { User } from '../types/auth';
import { supabase } from "@/integrations/supabase/client";

// In a real-world scenario, this would connect to an SMS gateway API
// For demo purposes, we'll simulate the SMS sending and log to console
export const sendSms = async (phoneNumber: string, message: string): Promise<boolean> => {
  console.log(`Sending SMS to ${phoneNumber}: ${message}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate 90% success rate for demo purposes
  const success = Math.random() < 0.9;
  
  if (success) {
    console.log('SMS sent successfully');
    return true;
  } else {
    console.error('Failed to send SMS');
    return false;
  }
};

// Show a toast notification and also send SMS if the user has it enabled
export const sendNotification = async (
  userId: string,
  title: string, 
  message: string, 
  type: 'success' | 'error' | 'info' | 'warning' = 'info'
) => {
  // Show toast notification in the current browser
  toast[type](title, { description: message });
  
  // Also add the notification to Supabase so other devices can see it
  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type,
      read: false
    });
    
    console.log(`Notification stored in database for user ${userId}`);
  } catch (error) {
    console.error('Error storing notification:', error);
  }
  
  // Try to send SMS if the user has enabled it
  try {
    // Get the user's phone number and SMS preferences
    const { data: userData, error } = await supabase
      .from('profiles')
      .select('phone, sms_notifications')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) throw error;
    
    if (userData?.sms_notifications && userData?.phone) {
      await sendSms(userData.phone, `${title}: ${message}`);
    }
  } catch (error) {
    console.error('Error sending SMS notification:', error);
  }
};

// Check if a user is considered "offline" based on their last activity
export const isUserOffline = (user: User): boolean => {
  // If user has an explicit offline status
  if (user.status === 'offline') return true;
  
  // If user hasn't been active in the last 5 minutes (300000 ms)
  if (user.last_active) {
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds
    return Date.now() - user.last_active > inactiveThreshold;
  }
  
  // If no last_active timestamp exists, consider them online (benefit of the doubt)
  return false;
};

// Format a message for different notification types
export const formatNotificationMessage = (
  notificationType: 'emergency_request' | 'driver_assigned' | 'eta_update' | 'general',
  details: Record<string, any>
): string => {
  switch (notificationType) {
    case 'emergency_request':
      return `URGENT: New emergency request from ${details.requesterName} at ${details.location}. Please respond ASAP.`;
    
    case 'driver_assigned':
      return `Driver ${details.driverName} has been assigned to your emergency request. ETA: ${details.eta} minutes.`;
    
    case 'eta_update':
      return `Your ambulance ETA has been updated to ${details.eta} minutes.`;
    
    case 'general':
      return details.message || 'You have a new notification from SwiftAid.';
    
    default:
      return 'You have a new notification from SwiftAid.';
  }
};

// Get all users who should receive notifications based on filters
export const getNotificationRecipients = (
  users: User[],
  filters: {
    role?: 'requester' | 'driver' | 'admin',
    status?: 'available' | 'busy' | 'offline',
    excludeIds?: string[]
  }
): User[] => {
  return users.filter(user => {
    // Skip users without SMS notifications enabled or without a phone number
    if (!user.sms_notifications || !user.phone) return false;
    
    // Skip excluded users
    if (filters.excludeIds?.includes(user.id)) return false;
    
    // Filter by role if specified
    if (filters.role && user.role !== filters.role) return false;
    
    // Filter by status if specified
    if (filters.status && user.status !== filters.status) return false;
    
    return true;
  });
};

// Function to listen for real-time notifications
export const setupNotificationListener = (userId: string) => {
  // Setup Supabase realtime subscription for notifications
  const notificationChannel = supabase
    .channel('notifications-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        const notification = payload.new;
        // Show the notification as a toast
        toast[notification.type || 'info'](notification.title, {
          description: notification.message
        });
      }
    )
    .subscribe();

  return () => {
    // Cleanup function to remove channel subscription
    supabase.removeChannel(notificationChannel);
  };
};
