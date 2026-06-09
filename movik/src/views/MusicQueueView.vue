<template>
  <div class="queue-page">
    <AppHeader />

    <div class="app-layout" :class="{ 'queue-open': queueVisible }">

      <!-- Queue panel -->
      <transition name="slide-right">
        <aside v-if="queueVisible" class="queue-panel">
          <div class="queue-panel-header">
            <h2>Neste opp</h2>
            <button class="icon-btn" @click="queueVisible = false">✕</button>
          </div>
          <div v-if="queueLoading" class="panel-state">Laster kø...</div>
          <div v-else-if="queueTracks.length === 0" class="panel-state">Ingen spor i kø</div>
          <ul v-else class="queue-list">
            <li v-for="(track, i) in queueTracks" :key="track.id + i" class="queue-item">
              <img :src="albumArt(track, 64)" class="queue-art" :alt="track.album.name" />
              <div class="queue-info">
                <span class="queue-name">{{ track.name }}</span>
                <span class="queue-artist">{{ track.artists.map(a => a.name).join(', ') }}</span>
              </div>
            </li>
          </ul>
        </aside>
      </transition>

      <!-- Main content -->
      <main class="main-content">
        <div class="search-area" ref="searchAreaRef">

          <!-- Search input -->
          <div class="search-card">
            <span class="search-prefix">♪</span>
            <input
              v-model="query"
              @input="onInput"
              @keydown.escape="clearSearch"
              class="search-input"
              placeholder="Søk etter sang..."
              autocomplete="off"
              spellcheck="false"
            />
            <button v-if="query" class="clear-btn" @click="clearSearch">✕</button>
          </div>

          <!-- Results -->
          <transition name="fade-down">
            <ul v-if="showResults" class="results-list">
              <li v-if="searching" class="result-state">Søker...</li>
              <li v-else-if="results.length === 0" class="result-state">Ingen treff</li>
              <li
                v-else
                v-for="track in results"
                :key="track.id"
                class="result-item"
              >
                <img :src="albumArt(track, 64)" class="result-art" :alt="track.album.name" />
                <div class="result-info">
                  <span class="result-name">{{ track.name }}</span>
                  <span class="result-meta">
                    {{ track.artists.map(a => a.name).join(', ') }} · {{ track.album.name }}
                  </span>
                </div>
                <button
                  class="add-btn"
                  :class="{ added: addedIds.includes(track.id), loading: addingId === track.id }"
                  :disabled="addingId === track.id || addedIds.includes(track.id)"
                  @click="addTrack(track)"
                >
                  {{ addedIds.includes(track.id) ? '✓' : addingId === track.id ? '·' : '+' }}
                </button>
              </li>
            </ul>
          </transition>
        </div>
      </main>
    </div>

    <!-- Player bar -->
    <transition name="slide-up">
      <div v-if="playback?.item" class="player-bar">
        <img :src="albumArt(playback.item, 96)" class="player-art" :alt="playback.item.album.name" />
        <div class="player-center">
          <div class="player-meta">
            <span class="player-track">{{ playback.item.name }}</span>
            <span class="player-artist">{{ playback.item.artists.map(a => a.name).join(', ') }}</span>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPct + '%' }"></div>
            </div>
            <div class="progress-times">
              <span>{{ fmtMs(localProgress) }}</span>
              <span>{{ fmtMs(playback.item.duration_ms) }}</span>
            </div>
          </div>
        </div>
        <button class="queue-toggle-btn" @click="toggleQueue" :title="queueVisible ? 'Lukk kø' : 'Vis kø'">
          <span v-if="queueVisible">✕</span>
          <span v-else>
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h12v2H3v-2z"/>
            </svg>
          </span>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import { useSpotify } from '@/composables/useSpotify'
import type { SpotifyTrack, PlaybackState } from '@/composables/useSpotify'

const { search, addToQueue, getCurrentTrack, getQueue } = useSpotify()

// Search state
const query = ref('')
const results = ref<SpotifyTrack[]>([])
const searching = ref(false)
const showResults = ref(false)
const addingId = ref<string | null>(null)
const addedIds = ref<string[]>([])
const searchAreaRef = ref<HTMLElement | null>(null)
let searchTimer: ReturnType<typeof setTimeout> | null = null

// Queue state
const queueVisible = ref(false)
const queueTracks = ref<SpotifyTrack[]>([])
const queueLoading = ref(false)
let queueTimer: ReturnType<typeof setInterval> | null = null

// Playback state
const playback = ref<PlaybackState | null>(null)
const localProgress = ref(0)
const lastPollMs = ref(0)
const lastProgressMs = ref(0)
let playerTimer: ReturnType<typeof setInterval> | null = null
let progressTimer: ReturnType<typeof setInterval> | null = null

