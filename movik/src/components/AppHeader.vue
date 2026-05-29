<template>
  <header class="app-header">
    <RouterLink to="/" class="header-logo">MovikFestivalen</RouterLink>
    <nav class="header-nav">
      <RouterLink to="/info">Info</RouterLink>
      <RouterLink to="/musikk-ko">Musikk kø</RouterLink>
      <template v-if="currentUser">
        <button class="signout-btn" @click="signOut">Logg ut</button>
      </template>
      <RouterLink v-else to="/logg-inn">Logg inn</RouterLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'

const { currentUser, signOut } = useAuth()
</script>

<style scoped>
.app-header {
  width: 100%;
  background-color: #162f4d;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  height: 56px;
  box-sizing: border-box;
  flex-shrink: 0;
}

.header-logo {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-decoration: none;
}

.header-nav {
  display: flex;
  gap: 1.5rem;
}

.header-nav a {
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-decoration: none;
  transition: color 0.15s;
}

.header-nav a:hover,
.header-nav a.router-link-active {
  color: #fff;
}

.signout-btn {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0.25rem 0.65rem;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.signout-btn:hover {
  color: #fff;
  border-color: #fff;
}

@media (max-width: 480px) {
  .app-header {
    padding: 0 1rem;
  }

  .header-logo {
    font-size: 0.9rem;
    letter-spacing: 1px;
  }

  .header-nav {
    gap: 1rem;
  }

  .header-nav a {
    font-size: 0.75rem;
  }
}
</style>
