import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import { useApp } from '../state/AppContext.jsx'
import { isEmail } from '../lib/validate.js'
import '../components/Button.css'
import './Landing.css'
import './SignIn.css'

export default function SignIn() {
  const { user, ready, signUp, signIn } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState(location.state?.mode === 'create' ? 'create' : 'signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState(location.state?.email ?? '')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  if (!ready) return null
  if (user) return <Navigate to="/browse" replace />

  const creating = mode === 'create'

  const onSubmit = async (e) => {
    e.preventDefault()
    const next = {}
    if (creating && !name.trim()) next.name = 'Enter your name.'
    if (!isEmail(email)) next.email = 'Enter a valid email address, like name@example.com.'
    if (!password) next.password = creating ? 'Choose a password to create your membership.' : 'Enter your password.'
    else if (creating && password.length < 6) next.password = 'Use at least 6 characters.'
    setErrors(next)
    if (Object.keys(next).length) return
    setBusy(true)
    try {
      if (creating) await signUp({ name: name.trim(), email: email.trim(), password })
      else await signIn({ email: email.trim(), password })
    } catch (err) {
      setErrors({ form: err.message })
      setBusy(false)
      return
    }
    navigate(location.state?.from?.pathname ?? '/browse', { replace: true })
  }

  const clear = (field) => setErrors((prev) => ({ ...prev, [field]: undefined }))

  return (
    <div className="auth">
      <header className="auth__bar"><Logo size="lg" /></header>

      <main className="auth__main">
        <form className="auth__card" onSubmit={onSubmit} noValidate aria-labelledby="auth-h">
          <h1 id="auth-h" className="auth__title">{creating ? 'Create membership' : 'Sign in'}</h1>
          <p className="auth__hint">Enter your info to {creating ? 'create your membership' : 'sign in'}</p>

          {creating && (
            <div className="auth__field">
              <label htmlFor="auth-name">Name</label>
              <input
                id="auth-name" type="text" autoComplete="name" value={name}
                aria-invalid={errors.name ? 'true' : undefined}
                aria-describedby={errors.name ? 'auth-name-err' : undefined}
                onChange={(e) => { setName(e.target.value); clear('name') }}
              />
              {errors.name && <p id="auth-name-err" role="alert" className="field-error">{errors.name}</p>}
            </div>
          )}

          <div className="auth__field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email" type="email" autoComplete="email" value={email}
              aria-invalid={errors.email ? 'true' : undefined}
              aria-describedby={errors.email ? 'auth-email-err' : undefined}
              onChange={(e) => { setEmail(e.target.value); clear('email') }}
            />
            {errors.email && <p id="auth-email-err" role="alert" className="field-error">{errors.email}</p>}
          </div>

          <div className="auth__field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password" type="password" value={password}
              autoComplete={creating ? 'new-password' : 'current-password'}
              aria-invalid={errors.password ? 'true' : undefined}
              aria-describedby={errors.password ? 'auth-password-err' : undefined}
              onChange={(e) => { setPassword(e.target.value); clear('password') }}
            />
            {errors.password && <p id="auth-password-err" role="alert" className="field-error">{errors.password}</p>}
          </div>

          {errors.form && <p role="alert" className="field-error">{errors.form}</p>}
          <button type="submit" className="btn btn--lg btn--block" disabled={busy}>Continue</button>

          <p className="auth__switch">
            {creating ? 'Already a member?' : 'New to FleurDeLysFlix?'}{' '}
            <button type="button" className="auth__link" onClick={() => { setMode(creating ? 'signin' : 'create'); setErrors({}) }}>
              {creating ? 'Sign in' : 'Create a membership'}
            </button>
          </p>
          <p className="auth__back"><Link to="/">Back to home</Link></p>
        </form>
      </main>
    </div>
  )
}
