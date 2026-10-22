import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Logo from './Logo.jsx'
import { useCatalog } from '../state/CatalogContext.jsx'
import { useApp } from '../state/AppContext.jsx'
import './NavBar.css'

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
  </svg>
)
const Chevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
)

function SearchBox({ initial, onDone }) {
  const navigate = useNavigate()
  const [value, setValue] = useState(initial)

  const onSubmit = (e) => {
    e.preventDefault()
    const q = value.trim()
    if (!q) return
    navigate(`/search?q=${encodeURIComponent(q)}`)
    onDone?.()
  }

  return (
    <form className="search" role="search" onSubmit={onSubmit}>
      <label htmlFor="nav-search" className="sr-only">Search titles</label>
      <input
        id="nav-search"
        type="search"
        placeholder="Titles, people, genres"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoComplete="off"
      />
      <button type="submit" className="search__btn" aria-label="Search">
        <SearchIcon />
      </button>
    </form>
  )
}

function CategoriesMenu({ onNavigate }) {
  const { genres: GENRES } = useCatalog()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const btnRef = useRef(null)
  const { pathname } = useLocation()
  const active = pathname.startsWith('/category/')

  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => {
      if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus() }
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="cats" ref={ref}>
      <button
        ref={btnRef}
        type="button"
        className={`nav__link cats__btn${active ? ' is-active' : ''}`}
        aria-expanded={open}
        aria-controls="cats-menu"
        onClick={() => setOpen((o) => !o)}
      >
        Categories <Chevron />
      </button>
      {open && (
        <ul id="cats-menu" className="cats__menu">
          {GENRES.map((g) => (
            <li key={g}>
              <NavLink
                to={`/category/${encodeURIComponent(g)}`}
                onClick={() => { setOpen(false); onNavigate?.() }}
              >
                {g}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function NavBar() {
  const { favorites } = useApp()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const [menuOpen, setMenuOpen] = useState(false)
  const close = () => setMenuOpen(false)
  const searchSeed = pathname === '/search' ? (params.get('q') ?? '') : ''

  const onSignOut = () => navigate('/signout')

  return (
    <header className="nav">
      <div className="nav__inner">
        <Logo />

        <button
          type="button"
          className="nav__toggle"
          aria-expanded={menuOpen}
          aria-controls="nav-panel"
          aria-label="Menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>

        <div id="nav-panel" className={`nav__panel${menuOpen ? ' is-open' : ''}`}>
          <nav className="nav__center" aria-label="Primary">
            <NavLink to="/browse" className="nav__link" onClick={close}>Home</NavLink>
            <NavLink to="/movies" className="nav__link" onClick={close}>Movies</NavLink>
            <NavLink to="/tv" className="nav__link" onClick={close}>TV Shows</NavLink>
            <NavLink to="/favorites" className="nav__link" onClick={close}>
              Favorites{favorites.size > 0 && <span className="nav__count" aria-label={`${favorites.size} saved`}>{favorites.size}</span>}
            </NavLink>
            <CategoriesMenu onNavigate={close} />
            <SearchBox key={searchSeed} initial={searchSeed} onDone={close} />
          </nav>
          <button type="button" className="nav__signout" onClick={onSignOut}>Sign out</button>
        </div>
      </div>
    </header>
  )
}
