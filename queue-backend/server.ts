import { existsSync, readFileSync } from 'node:fs'

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI ?? 'http://127.0.0.1:3000/auth/callback'
const PORT = Number(process.env.PORT ?? 3000)
const TOKENS_FILE = new URL('./tokens.json', import.meta.url).pathname

interface TokenStore { accessToken: string; refreshToken: string; expiry: number }

function loadTokens(): TokenStore {
  if (existsSync(TOKENS_FILE)) {
    return JSON.parse(readFileSync(TOKENS_FILE, 'utf-8'))
  }
  return { accessToken: '', refreshToken: '', expiry: 0 }
}

async function saveTokens(store: TokenStore) {
  await Bun.write(TOKENS_FILE, JSON.stringify(store, null, 2))
}

const stored = loadTokens()
let accessToken = stored.accessToken
let refreshToken = stored.refreshToken
let tokenExpiry = stored.expiry

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

async function getToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) return accessToken
  if (!refreshToken) throw new Error('No refresh token — visit /auth/login first')

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`),
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(`Token refresh failed: ${data.error}`)

  accessToken = data.access_token
  tokenExpiry = Date.now() + data.expires_in * 1000 - 60_000
  if (data.refresh_token) refreshToken = data.refresh_token
  await saveTokens({ accessToken, refreshToken, expiry: tokenExpiry })
  return accessToken
}

async function spotifyFetch(url: string, options: RequestInit = {}) {
  const token = await getToken()
  return fetch(url, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
  })
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

function html(body: string) {
  return new Response(body, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)

    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

    if (url.pathname === '/auth/login') {
      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        scope: 'user-read-playback-state user-modify-playback-state user-read-currently-playing',
        show_dialog: 'true',
      })
      return Response.redirect(`https://accounts.spotify.com/authorize?${params}`)
    }

    if (url.pathname === '/auth/callback') {
      const code = url.searchParams.get('code')
      if (!code) return json({ error: 'missing code' }, 400)

      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`),
        },
        body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI }),
      })

      const data = await res.json()
      if (!res.ok) return html(`<h2>Feil: ${data.error}</h2>`)

      accessToken = data.access_token
      refreshToken = data.refresh_token
      tokenExpiry = Date.now() + data.expires_in * 1000 - 60_000
      await saveTokens({ accessToken, refreshToken, expiry: tokenExpiry })

      return html('<h2>✓ Spotify koblet til! Du kan lukke dette vinduet.</h2>')
    }

    if (url.pathname === '/health') return json({ ok: true })

    if (url.pathname === '/api/search') {
      const q = url.searchParams.get('q')
      if (!q) return json([])
      const params = new URLSearchParams({ q, type: 'track', limit: '5' })
      const res = await spotifyFetch(`https://api.spotify.com/v1/search?${params}`)
      const data = await res.json()
      return json(data.tracks?.items ?? [])
    }

    if (url.pathname === '/api/queue' && req.method === 'POST') {
      const body = await req.json() as { uri: string }
      await spotifyFetch(
        `https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(body.uri)}`,
        { method: 'POST' },
      )
      return json({ ok: true })
    }

    if (url.pathname === '/api/queue' && req.method === 'GET') {
      const res = await spotifyFetch('https://api.spotify.com/v1/me/player/queue')
      const data = await res.json()
      return json(data.queue?.slice(0, 10) ?? [])
    }

    if (url.pathname === '/api/current-track') {
      const res = await spotifyFetch('https://api.spotify.com/v1/me/player')
      if (res.status === 204) return json(null)
      return json(await res.json())
    }

    return json({ error: 'not found' }, 404)
  },
})

console.log(`\n🎵  Queue backend running on http://127.0.0.1:${PORT}`)
console.log(`🔗  Authenticate Spotify: http://127.0.0.1:${PORT}/auth/login\n`)
