<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { handleSpotifyCallback } from '@/composables/useSpotify'

const router = useRouter()

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  if (code) {
    window.history.replaceState({}, '', window.location.pathname)
    await handleSpotifyCallback(code)
    router.push('/musikk-ko')
  }
})
</script>

<style>
@import './styles/global.css';
</style>
