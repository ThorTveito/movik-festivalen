<template>
  <div class="page">
    <AppHeader />
    <main class="content">
      <section class="hero-block">
        <h1>Om festivalen</h1>
        <p class="subtitle">MovikFestivalen • 10. – 12. Juli 2026 • Nøtterøy</p>
      </section>

      <p v-if="loadError" class="load-error">Kunne ikke laste innhold.</p>

      <section
        v-for="section in sections"
        :key="section.key"
        class="info-section"
      >
        <template v-if="editing === section.key">
          <input v-model="editTitle" class="edit-title" />
          <textarea v-model="editBody" class="edit-body" rows="5" />
          <div class="edit-actions">
            <button class="save-btn" @click="save(section.key)" :disabled="saving">
              {{ saving ? '...' : 'Lagre' }}
            </button>
            <button class="cancel-btn" @click="editing = null">Avbryt</button>
          </div>
        </template>
        <template v-else>
          <div class="section-header">
            <h2>{{ section.title }}</h2>
            <button v-if="currentUser" class="edit-btn" @click="startEdit(section)" title="Rediger">✏</button>
          </div>
          <p class="body-text">{{ section.body }}</p>
        </template>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import { useAuth } from '@/composables/useAuth'
import { fetchContent, updateSection } from '@/composables/useContent'
import type { ContentSection } from '@/composables/useContent'

const { currentUser } = useAuth()

const sections = ref<ContentSection[]>([])
const loadError = ref(false)
const editing = ref<string | null>(null)
const editTitle = ref('')
const editBody = ref('')
const saving = ref(false)

onMounted(async () => {
  try {
    sections.value = await fetchContent()
  } catch {
    loadError.value = true
  }
})

function startEdit(section: ContentSection) {
  editing.value = section.key
  editTitle.value = section.title
  editBody.value = section.body
}

async function save(key: string) {
  saving.value = true
  try {
    await updateSection(key, editTitle.value, editBody.value)
    const section = sections.value.find(s => s.key === key)
    if (section) {
      section.title = editTitle.value
      section.body = editBody.value
    }
    editing.value = null
  } finally {
    saving.value = false
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

.info-section {
  margin-bottom: 2.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.section-header h2 {
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0;
}

.body-text {
  font-size: 1rem;
  line-height: 1.7;
  margin: 0;
  opacity: 0.85;
  white-space: pre-wrap;
}

.edit-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  opacity: 0.4;
  padding: 0;
  transition: opacity 0.15s;
}

.edit-btn:hover {
  opacity: 1;
}

.edit-title {
  width: 100%;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  border: 1.5px solid rgba(22, 47, 77, 0.3);
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  font-family: inherit;
  color: #162f4d;
  background: #fff;
  box-sizing: border-box;
  margin-bottom: 0.75rem;
  outline: none;
}

.edit-title:focus {
  border-color: #162f4d;
}

.edit-body {
  width: 100%;
  font-size: 1rem;
  line-height: 1.7;
  border: 1.5px solid rgba(22, 47, 77, 0.3);
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  font-family: inherit;
  color: #162f4d;
  background: #fff;
  box-sizing: border-box;
  resize: vertical;
  outline: none;
}

.edit-body:focus {
  border-color: #162f4d;
}

.edit-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.save-btn {
  background-color: #162f4d;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1.25rem;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s;
}

.save-btn:hover { opacity: 0.85; }
.save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.cancel-btn {
  background: none;
  color: #162f4d;
  border: 1.5px solid rgba(22, 47, 77, 0.3);
  border-radius: 4px;
  padding: 0.5rem 1.25rem;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s;
}

.cancel-btn:hover { border-color: #162f4d; }

.load-error {
  color: #c0392b;
  font-size: 0.9rem;
}

@media (max-width: 480px) {
  .hero-block h1 { font-size: 1.8rem; }
  .content { padding: 2rem 1rem; }
}
</style>
