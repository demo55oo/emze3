import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA56NUhZN9XL-SDvF-fCBfdPsiG5jGbt00",
  authDomain: "admin-panel-478bc.firebaseapp.com",
  projectId: "admin-panel-478bc",
  storageBucket: "admin-panel-478bc.appspot.com",
  messagingSenderId: "595567614388",
  appId: "1:595567614388:web:da52b7b05a5759322ffae1"
}

// Initialize Firebase
initializeApp(firebaseConfig)
export const db = getFirestore()
