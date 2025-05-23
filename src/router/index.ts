import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/highlight-tool',
    name: 'highlight-tool',
    component: () => import('../views/HighLightTool.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 