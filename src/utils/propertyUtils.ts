
import { User } from '../types/auth';

/**
 * Utility functions to convert between snake_case and camelCase properties
 */

// Convert snake_case User object to one with camelCase getters for UI components
export const getCamelCaseProperties = (user: User | null) => {
  if (!user) return null;
  
  return {
    ...user,
    get driverId() { return user.driver_id; },
    get ambulanceId() { return user.ambulance_id; },
    get licenseNumber() { return user.license_number; },
    get photoUrl() { return user.photo_url; },
    get currentLocation() { return user.current_location; },
    get currentJob() { return user.current_job; },
    get smsNotifications() { return user.sms_notifications; },
    get lastActive() { return user.last_active; }
  };
};

// Convert camelCase properties to snake_case for database operations
export const convertToSnakeCase = (updates: {
  driverId?: string;
  ambulanceId?: string;
  licenseNumber?: string;
  photoUrl?: string;
  currentLocation?: string;
  currentJob?: string;
  smsNotifications?: boolean;
  lastActive?: number;
  [key: string]: any;
}) => {
  const result: Record<string, any> = { ...updates };
  
  if ('driverId' in updates) {
    result.driver_id = updates.driverId;
    delete result.driverId;
  }
  
  if ('ambulanceId' in updates) {
    result.ambulance_id = updates.ambulanceId;
    delete result.ambulanceId;
  }
  
  if ('licenseNumber' in updates) {
    result.license_number = updates.licenseNumber;
    delete result.licenseNumber;
  }
  
  if ('photoUrl' in updates) {
    result.photo_url = updates.photoUrl;
    delete result.photoUrl;
  }
  
  if ('currentLocation' in updates) {
    result.current_location = updates.currentLocation;
    delete result.currentLocation;
  }
  
  if ('currentJob' in updates) {
    result.current_job = updates.currentJob;
    delete result.currentJob;
  }
  
  if ('smsNotifications' in updates) {
    result.sms_notifications = updates.smsNotifications;
    delete result.smsNotifications;
  }
  
  if ('lastActive' in updates) {
    result.last_active = updates.lastActive;
    delete result.lastActive;
  }
  
  return result;
};
