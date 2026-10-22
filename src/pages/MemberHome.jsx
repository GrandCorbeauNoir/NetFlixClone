import { Link } from 'react-router-dom'
import { useCatalog } from '../state/CatalogContext.jsx'
import './MemberHome.css'

export default function MemberHome() {
  const { genres: GENRES } = useCatalog()
  return (
    <main className="mhome">
      <section className="mhome__welcome">
        <h1 className="mhome__title">
          Welcome to <span className="mhome__brand">FleurDeLysFlix</span>
        </h1>
        <p className="mhome__tag">Unlimited Movies &amp; TV Shows. Anytime. Anywhere.</p>
      </section>

      <section className="mhome__browse" aria-labelledby="browse-h">
        <h2 id="browse-h" className="mhome__sub">Pick a category</h2>
        <ul className="chips">
          {GENRES.map((g) => (
            <li key={g}>
              <Link className="chip" to={`/category/${encodeURIComponent(g)}`}>{g}</Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
