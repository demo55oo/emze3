import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCUFVeyWLKY772dOtJ1BSvX3PjennZXC3I',
  authDomain: 'rftb2022housemarketplace.firebaseapp.com',
  projectId: 'rftb2022housemarketplace',
  storageBucket: 'rftb2022housemarketplace.appspot.com',
  messagingSenderId: '24810529366',
  appId: '1:24810529366:web:87f56d77ecc94e2d2891f7',
}

// Initialize Firebase
initializeApp(firebaseConfig)

export const db = getFirestore()
export const auth = getAuth()
const storage = getStorage()

if (process.env.REACT_ENV !== 'production') {
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectAuthEmulator(auth, 'http://localhost:9099')
  connectStorageEmulator(storage, 'localhost', 9199)
}
