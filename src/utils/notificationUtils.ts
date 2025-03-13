
import { toast } from "sonner";
import { User } from '../types/auth';

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

// Check if a user is considered "offline" based on their last activity
export const isUserOffline = (user: User): boolean => {
  // If user has an explicit offline status
  if (user.status === 'offline') return true;
  
  // If user hasn't been active in the last 5 minutes (300000 ms)
  if (user.lastActive) {
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds
    return Date.now() - user.lastActive > inactiveThreshold;
  }
  
  // If no lastActive timestamp exists, consider them online (benefit of the doubt)
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
    if (!user.smsNotifications || !user.phone) return false;
    
    // Skip excluded users
    if (filters.excludeIds?.includes(user.id)) return false;
    
    // Filter by role if specified
    if (filters.role && user.role !== filters.role) return false;
    
    // Filter by status if specified
    if (filters.status && user.status !== filters.status) return false;
    
    return true;
  });
};
