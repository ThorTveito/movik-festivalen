<template>
  <div class="banner">
    <Vue3Marquee :duration="20" :pause-on-hover="true">
      <p class="banner-text">
        {{ festivalText }}
      </p>
      <img :src="ElefantSVG" alt="Elephant" class="banner-icon" />
      <p class="banner-text">
        {{ festivalText }}
      </p>
      <img :src="ElefantSVG" alt="Elephant" class="banner-icon" />
      <p class="banner-text">
        {{ festivalText }}
      </p>
      <img :src="ElefantSVG" alt="Elephant" class="banner-icon" />
    </Vue3Marquee>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Vue3Marquee } from 'vue3-marquee'
import ElefantSVG from '@/assets/ElefantSVG.svg'
import { FESTIVAL_INFO, FESTIVAL_DATES } from '@/utils/constants'

const festivalText = computed(() => 
  `${FESTIVAL_INFO.name} • ${FESTIVAL_DATES} • ${FESTIVAL_INFO.location}`
)
</script>

<style scoped>
@import './Banner.css';
</style>
