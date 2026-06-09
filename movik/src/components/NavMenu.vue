<template>
  <div class="nav-menu">
    <button class="burger-btn" @click="isOpen = !isOpen" :aria-expanded="isOpen" aria-label="Meny">
      <span class="burger-line" :class="{ open: isOpen }"></span>
      <span class="burger-line" :class="{ open: isOpen }"></span>
      <span class="burger-line" :class="{ open: isOpen }"></span>
    </button>

    <nav class="menu-dropdown" :class="{ open: isOpen }">
      <ul>
        <li><RouterLink to="/musikk-ko" @click="close">Musikk kø</RouterLink></li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)

function close() {
  isOpen.value = false
}
</script>

<style scoped>
.nav-menu {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
}

.burger-btn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 44px;
  height: 44px;
  background-color: #162f4d;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
}

.burger-line {
  display: block;
  width: 22px;
  height: 2px;
  background-color: #fff;
  border-radius: 2px;
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.burger-line.open:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.burger-line.open:nth-child(2) {
  opacity: 0;
}
.burger-line.open:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

.menu-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background-color: #162f4d;
  min-width: 180px;
  border-radius: 4px;
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transition: max-height 0.3s ease, opacity 0.2s ease;
  pointer-events: none;
}

.menu-dropdown.open {
  max-height: 300px;
  opacity: 1;
  pointer-events: auto;
}

.menu-dropdown ul {
  list-style: none;
  margin: 0;
  padding: 0.5rem 0;
}

.menu-dropdown li a,
.menu-dropdown li :deep(a) {
  display: block;
  padding: 0.75rem 1.25rem;
  color: #fff;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: background-color 0.15s ease;
}

.menu-dropdown li a:hover,
.menu-dropdown li :deep(a:hover) {
  background-color: rgba(255, 255, 255, 0.12);
  color: #fff;
}

@media (max-width: 480px) {
  .nav-menu {
    top: 0.75rem;
    right: 0.75rem;
  }
}
</style>
