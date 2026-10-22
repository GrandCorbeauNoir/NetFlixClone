import { supabase } from './supabase.js'

// Both reads and writes run as the signed-in user, so RLS scopes watchlist rows to them.
function unwrap({ data, error }) {
  if (error) throw new Error(error.message)
  return data
}

// TMDB's movie list endpoints return genre ids only.
const GENRES = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 99: 'Documentary',
  18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction', 10770: 'TV Movie', 53: 'Thriller',
  10752: 'War', 37: 'Western',
}
// TV uses its own genre ids.
const TV_GENRES = {
  10759: 'Action & Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 99: 'Documentary',
  18: 'Drama', 10751: 'Family', 10762: 'Kids', 9648: 'Mystery', 10763: 'News', 10764: 'Reality',
  10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics', 37: 'Western',
}
const IMG = 'https://image.tmdb.org/t/p'

function shape(m) {
  return {
    id: m.id,
    key: `movie-${m.id}`,
    title: m.title,
    type: 'movie',
    year: (m.release_date ?? '').slice(0, 4),
    rating: m.vote_average ? `${m.vote_average.toFixed(1)}/10` : '',
    length: '', // the favorites list has no runtime
    genres: (m.genre_ids ?? []).map((g) => GENRES[g]).filter(Boolean),
    description: m.overview,
    poster_url: m.poster_path ? `${IMG}/w500${m.poster_path}` : null,
    poster_seed: m.id,
    backdrop_url: m.backdrop_path ? `${IMG}/w1280${m.backdrop_path}` : null,
  }
}

function shapeTv(t) {
  return {
    id: t.id,
    key: `tv-${t.id}`,
    title: t.name,
    type: 'series',
    year: (t.first_air_date ?? '').slice(0, 4),
    rating: t.vote_average ? `${t.vote_average.toFixed(1)}/10` : '',
    length: '',
    genres: (t.genre_ids ?? []).map((g) => TV_GENRES[g]).filter(Boolean),
    description: t.overview,
    poster_url: t.poster_path ? `${IMG}/w500${t.poster_path}` : null,
    poster_seed: t.id,
    backdrop_url: t.backdrop_path ? `${IMG}/w1280${t.backdrop_path}` : null,
  }
}

// Movies come from get-tmdb_favorite_movies, TV shows from get-tmdb_discover_tv (both edge functions).
// A TV failure only drops the shows; a movies failure is still an error.
export async function fetchTitles() {
  const [movies, tv] = await Promise.all([
    supabase.functions.invoke('get-tmdb_favorite_movies', { method: 'GET' }),
    supabase.functions.invoke('get-tmdb_discover_tv', { method: 'GET' }).catch((error) => ({ error })),
  ])
  if (movies.error) throw new Error(movies.error.message)
  const shows = tv.error ? [] : (tv.data.results ?? []).map(shapeTv)
  return [...(movies.data.results ?? []).map(shape), ...shows].sort((a, b) => a.title.localeCompare(b.title))
}

// Movie and TV ids overlap in TMDB, so favorites are keyed `movie-<id>` / `tv-<id>` (title.key).
const splitKey = (key) => {
  const [mediaType, id] = key.split('-')
  return { mediaType, tmdbId: Number(id) }
}

export const fetchWatchlist = () =>
  supabase.from('watchlist').select('media_type, tmdb_id').then(unwrap)
    .then((rows) => rows.map((r) => `${r.media_type}-${r.tmdb_id}`))

export const addFavorite = async (key) => {
  const { mediaType, tmdbId } = splitKey(key)
  const { data: { user } } = await supabase.auth.getUser()
  return supabase.from('watchlist')
    .upsert({ user_id: user.id, media_type: mediaType, tmdb_id: tmdbId }, { onConflict: 'user_id,media_type,tmdb_id', ignoreDuplicates: true })
    .then(unwrap)
}

export const removeFavorite = (key) => {
  const { mediaType, tmdbId } = splitKey(key)
  return supabase.from('watchlist').delete().eq('media_type', mediaType).eq('tmdb_id', tmdbId).then(unwrap)
}
