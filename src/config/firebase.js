import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAnfPxZJzzVSqxPJd0EmrEA50HxIPikS3g",
  authDomain: "kettlebell-snatch-tracker.firebaseapp.com",
  projectId: "kettlebell-snatch-tracker",
  storageBucket: "kettlebell-snatch-tracker.firebasestorage.app",
  messagingSenderId: "62140669676",
  appId: "1:62140669676:web:8553c92a2101e7df6e4fc9",
  measurementId: "G-X4215YK5WC"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider()

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Debug: Log Firebase initialization
console.log('🔥 Firebase initialized successfully')

export default app