import { Link } from 'react-router-dom'
import './Pagination.css'

function pageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const set = new Set([1, total, current, current - 1, current + 1])
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b)
  const out = []
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1] > 1) out.push('…')
    out.push(n)
  })
  return out
}

// `hrefFor(n)` returns the link target for page n.
export default function Pagination({ page, pages, hrefFor }) {
  if (pages <= 1) return null
  return (
    <nav className="pager" aria-label="Pagination">
      {page > 1
        ? <Link className="pager__item" to={hrefFor(page - 1)} aria-label="Previous page">‹</Link>
        : <span className="pager__item is-disabled" aria-hidden="true">‹</span>}
      {pageList(page, pages).map((n, i) =>
        n === '…'
          ? <span key={`gap${i}`} className="pager__gap" aria-hidden="true">…</span>
          : (
            <Link
              key={n}
              className={`pager__item${n === page ? ' is-current' : ''}`}
              to={hrefFor(n)}
              aria-label={`Page ${n}`}
              aria-current={n === page ? 'page' : undefined}
            >
              {n}
            </Link>
          ))}
      {page < pages
        ? <Link className="pager__item" to={hrefFor(page + 1)} aria-label="Next page">›</Link>
        : <span className="pager__item is-disabled" aria-hidden="true">›</span>}
    </nav>
  )
}
