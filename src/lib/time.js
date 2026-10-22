// "2h 04m" -> seconds. Series ("3 seasons") get a 45 minute episode.
export function runtimeSeconds(title) {
  if (title.type === 'series') return 45 * 60
  const h = /(\d+)\s*h/.exec(title.length)?.[1] ?? 0
  const m = /(\d+)\s*m/.exec(title.length)?.[1] ?? 0
  return (Number(h) * 60 + Number(m)) * 60 || 2 * 60 * 60 // TMDB favorites carry no runtime
}

export function formatTime(total) {
  const s = Math.max(0, Math.floor(total))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
}
