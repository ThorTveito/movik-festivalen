<template>
  <div class="page">
    <AppHeader />
    <main class="content">
      <div class="login-card">
        <h1>Logg inn</h1>
        <p class="sub">Kun for arrangører og frivillige.</p>

        <form class="login-form" @submit.prevent="handleSubmit">
          <div class="field">
            <label for="username">Brukernavn</label>
            <input id="username" v-model="username" type="text" placeholder="brukernavn" autocomplete="username" required />
          </div>
          <div class="field">
            <label for="password">Passord</label>
            <input id="password" v-model="password" type="password" placeholder="••••••••" autocomplete="current-password" required />
          </div>
          <p v-if="error" class="error">{{ error }}</p>
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? '...' : 'Logg inn' }}
          </button>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { signIn } = useAuth()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await signIn(username.value, password.value)
    router.push('/')
  } catch {
    error.value = 'Feil e-post eller passord.'
  } finally {
    loading.value = false
  }
}
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
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.login-card {
  background: #fff;
  border: 2px solid #162f4d;
  border-radius: 6px;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 380px;
  box-sizing: border-box;
}

.login-card h1 {
  font-size: 1.6rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0 0 0.4rem;
}

.sub {
  font-size: 0.85rem;
  opacity: 0.6;
  margin: 0 0 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.7;
}

.field input {
  border: 1.5px solid rgba(22, 47, 77, 0.3);
  border-radius: 4px;
  padding: 0.65rem 0.75rem;
  font-size: 1rem;
  font-family: inherit;
  color: #162f4d;
  background: #fff;
  outline: none;
  transition: border-color 0.15s;
}

.field input:focus {
  border-color: #162f4d;
}

.submit-btn {
  margin-top: 0.5rem;
  background-color: #162f4d;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.75rem;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: pointer;
  transition: opacity 0.15s;
}

.submit-btn:hover {
  opacity: 0.85;
}

.error {
  font-size: 0.85rem;
  color: #c0392b;
  margin: 0;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
