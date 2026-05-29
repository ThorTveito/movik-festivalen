<template>
  <div class="home-container">
    <Banner />
    <div class="hero-section">
      <NavMenu />
      <picture>
        <source media="(max-width: 768px)" :srcset="mobileImage" />
        <img :src="heroImage" alt="Movik Festival" class="hero-image" />
      </picture>
    </div>
  </div>
</template>

<script setup lang="ts">
import Banner from '@/components/Banner.vue'
import NavMenu from '@/components/NavMenu.vue'
import heroImage from '@/assets/612715894_2370640950022369_3383395397786783488_n.jpg'
import mobileImage from '@/assets/20250803_020006 (1).jpg'
</script>

<style scoped>
@import '@/styles/App.css';

.home-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.hero-section {
  flex: 1;
  width: 100%;
  overflow: hidden;
  position: relative;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .home-container {
    height: 100vh;
    height: 100dvh; /* Dynamic viewport height for mobile browsers */
  }

  .hero-image {
    object-position: center;
  }
}

@media (max-width: 480px) {
  .hero-section {
    min-height: 0;
  }
}
</style>
