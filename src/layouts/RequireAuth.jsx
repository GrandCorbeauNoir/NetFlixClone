import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../state/AppContext.jsx'

export default function RequireAuth() {
  const { user, ready } = useApp()
  const location = useLocation()
  if (!ready) return null
  if (!user) return <Navigate to="/signin" replace state={{ from: location }} />
  return <Outlet />
}
