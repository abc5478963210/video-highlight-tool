import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:8081',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    console.log('🚀 發送請求:', config.url)
    return config
  },
  (error) => {
    console.error('❌ 請求錯誤:', error)
    return Promise.reject(error)
  }
)

// 響應攔截器
api.interceptors.response.use(
  (response) => {
    console.log('✅ 請求成功:', response.config.url)
    return response
  },
  (error) => {
    console.error('❌ 響應錯誤:', error)
    return Promise.reject(error)
  }
)

export default api