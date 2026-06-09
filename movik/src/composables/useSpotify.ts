import { ref, computed } from 'vue'

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

// Module-level singleton state
const authenticated = ref(!!localStorage.getItem('spotify_access_token'))

function saveTokens(data: { access_token: string; refresh_token?: string; expires_in: number }) {
  localStorage.setItem('spotify_access_token', data.access_token)
  if (data.refresh_token) localStorage.setItem('spotify_refresh_token', data.refresh_token)
  localStorage.setItem('spotify_token_expiry', String(Date.now() + data.expires_in * 1000 - 60000))
  authenticated.value = true
}

function clearTokens() {
  localStorage.removeItem('spotify_access_token')
  localStorage.removeItem('spotify_refresh_token')
  localStorage.removeItem('spotify_token_expiry')
  authenticated.value = false
}

async function getToken(): Promise<string | null> {
  const token = localStorage.getItem('spotify_access_token')
  const expiry = Number(localStorage.getItem('spotify_token_expiry') || 0)
  if (!token) return null
  if (Date.now() < expiry) return token

  const refreshToken = localStorage.getItem('spotify_refresh_token')
  if (!refreshToken) { clearTokens(); return null }

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
    }),
  })

  if (!res.ok) { clearTokens(); return null }
  const data = await res.json()
  saveTokens(data)
  return data.access_token
}

async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getToken()
  if (!token) throw new Error('not_authenticated')
  return fetch(url, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
  })
}

// PKCE helpers
function generateVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function generateChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// Called from App.vue when Spotify redirects back with ?code=
export async function handleSpotifyCallback(code: string): Promise<void> {
  const verifier = localStorage.getItem('spotify_code_verifier')
  if (!verifier) return
  localStorage.removeItem('spotify_code_verifier')

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
      client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
      code_verifier: verifier,
    }),
  })

  if (res.ok) saveTokens(await res.json())
}

export function useSpotify() {
  async function login() {
    const verifier = generateVerifier()
    const challenge = await generateChallenge(verifier)
    localStorage.setItem('spotify_code_verifier', verifier)

    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
      scope: 'user-read-playback-state user-modify-playback-state user-read-currently-playing',
      code_challenge_method: 'S256',
      code_challenge: challenge,
    })

    window.location.href = `https://accounts.spotify.com/authorize?${params}`
  }

  function logout() {
    clearTokens()
  }

  async function search(query: string): Promise<SpotifyTrack[]> {
    const params = new URLSearchParams({ q: query, type: 'track', limit: '5' })
    const res = await apiFetch(`https://api.spotify.com/v1/search?${params}`)
    if (!res.ok) return []
    const data = await res.json()
    return data.tracks?.items ?? []
  }

  async function addToQueue(uri: string): Promise<void> {
    const res = await apiFetch(
      `https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(uri)}`,
      { method: 'POST' },
    )
    if (!res.ok && res.status !== 204) throw new Error('queue_failed')
  }

  async function getCurrentTrack(): Promise<PlaybackState | null> {
    const res = await apiFetch('https://api.spotify.com/v1/me/player')
    if (res.status === 204 || res.status === 202) return null
    if (!res.ok) return null
    return res.json()
  }

  async function getQueue(): Promise<SpotifyTrack[]> {
    const res = await apiFetch('https://api.spotify.com/v1/me/player/queue')
    if (!res.ok) return []
    const data = await res.json()
    return data.queue?.slice(0, 10) ?? []
  }

  return {
    isAuthenticated: computed(() => authenticated.value),
    login,
    logout,
    search,
    addToQueue,
    getCurrentTrack,
    getQueue,
  }
}
