<template>
  <header class="app-header">
    <RouterLink to="/" class="header-logo">
      <img src="@/assets/LogoSide.png" alt="MovikFestivalen" class="header-logo-img" />
    </RouterLink>
  </header>
</template>

<script setup lang="ts">
</script>

<style scoped>
.app-header {
  width: 100%;
  background-color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1.5rem;
  height: 75px;
  box-sizing: border-box;
  flex-shrink: 0;
}

.header-logo {
  text-decoration: none;
  display: flex;
  align-items: center;
}

.header-logo-img {
  height: 150px;
  width: auto;
}
</style>