// Computed
const progressPct = computed(() => {
  if (!playback.value?.item) return 0
  return Math.min((localProgress.value / playback.value.item.duration_ms) * 100, 100)
})

// Helpers
function albumArt(track: SpotifyTrack, size: number): string {
  const imgs = track.album.images
  if (!imgs.length) return ''
  return [...imgs].sort((a, b) => Math.abs(a.width - size) - Math.abs(b.width - size))[0].url
}

function fmtMs(ms: number): string {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// Search
function onInput() {
  if (searchTimer) clearTimeout(searchTimer)
  if (!query.value.trim()) {
    results.value = []
    showResults.value = false
    return
  }
  searchTimer = setTimeout(async () => {
    searching.value = true
    showResults.value = true
    results.value = await search(query.value)
    searching.value = false
  }, 400)
}

function clearSearch() {
  query.value = ''
  results.value = []
  showResults.value = false
}

async function addTrack(track: SpotifyTrack) {
  if (addingId.value) return
  addingId.value = track.id
  try {
    await addToQueue(track.uri)
    addedIds.value.push(track.id)
    setTimeout(() => {
      addedIds.value = addedIds.value.filter(id => id !== track.id)
    }, 2500)
  } catch { /* noop */ }
  finally { addingId.value = null }
}

// Click outside search results
function onClickOutside(e: MouseEvent) {
  if (searchAreaRef.value && !searchAreaRef.value.contains(e.target as Node)) {
    showResults.value = false
  }
}

// Player polling
async function pollPlayer() {
  try {
    const state = await getCurrentTrack()
    if (state?.item?.id !== playback.value?.item?.id) {
      // Track changed — reset local progress
      localProgress.value = state?.progress_ms ?? 0
    }
    playback.value = state
    lastProgressMs.value = state?.progress_ms ?? 0
    lastPollMs.value = Date.now()
  } catch { /* noop */ }
}

function tickProgress() {
  if (!playback.value?.is_playing) return
  const elapsed = Date.now() - lastPollMs.value
  localProgress.value = Math.min(
    lastProgressMs.value + elapsed,
    playback.value.item?.duration_ms ?? Infinity,
  )
}

// Queue
async function fetchQueue() {
  queueLoading.value = true
  try { queueTracks.value = await getQueue() } catch { /* noop */ }
  finally { queueLoading.value = false }
}

function toggleQueue() {
  queueVisible.value = !queueVisible.value
}

watch(queueVisible, async (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) {
    await fetchQueue()
    queueTimer = setInterval(fetchQueue, 120_000)
  } else {
    if (queueTimer) { clearInterval(queueTimer); queueTimer = null }
  }
})

function startPolling() {
  pollPlayer()
  playerTimer = setInterval(pollPlayer, 20_000)
  progressTimer = setInterval(tickProgress, 500)
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  startPolling()
})

onUnmounted(() => {
  document.body.style.overflow = ''
  document.removeEventListener('click', onClickOutside)
  if (playerTimer) clearInterval(playerTimer)
  if (progressTimer) clearInterval(progressTimer)
  if (queueTimer) clearInterval(queueTimer)
})
</script>

<style scoped>
/* ── Page & background ── */
.queue-page {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: rgb(245, 185, 48);
  background-image: url('@/assets/ElefantSVG.svg');
  background-size: 10vh;
  background-repeat: repeat;
  background-attachment: fixed;
}

/* ── Login screen ── */
.login-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-card {
  background: rgba(10, 10, 10, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 3rem 2.5rem;
  text-align: center;
  max-width: 360px;
  width: 100%;
  color: #fff;
  backdrop-filter: blur(8px);
}

.login-elephant {
  width: 72px;
  height: 72px;
  margin-bottom: 1.5rem;
  opacity: 0.9;
}

.login-card h1 {
  font-size: 1.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 3px;
  margin: 0 0 0.5rem;
}

.login-card p {
  font-size: 0.9rem;
  opacity: 0.55;
  margin: 0 0 2rem;
  letter-spacing: 0.5px;
}

.spotify-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background-color: #1db954;
  color: #000;
  border: none;
  border-radius: 50px;
  padding: 0.75rem 1.75rem;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  cursor: pointer;
  transition: transform 0.15s, opacity 0.15s;
  font-family: inherit;
}

.spotify-btn:hover { opacity: 0.88; transform: scale(1.02); }

.spotify-icon {
  width: 18px;
  height: 18px;
}

/* ── App layout ── */
.app-layout {
  flex: 1;
  display: flex;
  position: relative;
  padding-bottom: 88px; /* player bar height */
  min-height: 0;
  overflow: hidden;
}

