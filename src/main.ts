import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import App from './App.vue'
import router from './router'
import 'ant-design-vue/dist/reset.css'
import './styles/main.scss'

// 初始化 MSW (Mock Service Worker) - 用於 mock API
async function initMockService() {
  // 檢查是否啟用 mock（開發環境默認啟用，生產環境可通過環境變數控制）
  const enableMock = import.meta.env.DEV || import.meta.env.VITE_MOCK === 'true'
  
  if (enableMock) {
    try {
      const { worker } = await import('./mock/browser')
      await worker.start({
        onUnhandledRequest: 'bypass', // 未匹配的請求直接通過，不攔截
        serviceWorker: {
          url: '/video-highlight-tool/mockServiceWorker.js' // 根據 base 路徑調整
        }
      })
      console.log('✅ MSW (Mock Service Worker) 已啟動')
    } catch (error) {
      console.warn('⚠️ MSW 啟動失敗，將使用實際 API:', error)
    }
  }
}

// 先初始化 mock service，再啟動應用
initMockService().then(() => {
  const app = createApp(App)
  app.use(Antd)
  app.use(router)
  app.mount('#app')
}) 