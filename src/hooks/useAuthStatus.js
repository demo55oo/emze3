import { useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

// TODO: change to useAuth hook and return the Firebase authenticated user

export const useAuthStatus = () => {
  const [loggedIn, setLoggedIn] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)

  useEffect(() => {
    const auth = getAuth()
    // FIX: use the unsubscribe returned from onAuthStateChanged for cleanup
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedIn(true)
      }
      setCheckingStatus(false)
    })

    return unsubscribe
  }, [])

  return { loggedIn, checkingStatus }
}

// Protected routes in v6
// https://stackoverflow.com/questions/65505665/protected-route-with-firebase

// Fix memory leak warning
// https://stackoverflow.com/questions/59780268/cleanup-memory-leaks-on-an-unmounted-component-in-react-hooks
