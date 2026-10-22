import { useCatalog } from '../state/CatalogContext.jsx'
import '../components/Button.css'
import '../pages/Results.css'

// Shown instead of page content while the catalog loads or fails. Returns null once ready.
export default function CatalogStatus({ as: Tag = 'main', className = 'results' }) {
  const { status, retry } = useCatalog()
  if (status === 'ready') return null
  return (
    <Tag className={className}>
      <div className="results__empty">
        {status === 'loading' ? (
          <p role="status">Loading titles…</p>
        ) : (
          <>
            <p role="alert">We couldn’t load the catalog.</p>
            <button type="button" className="btn" onClick={retry}>Try again</button>
          </>
        )}
      </div>
    </Tag>
  )
}
