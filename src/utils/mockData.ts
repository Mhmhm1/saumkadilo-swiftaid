
import { User } from '../context/AuthContext';

export interface EmergencyRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone?: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    }
  };
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  timestamp: Date;
  assignedTo?: string;
  estimatedArrival?: Date;
  completedAt?: Date;
  notes?: string[];
}

export interface Driver {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'offline';
  location?: {
    coordinates: {
      lat: number;
      lng: number;
    }
  };
  currentAssignment?: string;
  completedAssignments: number;
}

// Sample emergency requests
export const mockRequests: EmergencyRequest[] = [
  {
    id: 'req_001',
    userId: 'user_123',
    userName: 'John Doe',
    userPhone: '555-123-4567',
    location: {
      address: '123 Main St, Downtown',
      coordinates: {
        lat: 37.7749,
        lng: -122.4194
      }
    },
    description: 'Car accident with multiple injuries. Two vehicles involved, one person unconscious.',
    severity: 'critical',
    status: 'pending',
    timestamp: new Date(Date.now() - 1000 * 60 * 15) // 15 minutes ago
  },
  {
    id: 'req_002',
    userId: 'user_124',
    userName: 'Jane Smith',
    userPhone: '555-987-6543',
    location: {
      address: '456 Oak Ave, Westside',
      coordinates: {
        lat: 37.7735,
        lng: -122.4168
      }
    },
    description: 'Elderly person having difficulty breathing, possible COVID symptoms.',
    severity: 'high',
    status: 'assigned',
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    assignedTo: '2',
    estimatedArrival: new Date(Date.now() + 1000 * 60 * 10) // 10 minutes from now
  },
  {
    id: 'req_003',
    userId: 'user_125',
    userName: 'Robert Johnson',
    userPhone: '555-345-6789',
    location: {
      address: '789 Pine St, Eastside',
      coordinates: {
        lat: 37.7801,
        lng: -122.4100
      }
    },
    description: 'Child with high fever and seizures.',
    severity: 'high',
    status: 'in-progress',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    assignedTo: '3',
    estimatedArrival: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago (already arrived)
  },
  {
    id: 'req_004',
    userId: 'user_126',
    userName: 'Sarah Williams',
    userPhone: '555-890-1234',
    location: {
      address: '101 Cedar Blvd, Northside',
      coordinates: {
        lat: 37.7850,
        lng: -122.4200
      }
    },
    description: 'Possible broken arm from sports injury. No bleeding but severe pain.',
    severity: 'medium',
    status: 'completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    assignedTo: '2',
    estimatedArrival: new Date(Date.now() - 1000 * 60 * 95), // arrived 95 minutes ago
    completedAt: new Date(Date.now() - 1000 * 60 * 60) // completed 1 hour ago
  },
  {
    id: 'req_005',
    userId: 'user_127',
    userName: 'Michael Brown',
    userPhone: '555-567-8901',
    location: {
      address: '222 Maple Dr, Southside',
      coordinates: {
        lat: 37.7700,
        lng: -122.4180
      }
    },
    description: 'Allergic reaction, swelling in face and throat, difficulty swallowing.',
    severity: 'high',
    status: 'pending',
    timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
  }
];

// Sample drivers
export const mockDrivers: Driver[] = [
  {
    id: '2', // Matches User ID for the driver
    name: 'Driver One',
    status: 'busy',
    location: {
      coordinates: {
        lat: 37.7735,
        lng: -122.4210
      }
    },
    currentAssignment: 'req_002',
    completedAssignments: 45
  },
  {
    id: '3', // Matches User ID for the driver
    name: 'Driver Two',
    status: 'busy',
    location: {
      coordinates: {
        lat: 37.7790,
        lng: -122.4120
      }
    },
    currentAssignment: 'req_003',
    completedAssignments: 32
  }
];

// AI severity analysis data (for demo)
export const severityAnalysis = {
  factors: [
    { name: 'Age Group', value: 'Elderly', impact: 'high' },
    { name: 'Consciousness', value: 'Unconscious', impact: 'critical' },
    { name: 'Breathing', value: 'Difficulty', impact: 'high' },
    { name: 'Bleeding', value: 'Moderate', impact: 'medium' },
    { name: 'Pain Level', value: 'Severe', impact: 'high' }
  ],
  recommendations: [
    'Prioritize based on breathing difficulty',
    'Consider rapid response for chest pain cases',
    'Assign nearest available ambulance'
  ]
};

// Mock function to add a new emergency request
export const addEmergencyRequest = (
  userId: string, 
  userName: string, 
  location: { address: string; coordinates: { lat: number; lng: number } },
  description: string,
  userPhone?: string
): EmergencyRequest => {
  // Analyze severity based on keywords in description (simplified AI simulation)
  let severity: 'critical' | 'high' | 'medium' | 'low' = 'medium';
  
  const criticalKeywords = ['unconscious', 'not breathing', 'severe bleeding', 'heart attack', 'stroke', 'drowning'];
  const highKeywords = ['breathing difficulty', 'chest pain', 'broken', 'fracture', 'allergic', 'seizure'];
  const lowKeywords = ['minor', 'small cut', 'sprain', 'fever', 'headache'];
  
  const descLower = description.toLowerCase();
  
  if (criticalKeywords.some(keyword => descLower.includes(keyword))) {
    severity = 'critical';
  } else if (highKeywords.some(keyword => descLower.includes(keyword))) {
    severity = 'high';
  } else if (lowKeywords.some(keyword => descLower.includes(keyword))) {
    severity = 'low';
  }
  
  const newRequest: EmergencyRequest = {
    id: `req_${Date.now().toString(36)}`,
    userId,
    userName,
    userPhone,
    location,
    description,
    severity,
    status: 'pending',
    timestamp: new Date()
  };
  
  // Add to mock data
  mockRequests.unshift(newRequest);
  
  return newRequest;
};

// Mock function to assign a driver
export const assignDriver = (requestId: string, driverId: string): void => {
  const request = mockRequests.find(req => req.id === requestId);
  const driver = mockDrivers.find(d => d.id === driverId);
  
  if (request && driver) {
    request.status = 'assigned';
    request.assignedTo = driverId;
    
    // Calculate estimated arrival (for demo purposes: 5-15 minutes from now)
    const randomMinutes = Math.floor(Math.random() * 10) + 5;
    request.estimatedArrival = new Date(Date.now() + 1000 * 60 * randomMinutes);
    
    // Update driver status
    driver.status = 'busy';
    driver.currentAssignment = requestId;
  }
};

// Mock function to update request status
export const updateRequestStatus = (
  requestId: string, 
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled',
  note?: string
): void => {
  const request = mockRequests.find(req => req.id === requestId);
  
  if (request) {
    request.status = status;
    
    if (status === 'in-progress') {
      // Ambulance has arrived
      request.estimatedArrival = new Date();
    }
    
    if (status === 'completed') {
      request.completedAt = new Date();
      
      // Free up the driver
      if (request.assignedTo) {
        const driver = mockDrivers.find(d => d.id === request.assignedTo);
        if (driver) {
          driver.status = 'available';
          driver.currentAssignment = undefined;
          driver.completedAssignments += 1;
        }
      }
    }
    
    if (note) {
      if (!request.notes) {
        request.notes = [];
      }
      request.notes.push(note);
    }
  }
};
