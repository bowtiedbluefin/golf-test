import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Check if Firebase environment variables are set
const hasFirebaseConfig = 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!hasFirebaseConfig) {
  console.warn(`
    ⚠️ Firebase configuration is missing! 
    Make sure you have a .env.local file with the following variables:
    - NEXT_PUBLIC_FIREBASE_API_KEY
    - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    - NEXT_PUBLIC_FIREBASE_PROJECT_ID
    - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
    - NEXT_PUBLIC_FIREBASE_APP_ID
    
    Using mock data for now.
  `);
}

// Provide default config for development if env vars are missing
const firebaseConfig = hasFirebaseConfig
  ? {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }
  : {
      // Fallback to a dummy Firebase project for development
      apiKey: "dummy-api-key",
      authDomain: "dummy-project.firebaseapp.com",
      projectId: "dummy-project-id",
      storageBucket: "dummy-project.appspot.com",
      messagingSenderId: "123456789012",
      appId: "1:123456789012:web:abcdef1234567890",
    };

// Initialize Firebase
let app;
let db;

try {
  // Check if any Firebase apps are already initialized
  const existingApps = getApps();
  
  if (existingApps.length === 0) {
    console.log('Initializing Firebase app with config:', {
      apiKey: firebaseConfig.apiKey ? '[HIDDEN]' : 'missing',
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
    });
    app = initializeApp(firebaseConfig);
  } else {
    console.log('Firebase app already initialized');
    app = existingApps[0];
  }
  
  // Initialize Firestore
  db = getFirestore(app);
  
  // Enable persistence for offline capability (optional)
  if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(db)
      .then(() => {
        console.log('Firestore persistence enabled');
      })
      .catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Firestore persistence failed: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
          console.warn('Firestore persistence not supported by browser');
        } else {
          console.error('Firestore persistence error:', err);
        }
      });
  }
  
  console.log('Firebase initialized successfully with project:', firebaseConfig.projectId);
} catch (error) {
  console.error('Error initializing Firebase:', error.message, error.stack);
  console.error('Firebase config used:', {
    ...firebaseConfig,
    apiKey: '[HIDDEN]'
  });
}

export { db, app }; 