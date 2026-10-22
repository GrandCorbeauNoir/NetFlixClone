import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { addFavorite, fetchWatchlist, removeFavorite } from '../lib/api.js'
import { supabase } from '../lib/supabase.js'

const AppContext = createContext(null)

// The session is persisted by supabase-js and re-verified on load, so a refresh recovers the user.
// Favorites live on the server and are mirrored here; signing out clears them locally without deleting server rows.
export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false) // false until the stored session has been checked
  const [favorites, setFavorites] = useState(() => new Set())
  const favRef = useRef(favorites)

  useEffect(() => { favRef.current = favorites }, [favorites])
  const loadFavorites = useCallback(() => {
    fetchWatchlist()
      .then((ids) => setFavorites(new Set(ids)))
      .catch(() => {})
  }, [])

  // Creates the auth user; the on_auth_user_created trigger adds the public.users profile row.
  const signUp = useCallback(async ({ name, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { name } },
    })
    if (error) throw error
    if (!data.session) throw new Error('Check your email to confirm your account.')
    setUser({ id: data.user.id, email: data.user.email, name })
    loadFavorites()
  }, [loadFavorites])

  // Sets the user from the auth user plus their public.users profile, then loads their favorites.
  const hydrate = useCallback(async (authUser) => {
    const { data: profile } = await supabase.from('users').select('name').eq('id', authUser.id).maybeSingle()
    setUser({ id: authUser.id, email: authUser.email, name: profile?.name })
    loadFavorites()
  }, [loadFavorites])

  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    await hydrate(data.user)
  }, [hydrate])

  // On load (including a browser refresh), confirm the stored session with the server and recover the user.
  useEffect(() => {
    let active = true
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data, error } = await supabase.auth.getUser()
        if (data?.user && active) await hydrate(data.user)
        else if (error && active) await supabase.auth.signOut({ scope: 'local' })
      }
      if (active) setReady(true)
    })()
    // Ends the session here when it is signed out elsewhere (another tab) or can no longer refresh.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') { setUser(null); setFavorites(new Set()) }
    })
    return () => { active = false; subscription.unsubscribe() }
  }, [hydrate])
  // signOut() revokes the session and removes the stored tokens; local state is cleared even if it fails.
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } finally {
      setUser(null)
      setFavorites(new Set())
    }
  }, [])

  const toggleFavorite = useCallback((key) => {
    const was = favRef.current.has(key)
    const set = (on) => setFavorites((prev) => {
      const next = new Set(prev)
      if (on) next.add(key)
      else next.delete(key)
      return next
    })
    set(!was)
    ;(was ? removeFavorite(key) : addFavorite(key)).catch(() => set(was))
  }, [])

  const value = useMemo(
    () => ({ user, ready, signUp, signIn, signOut, favorites, toggleFavorite }),
    [user, ready, signUp, signIn, signOut, favorites, toggleFavorite],
  )
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
