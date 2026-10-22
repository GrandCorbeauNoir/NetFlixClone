import './Poster.css'

// Deterministic generated artwork, so there are no image files to ship.
const PALETTES = [
  ['#7a0c14', '#e8a33d'], ['#0c3b5c', '#6fd3d8'], ['#2b1a4f', '#ff6f91'],
  ['#14452f', '#d9f27a'], ['#4a1d0a', '#ff9d4d'], ['#1a1a40', '#9aa5ff'],
  ['#3d0f3a', '#ff8cd2'], ['#0b3a3a', '#f4e285'], ['#531c1c', '#f2d0a4'],
  ['#102a4c', '#ff5d5d'],
]

function hash(n) {
  let x = (n * 2654435761) >>> 0
  x ^= x >>> 15
  return x >>> 0
}

export default function Poster({ title, className = '' }) {
  if (title.poster_url) {
    return (
      <div className={`poster ${className}`}>
        <img src={title.poster_url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    )
  }
  const seed = hash(title.poster_seed)
  const [a, b] = PALETTES[seed % PALETTES.length]
  const shape = (seed >> 4) % 4
  const gid = `g${title.poster_seed}`
  return (
    <div className={`poster ${className}`}>
      <svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={a} />
            <stop offset="1" stopColor="#0b0b0b" />
          </linearGradient>
        </defs>
        <rect width="200" height="300" fill={`url(#${gid})`} />
        {shape === 0 && <circle cx="140" cy="90" r="62" fill={b} opacity="0.9" />}
        {shape === 1 && <path d="M0 210 L200 120 L200 300 L0 300Z" fill={b} opacity="0.85" />}
        {shape === 2 && (
          <g fill="none" stroke={b} strokeWidth="3" opacity="0.9">
            <circle cx="100" cy="110" r="30" /><circle cx="100" cy="110" r="55" /><circle cx="100" cy="110" r="80" />
          </g>
        )}
        {shape === 3 && <path d="M100 30 L170 150 L30 150Z" fill={b} opacity="0.9" />}
        <rect y="180" width="200" height="120" fill="#0b0b0b" opacity="0.35" />
      </svg>
      <span className="poster__title" aria-hidden="true">{title.title}</span>
    </div>
  )
}
