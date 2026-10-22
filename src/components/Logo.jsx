import { Link } from 'react-router-dom'
import './Logo.css'

export default function Logo({ to = '/', size = 'md' }) {
  return (
    <Link to={to} className={`logo logo--${size}`} aria-label="FleurDeLysFlix home">
      FleurDeLysFlix
    </Link>
  )
}
