import { useApp } from '../state/AppContext.jsx'
import { HeartIcon } from './Icons.jsx'
import './FavoriteButton.css'

export default function FavoriteButton({ title, className = '', children }) {
  const { favorites, toggleFavorite } = useApp()
  const on = favorites.has(title.key)
  return (
    <button
      type="button"
      className={`fav${on ? ' is-on' : ''} ${className}`}
      aria-pressed={on}
      aria-label={children ? undefined : `${on ? 'Remove' : 'Add'} ${title.title} ${on ? 'from' : 'to'} favorites`}
      onClick={() => toggleFavorite(title.key)}
    >
      <HeartIcon filled={on} />
      {children && <span>{on ? 'In favorites' : 'Add to favorites'}</span>}
    </button>
  )
}
