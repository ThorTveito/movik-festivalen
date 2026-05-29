import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/info', component: () => import('@/views/InfoView.vue') },
    { path: '/logg-inn', component: () => import('@/views/LoginView.vue') },
    { path: '/musikk-ko', component: () => import('@/views/MusicQueueView.vue') },
  ],
})

export default router
