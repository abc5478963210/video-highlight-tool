import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { env } from 'process'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
  plugins: [vue()],
  server: {
    port: 5174,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true
      }
    }
  },
  define: {
    'process.env': {
      ...env,
      VITE_APP_API_BASE_URL: env.VITE_APP_API_BASE_URL || 'http://localhost:8081',
      VITE_APP_API_PLATFORM: env.VITE_APP_API_PLATFORM || 'api',
      VITE_APP_API_OHO: env.VITE_APP_API_OHO || 'api',
      VITE_MOCK: env.VITE_MOCK || true
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'ant-design-vue', 'msw']
  },
  publicDir: 'public'
  }
})