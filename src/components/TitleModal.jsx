import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Poster from './Poster.jsx'
import FavoriteButton from './FavoriteButton.jsx'
import { CloseIcon, PlayIcon } from './Icons.jsx'
import './Button.css'
import './TitleModal.css'

const ModalContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useTitleModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useTitleModal must be used inside <TitleModalProvider>')
  return ctx
}

export function TitleModalProvider({ children }) {
  const [selected, setSelected] = useState(null)
  const open = useCallback((title) => setSelected(title), [])
  const close = useCallback(() => setSelected(null), [])
  const value = useMemo(() => ({ open }), [open])
  return (
    <ModalContext.Provider value={value}>
      {children}
      {selected && <TitleDialog title={selected} onClose={close} />}
    </ModalContext.Provider>
  )
}

function TitleDialog({ title, onClose }) {
  const ref = useRef(null)
  const closing = useRef(false)
  const navigate = useNavigate()
  const kind = title.type === 'movie' ? 'Movie' : 'TV Show'

  useEffect(() => {
    // No close() in cleanup: it would fire onClose and unmount the modal
    // when StrictMode re-runs this effect in dev.
    if (!ref.current.open) ref.current.showModal()
  }, [])

  // Play the short exit, then close. Escape is intercepted so it gets the same exit.
  const requestClose = () => {
    const dlg = ref.current
    if (closing.current || !dlg.open) return
    closing.current = true
    dlg.classList.add('is-closing')
    setTimeout(() => dlg.close(), 140)
  }
  const onBackdrop = (e) => { if (e.target === ref.current) requestClose() }
  const onPlay = () => { onClose(); navigate(`/watch/${title.key}`) }

  return (
    <dialog
      ref={ref}
      className="tmodal"
      aria-labelledby="tmodal-title"
      onClose={onClose}
      onCancel={(e) => { e.preventDefault(); requestClose() }}
      onClick={onBackdrop}
    >
      <div className="tmodal__card">
        <button type="button" className="tmodal__close" aria-label="Close details" onClick={requestClose}>
          <CloseIcon />
        </button>

        <Poster title={title} className="tmodal__poster" />

        <div className="tmodal__body">
          <h2 id="tmodal-title" className="tmodal__title">{title.title}</h2>
          <p className="tmodal__meta">
            <span>{kind}</span><span>{title.year}</span><span className="tmodal__rating">{title.rating}</span><span>{title.length}</span>
          </p>
          <ul className="tmodal__genres">
            {title.genres.map((g) => <li key={g}>{g}</li>)}
          </ul>
          <p className="tmodal__desc">{title.description}</p>

          <div className="tmodal__actions">
            <button type="button" className="btn btn--lg tmodal__play" onClick={onPlay}>
              <PlayIcon /> Play
            </button>
            <FavoriteButton title={title}>fav</FavoriteButton>
          </div>
        </div>
      </div>
    </dialog>
  )
}
