import { useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import TitleCard from '../components/TitleCard.jsx'
import Pagination from '../components/Pagination.jsx'
import CatalogStatus from '../components/CatalogStatus.jsx'
import { useCatalog } from '../state/CatalogContext.jsx'
import { filterTitles, paginate } from '../lib/catalog.js'
import { useApp } from '../state/AppContext.jsx'
import '../components/Button.css'
import './Results.css'

// mode: 'movies' | 'tv' | 'category' | 'search' | 'favorites'
export default function Results({ mode }) {
  const { favorites } = useApp()
  const { status, titles, genres: GENRES } = useCatalog()
  const { genre: rawGenre } = useParams()
  const [params] = useSearchParams()
  const genre = rawGenre ? decodeURIComponent(rawGenre) : undefined
  const query = params.get('q') ?? ''
  const requested = Number.parseInt(params.get('page') ?? '1', 10) || 1

  let heading = ''
  let list = []
  let empty = null

  if (mode === 'movies') {
    heading = 'Movies'
    list = filterTitles(titles, { type: 'movie' })
  } else if (mode === 'tv') {
    heading = 'TV Shows'
    list = filterTitles(titles, { type: 'series' })
  } else if (mode === 'category') {
    heading = genre
    list = GENRES.includes(genre) ? filterTitles(titles, { genre }) : []
    if (!GENRES.includes(genre)) empty = { text: `There's no category called "${genre}".`, cta: 'Pick a category from the menu above.' }
  } else if (mode === 'search') {
    heading = query.trim() ? `Results for “${query.trim()}”` : 'Search'
    list = query.trim() ? filterTitles(titles, { query }) : []
    empty = query.trim()
      ? { text: `No movies or TV shows match “${query.trim()}”.`, cta: 'Check the spelling or try a shorter keyword.' }
      : { text: 'Type a title or keyword in the search bar.' }
  } else if (mode === 'favorites') {
    heading = 'Favorites'
    list = filterTitles(titles, { ids: favorites })
    empty = { text: 'You haven’t saved any favorites yet.', cta: 'Browse movies', to: '/movies' }
  }

  const { items, page, pages } = paginate(list, requested)

  const hrefFor = (n) => {
    const next = new URLSearchParams(params)
    if (n === 1) next.delete('page')
    else next.set('page', String(n))
    const s = next.toString()
    return s ? `?${s}` : '?'
  }

  useEffect(() => { window.scrollTo(0, 0) }, [page, mode, genre, query])

  if (status !== 'ready') return <CatalogStatus />

  return (
    <main className="results">
      <header className="results__head">
        <h1 className="results__title">{heading}</h1>
        {list.length > 0 && (
          <p className="results__count" aria-live="polite">
            {list.length} {list.length === 1 ? 'title' : 'titles'}
            {pages > 1 && ` · page ${page} of ${pages}`}
          </p>
        )}
      </header>

      {list.length === 0 ? (
        <div className="results__empty">
          <p>{empty?.text ?? 'Nothing to show here.'}</p>
          {empty?.cta && (empty.to
            ? <Link className="btn" to={empty.to}>{empty.cta}</Link>
            : <p className="results__hint">{empty.cta}</p>)}
        </div>
      ) : (
        <>
          <ul className="grid">
            {items.map((t) => <TitleCard key={t.id} title={t} />)}
          </ul>
          <Pagination page={page} pages={pages} hrefFor={hrefFor} />
        </>
      )}
    </main>
  )
}
