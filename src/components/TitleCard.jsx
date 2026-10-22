import Poster from './Poster.jsx'
import FavoriteButton from './FavoriteButton.jsx'
import { useTitleModal } from './TitleModal.jsx'
import './TitleCard.css'

const shortOf = (text) => text.split(/(?<=\.)\s/)[0]

// The button holds only the title so its accessible name matches its visible
// text; its ::after stretches over the whole card to keep the card clickable.
export default function TitleCard({ title }) {
  const { open } = useTitleModal()
  const metaId = `tcard-meta-${title.key}`
  const kind = title.type === 'movie' ? 'Movie' : 'TV Show'
  return (
    <li className="tcard">
      <Poster title={title} className="tcard__poster" />
      <div className="tcard__meta">
        <button type="button" className="tcard__btn" aria-describedby={metaId} onClick={() => open(title)}>
          {title.title}
        </button>
        <span id={metaId} className="tcard__sub">{kind} · {title.year} · {title.genres.join(', ')}</span>
        <span className="tcard__desc">{shortOf(title.description)}</span>
      </div>
      <FavoriteButton title={title} className="tcard__fav" />
    </li>
  )
}
