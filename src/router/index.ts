import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/settings',
    name: 'globalConfig',
    component: () => import('@/views/GlobalConfigView.vue'),
  },
  {
    path: '/story/:id',
    name: 'story',
    component: () => import('@/views/StoryView.vue'),
  },
  {
    path: '/story/:id/memory',
    name: 'memory',
    component: () => import('@/views/MemoryView.vue'),
  },
  {
    path: '/story/:id/config',
    name: 'archiveConfig',
    component: () => import('@/views/ArchiveConfigView.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
