
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
  patientName?: string;
  patientAge?: string;
  patientGender?: string;
  emergencyType?: string;
  additionalInfo?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  timestamp: Date;
  assignedTo?: string;
  driverName?: string;
  driverPhone?: string;
  driverPhoto?: string;
  ambulanceId?: string;
  estimatedArrival?: Date;
  completedAt?: Date;
  notes?: string[];
  messages?: {
    id: string;
    sender: string;
    text: string;
    timestamp: Date;
  }[];
}

export interface Driver {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'offline';
  location?: {
    coordinates: {
      lat: number;
      lng: number;
    };
    address?: string;
  };
  currentAssignment?: string;
  completedAssignments: number;
  driverId?: string;
  ambulanceId?: string;
  licenseNumber?: string;
  photoUrl?: string;
  phone?: string;
}

// Sample emergency requests - start with an empty array
export const mockRequests: EmergencyRequest[] = [];

// Sample drivers - synchronize with the User data in AuthContext
export const mockDrivers: Driver[] = [
  {
    id: '2', // Matches User ID for the driver
    name: 'John Smith',
    status: 'available',
    location: {
      coordinates: {
        lat: 37.7735,
        lng: -122.4210
      },
      address: 'Downtown Medical Center'
    },
    completedAssignments: 45,
    driverId: 'DRV001',
    ambulanceId: 'AMB001',
    licenseNumber: 'LIC001',
    phone: '123-456-7891',
    photoUrl: 'https://randomuser.me/api/portraits/men/1.jpg'
  },
  {
    id: '3', // Matches User ID for the driver
    name: 'Sarah Johnson',
    status: 'available',
    location: {
      coordinates: {
        lat: 37.7790,
        lng: -122.4120
      },
      address: 'North District Hospital'
    },
    completedAssignments: 32,
    driverId: 'DRV002',
    ambulanceId: 'AMB002',
    licenseNumber: 'LIC002',
    phone: '123-456-7892',
    photoUrl: 'https://randomuser.me/api/portraits/women/1.jpg'
  }
];

