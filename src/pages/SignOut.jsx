import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '../state/AppContext.jsx'

// Lives outside the auth guard so clearing the session can't bounce to /signin.
export default function SignOut() {
  const { signOut } = useApp()
  const [done, setDone] = useState(false)
  useEffect(() => { signOut().finally(() => setDone(true)) }, [signOut])
  return done ? <Navigate to="/" replace /> : null
}
