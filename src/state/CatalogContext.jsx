import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchTitles } from '../lib/api.js'
import { useApp } from './AppContext.jsx'

const CatalogContext = createContext(null)

// The catalog needs a session (RLS), so it loads when a user signs in and is shared by every page.
export function CatalogProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', titles: [] })
  const [attempt, setAttempt] = useState(0)
  const userId = useApp().user?.id

  useEffect(() => {
    if (!userId) return undefined
    let cancelled = false
    fetchTitles()
      .then((titles) => { if (!cancelled) setState({ status: 'ready', titles }) })
      .catch(() => { if (!cancelled) setState({ status: 'error', titles: [] }) })
    return () => { cancelled = true }
  }, [attempt, userId])

  const retry = useCallback(() => {
    setState({ status: 'loading', titles: [] })
    setAttempt((n) => n + 1)
  }, [])

  const value = useMemo(() => ({
    status: userId ? state.status : 'loading',
    titles: userId ? state.titles : [],
    genres: [...new Set((userId ? state.titles : []).flatMap((t) => t.genres))].sort(),
    getTitle: (id) => state.titles.find((t) => t.key === id),
    retry,
  }), [state, retry, userId])

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCatalog() {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog must be used inside <CatalogProvider>')
  return ctx
}