/* ── Queue panel ── */
.queue-panel {
  width: 340px;
  flex-shrink: 0;
  background: rgba(10, 10, 10, 0.92);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.07);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.queue-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.25rem 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.queue-panel-header h2 {
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0;
}

.icon-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.15s;
}
.icon-btn:hover { color: #fff; }

.panel-state {
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.85rem;
  text-align: center;
  padding: 2rem 1rem;
}

.queue-list {
  list-style: none;
  margin: 0;
  padding: 0.5rem 0;
  overflow-y: auto;
  flex: 1;
}

.queue-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1.25rem;
  transition: background 0.15s;
}
.queue-item:hover { background: rgba(255,255,255,0.04); }

.queue-art {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  flex-shrink: 0;
  object-fit: cover;
}

.queue-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.queue-name {
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.queue-artist {
  color: rgba(255,255,255,0.45);
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Main content ── */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
}

/* ── Search area ── */
.search-area {
  position: relative;
  width: 100%;
  max-width: 560px;
}

.search-card {
  display: flex;
  align-items: center;
  background: rgba(10, 10, 10, 0.88);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 0 1rem;
  gap: 0.75rem;
  backdrop-filter: blur(8px);
  transition: border-color 0.2s;
}

.search-card:focus-within {
  border-color: rgba(182, 92, 149, 0.6);
}

.search-prefix {
  color: rgba(255,255,255,0.3);
  font-size: 1.1rem;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: #fff;
  font-size: 1rem;
  font-family: inherit;
  padding: 1rem 0;
}

.search-input::placeholder {
  color: rgba(255,255,255,0.3);
}

.clear-btn {
  background: none;
  border: none;
  color: rgba(255,255,255,0.35);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem;
  flex-shrink: 0;
  transition: color 0.15s;
}
.clear-btn:hover { color: #fff; }

/* ── Results ── */
.results-list {
  list-style: none;
  margin: 0.5rem 0 0;
  padding: 0.5rem 0;
  background: rgba(10, 10, 10, 0.92);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px;
  backdrop-filter: blur(8px);
  overflow: hidden;
}

.result-state {
  color: rgba(255,255,255,0.35);
  font-size: 0.85rem;
  text-align: center;
  padding: 1.25rem;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.6rem 1rem;
  transition: background 0.15s;
}
.result-item:hover { background: rgba(255,255,255,0.05); }

.result-art {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  flex-shrink: 0;
  object-fit: cover;
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.result-name {
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-meta {
  color: rgba(255,255,255,0.45);
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.add-btn {
  width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,0.2);
  background: none;
  color: rgba(255,255,255,0.7);
  font-size: 1.1rem;
  font-weight: 300;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.add-btn:hover:not(:disabled) {
  border-color: #b65c95;
  color: #b65c95;
  background: rgba(182, 92, 149, 0.1);
}

.add-btn.added {
  border-color: #1db954;
  color: #1db954;
  background: rgba(29, 185, 84, 0.1);
}

.add-btn:disabled { opacity: 0.5; cursor: default; }

/* ── Player bar ── */
.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: rgba(8, 8, 8, 0.97);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255,255,255,0.07);
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 1.25rem;
  z-index: 100;
}

.player-art {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  flex-shrink: 0;
  object-fit: cover;
}

.player-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  overflow: hidden;
  min-width: 0;
}

.player-meta {
  display: flex;
  flex-direction: column;
}

.player-track {
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-artist {
  color: rgba(255,255,255,0.45);
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.progress-bar-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.progress-bar {
  height: 3px;
  background: rgba(255,255,255,0.12);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #b65c95;
  border-radius: 2px;
  transition: width 0.4s linear;
}

.progress-times {
  display: flex;
  justify-content: space-between;
  color: rgba(255,255,255,0.3);
  font-size: 0.68rem;
}

.queue-toggle-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.15);
  background: none;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.9rem;
  transition: all 0.15s;
}
.queue-toggle-btn:hover {
  border-color: rgba(255,255,255,0.4);
  color: #fff;
}

/* ── Transitions ── */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.28s ease, opacity 0.28s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.fade-down-enter-active,
.fade-down-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-down-enter-from,
.fade-down-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ── Mobile ── */
@media (max-width: 768px) {
  .queue-page {
    background-attachment: scroll;
  }

  .queue-panel {
    position: fixed;
    inset: 0;
    width: 100%;
    z-index: 50;
    border-right: none;
  }

  .app-layout.queue-open .main-content {
    display: none;
  }

  .player-bar {
    height: 88px;
    padding: 0 1rem;
    gap: 0.75rem;
  }

  .app-layout {
    padding-bottom: 96px;
  }

  .main-content {
    justify-content: flex-start;
    padding-top: 3rem;
  }
}
</style>
