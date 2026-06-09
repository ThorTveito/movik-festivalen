export interface SpotifyTrack {
  id: string
  name: string
  uri: string
  artists: Array<{ name: string }>
  album: {
    name: string
    images: Array<{ url: string; width: number; height: number }>
  }
  duration_ms: number
}

export interface PlaybackState {
  is_playing: boolean
  progress_ms: number
  item: SpotifyTrack | null
}

const BASE = import.meta.env.VITE_QUEUE_API_URL as string

async function apiFetch(path: string, options: RequestInit = {}) {
  return fetch(`${BASE}${path}`, options)
}

export function useSpotify() {
  async function search(query: string): Promise<SpotifyTrack[]> {
    const res = await apiFetch(`/api/search?q=${encodeURIComponent(query)}`)
    if (!res.ok) return []
    return res.json()
  }

  async function addToQueue(uri: string): Promise<void> {
    await apiFetch('/api/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uri }),
    })
  }

  async function getCurrentTrack(): Promise<PlaybackState | null> {
    const res = await apiFetch('/api/current-track')
    if (!res.ok) return null
    return res.json()
  }

  async function getQueue(): Promise<SpotifyTrack[]> {
    const res = await apiFetch('/api/queue')
    if (!res.ok) return []
    return res.json()
  }

  return { search, addToQueue, getCurrentTrack, getQueue }
}
