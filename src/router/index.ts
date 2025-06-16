import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
import HighLightTool from '../views/HighLightTool.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/highlight-tool',
    name: 'highlight-tool',
    component: HighLightTool
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router 