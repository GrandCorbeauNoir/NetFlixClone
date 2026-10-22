export const PAGE_SIZE = 20

export function filterTitles(titles, { type, genre, query, ids } = {}) {
  const q = query?.trim().toLowerCase()
  return titles.filter((t) => {
    if (type && t.type !== type) return false
    if (genre && !t.genres.includes(genre)) return false
    if (ids && !ids.has(t.key)) return false
    if (q) {
      const hay = `${t.title} ${t.description} ${t.genres.join(' ')}`.toLowerCase()
      return hay.includes(q)
    }
    return true
  })
}

export function paginate(list, page) {
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE))
  const current = Math.min(Math.max(1, page), pages)
  return { items: list.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE), page: current, pages }
}
