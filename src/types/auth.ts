
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'requester' | 'driver' | 'admin';
  phone?: string;
  driverId?: string;
  ambulanceId?: string;
  licenseNumber?: string;
  photoUrl?: string;
  status?: 'available' | 'busy' | 'offline';
  currentLocation?: string;
  currentJob?: string;
  username?: string;
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
  syncEnabled: boolean;
  toggleSync: () => Promise<void>;
}
