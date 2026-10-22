import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import { useApp } from '../state/AppContext.jsx'
import { supabase } from '../lib/supabase.js'
import { dollarsToCents } from '../lib/validate.js'
import '../components/Button.css'
import './Donate.css'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
const PRESETS = [5, 10, 25, 50]
const CARD_STYLE = {
  style: {
    base: { color: '#f5f5f5', fontSize: '16px', '::placeholder': { color: '#8a8a8a' } },
    invalid: { color: '#ff6b6b' },
  },
}
const money = (cents) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: cents % 100 ? 2 : 0 })}`

function DonateForm() {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useApp()
  const [preset, setPreset] = useState(null)
  const [custom, setCustom] = useState('')
  const [amountError, setAmountError] = useState('')
  const [status, setStatus] = useState('idle') // idle | processing | success | declined | error
  const [message, setMessage] = useState('')
  const [donated, setDonated] = useState(0)

  const pickPreset = (d) => { setPreset(d); setCustom(''); setAmountError('') }
  const onCustom = (e) => { setCustom(e.target.value); setPreset(null); setAmountError('') }
  const reset = () => { setStatus('idle'); setMessage('') }
  const another = () => { reset(); setPreset(null); setCustom('') }

  const submit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements || status === 'processing') return
    const cents = preset ? preset * 100 : dollarsToCents(custom)
    if (!cents) {
      setAmountError('Choose an amount, or enter a custom amount from $0.01 to $10,000.')
      return
    }
    setStatus('processing')
    try {
      const { data, error } = await supabase.functions.invoke('process-donation', {
        body: { amount: cents, user_id: user.id },
      })
      if (error || !data?.client_secret) throw error || new Error('missing client_secret')
      const result = await stripe.confirmCardPayment(data.client_secret, {
        payment_method: { card: elements.getElement(CardElement) },
      })
      if (result.error) {
        const t = result.error.type
        // validation_error = incomplete card fields (number, expiry, CVC, ZIP); card_error = the bank declined.
        setMessage(t === 'validation_error'
          ? 'Your card details look incomplete. Check the card number, expiry, CVC and ZIP, then try again.'
          : t === 'card_error'
            ? 'Your card was not accepted. Check the details or try a different card.'
            : '')
        setStatus(t === 'card_error' || t === 'validation_error' ? 'declined' : 'error')
        return
      }
      setDonated(cents)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="donate__result" role="status">
        <h2 className="donate__title">Thank you!</h2>
        <p>Your {money(donated)} donation went through. It helps keep FleurDeLysFlix running.</p>
        <button type="button" className="btn" onClick={another}>Make another donation</button>
      </div>
    )
  }
  if (status === 'error') {
    return (
      <div className="donate__result" role="alert">
        <h2 className="donate__title">Something went wrong</h2>
        <p>We could not complete your donation. You have not been charged. Please try again.</p>
        <button type="button" className="btn" onClick={reset}>Retry</button>
      </div>
    )
  }

  const busy = status === 'processing'
  return (
    <form className="donate__form" onSubmit={submit} noValidate>
      <fieldset className="donate__amounts" disabled={busy}>
        <legend>Choose an amount</legend>
        <div className="donate__presets">
          {PRESETS.map((d) => (
            <button key={d} type="button" className="donate__preset" aria-pressed={preset === d} onClick={() => pickPreset(d)}>
              ${d}
            </button>
          ))}
        </div>
        <div className="donate__field">
          <label htmlFor="donate-custom">Custom amount (USD)</label>
          <input id="donate-custom" inputMode="decimal" placeholder="e.g. 15.50" value={custom} onChange={onCustom}
            aria-invalid={amountError ? 'true' : undefined} aria-describedby={amountError ? 'donate-amount-error' : undefined} />
        </div>
        {amountError && <p id="donate-amount-error" className="donate__error">{amountError}</p>}
      </fieldset>
      <div className="donate__field">
        <label>Card details</label>
        <div className="donate__card"><CardElement options={CARD_STYLE} onChange={reset} /></div>
      </div>
      {status === 'declined' && <p className="donate__error" role="alert">{message}</p>}
      <button type="submit" className="btn btn--lg btn--block" disabled={!stripe || busy}>
        {busy ? 'Processing...' : 'Donate'}
      </button>
    </form>
  )
}

export default function Donate() {
  return (
    <main className="donate">
      <div className="donate__card-wrap">
        <h1 className="donate__title">Buy us a coffee</h1>
        <p className="donate__lead">FleurDeLysFlix is a personal project. If you enjoy it, a small donation helps cover the hosting.</p>
        <Elements stripe={stripePromise}><DonateForm /></Elements>
      </div>
    </main>
  )
}