// Add additional 18 drivers with real names to have a total of 20 (matching the auth context)
const additionalDrivers = [
  { id: '4', name: 'Michael Brown', photoUrl: 'https://randomuser.me/api/portraits/men/2.jpg' },
  { id: '5', name: 'Emily Davis', photoUrl: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { id: '6', name: 'David Wilson', photoUrl: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { id: '7', name: 'Lisa Anderson', photoUrl: 'https://randomuser.me/api/portraits/women/3.jpg' },
  { id: '8', name: 'James Taylor', photoUrl: 'https://randomuser.me/api/portraits/men/4.jpg' },
  { id: '9', name: 'Jennifer Martin', photoUrl: 'https://randomuser.me/api/portraits/women/4.jpg' },
  { id: '10', name: 'Robert Thompson', photoUrl: 'https://randomuser.me/api/portraits/men/5.jpg' },
  { id: '11', name: 'Jessica White', photoUrl: 'https://randomuser.me/api/portraits/women/5.jpg' },
  { id: '12', name: 'William Clark', photoUrl: 'https://randomuser.me/api/portraits/men/6.jpg' },
  { id: '13', name: 'Elizabeth Lee', photoUrl: 'https://randomuser.me/api/portraits/women/6.jpg' },
  { id: '14', name: 'Christopher King', photoUrl: 'https://randomuser.me/api/portraits/men/7.jpg' },
  { id: '15', name: 'Margaret Wright', photoUrl: 'https://randomuser.me/api/portraits/women/7.jpg' },
  { id: '16', name: 'Daniel Green', photoUrl: 'https://randomuser.me/api/portraits/men/8.jpg' },
  { id: '17', name: 'Patricia Hall', photoUrl: 'https://randomuser.me/api/portraits/women/8.jpg' },
  { id: '18', name: 'Joseph Adams', photoUrl: 'https://randomuser.me/api/portraits/men/9.jpg' },
  { id: '19', name: 'Michelle Baker', photoUrl: 'https://randomuser.me/api/portraits/women/9.jpg' },
  { id: '20', name: 'Kevin Nelson', photoUrl: 'https://randomuser.me/api/portraits/men/10.jpg' },
  { id: '21', name: 'Laura Carter', photoUrl: 'https://randomuser.me/api/portraits/women/10.jpg' }
];

for (let i = 0; i < additionalDrivers.length; i++) {
  const driver = additionalDrivers[i];
  mockDrivers.push({
    id: driver.id,
    name: driver.name,
    status: i % 3 === 0 ? 'busy' : (i % 4 === 0 ? 'offline' : 'available'),
    location: {
      coordinates: {
        lat: 37.7749 + (Math.random() * 0.02 - 0.01),
        lng: -122.4194 + (Math.random() * 0.02 - 0.01)
      },
      address: i % 4 === 0 ? 'Off duty' : 'Central Hospital'
    },
    currentAssignment: i % 3 === 0 ? `req_dummy_${i}` : undefined,
    completedAssignments: Math.floor(Math.random() * 50),
    driverId: `DRV0${(i+3) < 10 ? '0' + (i+3) : (i+3)}`,
    ambulanceId: `AMB0${(i+3) < 10 ? '0' + (i+3) : (i+3)}`,
    licenseNumber: `LIC0${(i+3) < 10 ? '0' + (i+3) : (i+3)}`,
    phone: `123-456-${7893 + i}`,
    photoUrl: driver.photoUrl
  });
}

// First aid tips for requesters
export const firstAidTips = [
  {
    type: 'general',
    tips: [
      'Stay calm and reassure the patient',
      'Ensure the scene is safe for you and the patient',
      'Do not move the patient unless in immediate danger',
      'Keep the patient warm and comfortable'
    ]
  },
  {
    type: 'accident',
    tips: [
      'Check for responsiveness by tapping and shouting',
      'Check for breathing and circulation',
      'Apply pressure to stop any bleeding',
      'Do not remove embedded objects from wounds',
      'Immobilize injured limbs if possible'
    ]
  },
  {
    type: 'breathing',
    tips: [
      'Keep the person upright to ease breathing',
      'Loosen any tight clothing around neck or chest',
      'Help them use their medication if they have it',
      'If they become unconscious, place in recovery position'
    ]
  },
  {
    type: 'unconscious',
    tips: [
      'Check for breathing and clear airways',
      'If breathing, place in recovery position (on their side)',
      'Monitor breathing until help arrives',
      'If not breathing, start CPR if trained to do so'
    ]
  },
  {
    type: 'childbirth',
    tips: [
      'Make the mother comfortable and ensure privacy',
      'Time contractions and look for signs of imminent delivery',
      'If delivery is progressing, have mother lie down with knees bent',
      'Support the baby\'s head as it emerges, never pull'
    ]
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
  patientName?: string,
  patientAge?: string,
  patientGender?: string,
  emergencyType?: string,
  additionalInfo?: string,
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
    patientName,
    patientAge,
    patientGender,
    emergencyType,
    additionalInfo,
    severity,
    status: 'pending',
    timestamp: new Date(),
    messages: []
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
    request.driverName = driver.name;
    request.driverPhone = driver.phone;
    request.driverPhoto = driver.photoUrl;
    request.ambulanceId = driver.ambulanceId;
    
    // Calculate estimated arrival (for demo purposes: 5-15 minutes from now)
    const randomMinutes = Math.floor(Math.random() * 10) + 5;
    request.estimatedArrival = new Date(Date.now() + 1000 * 60 * randomMinutes);
    
    // Update driver status
    driver.status = 'busy';
    driver.currentAssignment = requestId;
    
    // Initialize messages array if it doesn't exist
    if (!request.messages) {
      request.messages = [];
    }
    
    // Add system message about assignment
    request.messages.push({
      id: `msg_${Date.now().toString(36)}`,
      sender: 'system',
      text: `Ambulance ${driver.ambulanceId} has been assigned to your request. Driver ${driver.name} is on the way.`,
      timestamp: new Date()
    });
  }
};

// Mock function to add a message to a request
export const addMessageToRequest = (
  requestId: string,
  sender: string,
  text: string
): void => {
  const request = mockRequests.find(req => req.id === requestId);
  
  if (request) {
    if (!request.messages) {
      request.messages = [];
    }
    
    request.messages.push({
      id: `msg_${Date.now().toString(36)}`,
      sender,
      text,
      timestamp: new Date()
    });
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
      
      // Add system message
      if (!request.messages) {
        request.messages = [];
      }
      
      request.messages.push({
        id: `msg_${Date.now().toString(36)}`,
        sender: 'system',
        text: 'The ambulance has arrived at your location.',
        timestamp: new Date()
      });
    }
    
    if (status === 'completed') {
      request.completedAt = new Date();
      
      // Add system message
      if (!request.messages) {
        request.messages = [];
      }
      
      request.messages.push({
        id: `msg_${Date.now().toString(36)}`,
        sender: 'system',
        text: 'This emergency request has been completed.',
        timestamp: new Date()
      });
      
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

// Get first aid tips based on emergency type
export const getFirstAidTips = (emergencyType?: string) => {
  if (!emergencyType) return firstAidTips.find(t => t.type === 'general')?.tips || [];
  
  const specificTips = firstAidTips.find(t => t.type === emergencyType.toLowerCase())?.tips;
  return specificTips || firstAidTips.find(t => t.type === 'general')?.tips || [];
};
