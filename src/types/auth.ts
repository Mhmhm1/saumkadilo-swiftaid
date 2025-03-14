
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'requester' | 'driver' | 'admin';
  phone?: string;
  driver_id?: string;
  ambulance_id?: string;
  license_number?: string;
  photo_url?: string;
  status?: 'available' | 'busy' | 'offline';
  current_location?: string;
  current_job?: string;
  username?: string;
  sms_notifications?: boolean;
  last_active?: number; // timestamp of last activity
  created_at?: string;
  updated_at?: string;
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isDriver: boolean;
  isRequester: boolean;
  updateDriverStatus: (status: 'available' | 'busy' | 'offline', location?: string, job?: string) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  sendSmsNotification: (userId: string, message: string) => Promise<boolean>;
  toggleSmsNotifications: (enabled: boolean) => void;
  checkUserActivity: () => void;
}
