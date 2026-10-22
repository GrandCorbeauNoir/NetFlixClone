import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import Poster from '../components/Poster.jsx'
import { useCatalog } from '../state/CatalogContext.jsx'
import { useApp } from '../state/AppContext.jsx'
import { isEmail } from '../lib/validate.js'
import '../components/Button.css'
import './Landing.css'

const COLLAGE_SIZE = 36

export default function Landing() {
  const { user } = useApp()
  const COLLAGE = useCatalog().titles.slice(0, COLLAGE_SIZE)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  if (user) return <Navigate to="/browse" replace />

  const onSubmit = (e) => {
    e.preventDefault()
    if (!isEmail(email)) {
      setError('Enter a valid email address, like name@example.com.')
      return
    }
    navigate('/signin', { state: { email: email.trim(), mode: 'create' } })
  }

  return (
    <div className="landing">
      <div className="landing__collage" aria-hidden="true">
        {COLLAGE.map((t) => <Poster key={t.id} title={t} />)}
      </div>
      <div className="landing__scrim" aria-hidden="true" />

      <header className="landing__bar">
        <Logo size="lg" />
        <Link to="/signin" className="btn">Sign In</Link>
      </header>

      <main className="landing__hero">
        <h1 className="landing__title">
          <span className="landing__brand">FleurDeLysFlix</span>
          <span className="landing__tag">Unlimited Movies &amp; TV Shows.</span>
          <span className="landing__tag">Anytime. Anywhere.</span>
        </h1>

        <section className="offer" aria-labelledby="offer-h">
          <h2 id="offer-h" className="offer__title">Become a member today</h2>
          <p className="offer__copy">Enter your email to create your membership.</p>
          <form className="offer__form" onSubmit={onSubmit} noValidate>
            <div className="offer__field">
              <label htmlFor="offer-email" className="sr-only">Email address</label>
              <input
                id="offer-email"
                type="email"
                autoComplete="email"
                placeholder="Email address"
                value={email}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error ? 'offer-err' : undefined}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
              />
              {error && <p id="offer-err" role="alert" className="field-error">{error}</p>}
            </div>
            <button type="submit" className="btn btn--lg">Create membership</button>
          </form>
        </section>
      </main>
    </div>
  )
}
