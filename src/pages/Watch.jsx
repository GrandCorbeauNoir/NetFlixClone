import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Poster from '../components/Poster.jsx'
import FavoriteButton from '../components/FavoriteButton.jsx'
import { PauseIcon, PlayIcon, SkipBackIcon, SkipForwardIcon, StopIcon } from '../components/Icons.jsx'
import CatalogStatus from '../components/CatalogStatus.jsx'
import { useCatalog } from '../state/CatalogContext.jsx'
import { formatTime, runtimeSeconds } from '../lib/time.js'
import '../components/Button.css'
import './Watch.css'

const SKIP = 10

// Simulated playback: no video file, just a clock that ticks in real time.
function usePlayer(duration) {
  const [status, setStatus] = useState('stopped') // 'stopped' | 'playing' | 'paused'
  const [position, setPositionState] = useState(0)
  const posRef = useRef(0) // the ticker reads this so it never sees a stale position
  const last = useRef(0)

  const setPos = useCallback((value) => {
    posRef.current = Math.min(duration, Math.max(0, value))
    setPositionState(posRef.current)
  }, [duration])

  useEffect(() => {
    if (status !== 'playing') return
    last.current = performance.now()
    const id = setInterval(() => {
      const now = performance.now()
      const next = posRef.current + (now - last.current) / 1000
      last.current = now
      if (next >= duration) {
        // Reaching the end rewinds to a stopped state.
        setPos(0)
        setStatus('stopped')
      } else {
        setPos(next)
      }
    }, 250)
    return () => clearInterval(id)
  }, [status, duration, setPos])

  const play = useCallback(() => setStatus('playing'), [])
  const pause = useCallback(() => setStatus((s) => (s === 'playing' ? 'paused' : s)), [])
  const stop = useCallback(() => { setStatus('stopped'); setPos(0) }, [setPos])
  const seek = useCallback((to) => setPos(to), [setPos])
  const skip = useCallback((by) => setPos(posRef.current + by), [setPos])
  return { status, position, play, pause, stop, seek, skip }
}

function Player({ title }) {
  const duration = runtimeSeconds(title)
  const { status, position, play, pause, stop, seek, skip } = usePlayer(duration)
  const playing = status === 'playing'
  const stopped = status === 'stopped'

  useEffect(() => {
    const onKey = (e) => {
      if (e.target instanceof Element && e.target.closest('input, button, a, dialog')) return
      if (e.key === ' ') { e.preventDefault(); if (playing) pause(); else play() }
      else if (e.key === 'ArrowRight') skip(SKIP)
      else if (e.key === 'ArrowLeft') skip(-SKIP)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [playing, play, pause, skip])

  const stateLabel = playing ? 'Playing' : status === 'paused' ? 'Paused' : 'Stopped'

  return (
    <section className="player" aria-label="Video player">
      <div className={`screen${playing ? ' is-playing' : ''}`}>
        <Poster title={title} className="screen__art" />
        <div className="screen__shade" aria-hidden="true" />
        <button
          type="button"
          className={`screen__play${playing ? ' is-hidden' : ''}`}
          onClick={play}
          aria-label={stopped ? `Play ${title.title}` : 'Resume'}
          tabIndex={playing ? -1 : undefined}
        >
          <PlayIcon />
        </button>
        <p className="screen__state" role="status">{stateLabel}</p>
      </div>

      <div className="scrub">
        <span className="scrub__time">{formatTime(position)}</span>
        <input
          type="range" min="0" max={duration} step="1" value={Math.floor(position)}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Seek"
          aria-valuetext={`${formatTime(position)} of ${formatTime(duration)}`}
          style={{ '--pct': `${(position / duration) * 100}%` }}
        />
        <span className="scrub__time">{formatTime(duration)}</span>
      </div>

      <div className="controls">
        <button type="button" className="ctl" onClick={stop} disabled={stopped && position === 0}><StopIcon /> Stop</button>
        <button type="button" className="ctl ctl--main" onClick={play} disabled={playing}><PlayIcon /> Play</button>
        <button type="button" className="ctl" onClick={pause} disabled={!playing}><PauseIcon /> Pause</button>
        <button type="button" className="ctl ctl--half" onClick={() => skip(-SKIP)}><SkipBackIcon /> Reverse {SKIP}s</button>
        <button type="button" className="ctl ctl--half" onClick={() => skip(SKIP)}><SkipForwardIcon /> Advance {SKIP}s</button>
      </div>
    </section>
  )
}

export default function Watch() {
  const { id } = useParams()
  const { status, getTitle } = useCatalog()
  if (status !== 'ready') return <CatalogStatus className="watch" />
  const title = getTitle(id)

  if (!title) {
    return (
      <main className="watch watch--missing">
        <h1>We couldn’t find that title</h1>
        <p>It may have been removed from the catalog.</p>
        <Link to="/movies" className="btn">Browse movies</Link>
      </main>
    )
  }

  const kind = title.type === 'movie' ? 'Movie' : 'TV Show · S1 E1'
  return (
    <main className="watch">
      <Link to="/browse" className="watch__back">‹ Back to browse</Link>
      <header className="watch__head">
        <div>
          <h1 className="watch__title">{title.title}</h1>
          <p className="watch__meta">{kind} · {title.year} · {title.rating} · {title.genres.join(', ')}</p>
        </div>
        <FavoriteButton title={title}>fav</FavoriteButton>
      </header>
      <Player key={title.key} title={title} />
    </main>
  )
}
