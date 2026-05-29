<template>
  <div class="page">
    <AppHeader />
    <main class="content">
      <section class="hero-block">
        <h1>Musikk kø</h1>
        <p class="subtitle">Stem på neste sang</p>
      </section>

      <div class="placeholder">
        <div class="icon">♫</div>
        <p>Spotify-integrasjonen kobles til her.</p>
        <p class="dim">Logg inn for å legge til og stemme på låter i køen.</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f7f5f0;
  color: #162f4d;
}

.content {
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  box-sizing: border-box;
}

.hero-block {
  margin-bottom: 3rem;
  border-bottom: 2px solid #162f4d;
  padding-bottom: 2rem;
}

.hero-block h1 {
  font-size: 2.5rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0 0 0.5rem;
  line-height: 1.1;
}

.subtitle {
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  opacity: 0.6;
  margin: 0;
}

.placeholder {
  text-align: center;
  padding: 3rem 1rem;
  opacity: 0.5;
}

.icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.placeholder p {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 600;
}

.dim {
  font-size: 0.85rem !important;
  opacity: 0.7;
}

@media (max-width: 480px) {
  .hero-block h1 {
    font-size: 1.8rem;
  }

  .content {
    padding: 2rem 1rem;
  }
}
</style>
