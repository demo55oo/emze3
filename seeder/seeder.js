import { readFile } from 'fs/promises'
import { db, auth } from '../src/firebase.config.js'
import { addDoc, collection } from 'firebase/firestore'
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth'

const { listings } = JSON.parse(
  await readFile(new URL('./listings.json', import.meta.url))
)

// iterate over listings and create a doc in our listings collection
async function seed(userRef) {
  for (const listing of listings) {
    const docRef = await addDoc(collection(db, 'listings'), {
      ...listing,
      userRef,
    })
    console.log(`Created listing: ${docRef.id}`)
  }
  console.log('completed seeding... exiting')
  signOut()
  process.exit(1)
}

// NOTE: we first need to add a user in our Firebase console then sign them in
// with email and password
signInWithEmailAndPassword(auth, 'admin@marketplace.com', 'admin123').then(
  ({ user: { uid } }) => {
    console.log('logged in user ', uid)
    onAuthStateChanged(auth, (user) => {
      if (user) {
        seed(user.uid)
      } else {
        process.exit(1)
      }
    })
  }
)
