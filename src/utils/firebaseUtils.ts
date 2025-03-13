
import { doc, setDoc, getDoc, collection, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { User } from '../types/auth';
import { Driver, EmergencyRequest } from './mockData';
import { toast } from 'sonner';

// Collection names
const USERS_COLLECTION = 'users';
const REQUESTS_COLLECTION = 'emergencyRequests';
const DRIVERS_COLLECTION = 'drivers';

// Sync local data with Firebase
export const syncLocalToFirebase = async () => {
  try {
    // Get users from localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('swiftaid_registered_users') || '[]');
    // For each user, update or create in Firebase
    for (const user of registeredUsers) {
      const userRef = doc(db, USERS_COLLECTION, user.id);
      await setDoc(userRef, user, { merge: true });
    }

    // Get emergency requests from localStorage
    const requests = JSON.parse(localStorage.getItem('swiftaid_emergency_requests') || '[]');
    // For each request, update or create in Firebase
    for (const request of requests) {
      const requestRef = doc(db, REQUESTS_COLLECTION, request.id);
      await setDoc(requestRef, {
        ...request,
        timestamp: request.timestamp ? new Date(request.timestamp) : new Date(),
        estimatedArrival: request.estimatedArrival ? new Date(request.estimatedArrival) : null,
        completedAt: request.completedAt ? new Date(request.completedAt) : null,
        messages: request.messages ? request.messages.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
        })) : [],
        rating: request.rating ? {
          ...request.rating,
          timestamp: request.rating.timestamp ? new Date(request.rating.timestamp) : new Date()
        } : null
      }, { merge: true });
    }

    // Get drivers from localStorage
    const drivers = JSON.parse(localStorage.getItem('swiftaid_drivers') || '[]');
    // For each driver, update or create in Firebase
    for (const driver of drivers) {
      const driverRef = doc(db, DRIVERS_COLLECTION, driver.id);
      await setDoc(driverRef, driver, { merge: true });
    }

    console.log('Data synchronized with Firebase');
    return true;
  } catch (error) {
    console.error('Error syncing data with Firebase:', error);
    return false;
  }
};

// Sync Firebase data with local storage
export const syncFirebaseToLocal = async () => {
  try {
    // Get users from Firebase
    const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
    const users = usersSnapshot.docs.map(doc => doc.data());
    localStorage.setItem('swiftaid_registered_users', JSON.stringify(users));

    // Get emergency requests from Firebase
    const requestsSnapshot = await getDocs(collection(db, REQUESTS_COLLECTION));
    const requests = requestsSnapshot.docs.map(doc => doc.data());
    localStorage.setItem('swiftaid_emergency_requests', JSON.stringify(requests));

    // Get drivers from Firebase
    const driversSnapshot = await getDocs(collection(db, DRIVERS_COLLECTION));
    const drivers = driversSnapshot.docs.map(doc => doc.data());
    localStorage.setItem('swiftaid_drivers', JSON.stringify(drivers));

    console.log('Local data updated from Firebase');
    return true;
  } catch (error) {
    console.error('Error syncing data from Firebase:', error);
    return false;
  }
};

// Firebase authentication functions
export const firebaseRegister = async (email: string, password: string, userData: Partial<User>) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    
    // Save user data to Firestore
    const userRef = doc(db, USERS_COLLECTION, uid);
    await setDoc(userRef, { ...userData, id: uid, email });
    
    return { ...userData, id: uid, email } as User;
  } catch (error: any) {
    console.error('Firebase registration error:', error);
    throw new Error(error.message || 'Registration failed');
  }
};

export const firebaseLogin = async (email: string, password: string) => {
  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    
    // Get user data from Firestore
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as User;
    } else {
      throw new Error('User data not found');
    }
  } catch (error: any) {
    console.error('Firebase login error:', error);
    throw new Error(error.message || 'Login failed');
  }
};

export const firebaseLogout = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error('Firebase logout error:', error);
    return false;
  }
};

// Update user in Firebase
export const updateUserInFirebase = async (user: User) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, user.id);
    await updateDoc(userRef, { ...user });
    return true;
  } catch (error) {
    console.error('Error updating user in Firebase:', error);
    return false;
  }
};

// Update emergency request in Firebase
export const updateRequestInFirebase = async (request: EmergencyRequest) => {
  try {
    const requestRef = doc(db, REQUESTS_COLLECTION, request.id);
    await updateDoc(requestRef, { 
      ...request,
      timestamp: request.timestamp,
      estimatedArrival: request.estimatedArrival || null,
      completedAt: request.completedAt || null
    });
    return true;
  } catch (error) {
    console.error('Error updating request in Firebase:', error);
    return false;
  }
};

// Update driver in Firebase
export const updateDriverInFirebase = async (driver: Driver) => {
  try {
    const driverRef = doc(db, DRIVERS_COLLECTION, driver.id);
    await updateDoc(driverRef, { ...driver });
    return true;
  } catch (error) {
    console.error('Error updating driver in Firebase:', error);
    return false;
  }
};
