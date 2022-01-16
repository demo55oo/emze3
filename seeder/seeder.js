import { readFile } from 'fs/promises'
import { db, auth } from '../src/firebase.config.js'
import { addDoc, collection, Timestamp } from 'firebase/firestore'
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'

const { listings } = JSON.parse(
  await readFile(new URL('./listings.json', import.meta.url))
)

// iterate over listings and create a doc in our listings collection
async function seed(userRef) {
  for (const listing of listings) {
    const docRef = await addDoc(collection(db, 'listings'), {
      ...listing,
      userRef, // overwrite the userRef with a real ref
      timestamp: new Timestamp(), // generate a timestamp
    })
    console.log(`Created listing: ${docRef.id}`)
  }
  console.log('completed seeding... exiting')
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
