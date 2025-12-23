import axios from 'axios'

// 根據環境自動判斷 API URL
const getApiBaseURL = () => {
  // 優先使用環境變數
  if (import.meta.env.VITE_APP_API_BASE_URL) {
    return import.meta.env.VITE_APP_API_BASE_URL
  }
  
  // 開發環境使用 localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:8081'
  }
  
  // 生產環境：如果沒有設置環境變數，使用當前域名（假設 API 在同一個域名下）
  // 或者使用相對路徑
  const currentOrigin = window.location.origin
  // 如果 API 在相同域名下，可以使用相對路徑或完整 URL
  // 請根據實際部署情況修改這裡
  return currentOrigin // 或改為你的實際 API 域名，例如：'https://api.yourdomain.com'
}

const apiBaseURL = getApiBaseURL()

// 在控制台顯示當前使用的 API URL（僅在開發環境或明確設置時）
if (import.meta.env.DEV || import.meta.env.VITE_APP_API_BASE_URL) {
  console.log('🔗 API Base URL:', apiBaseURL)
}

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  },
  // 處理跨域請求
  withCredentials: false // 根據後端需求設置，如果後端需要 cookies 則設為 true
})

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    const fullUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url
    console.log('🚀 發送請求:', fullUrl)
    
    // 如果是 FormData，移除 Content-Type 讓瀏覽器自動設置
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    
    // 確保請求頭設置正確
    if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }
    
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
    
    // 處理 CORS 錯誤
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.error('⚠️ CORS 錯誤：請檢查後端服務器的 CORS 設置')
      error.message = '網路錯誤：請確認 API 服務器已正確設置 CORS 頭'
    }
    
    // 處理跨域相關錯誤
    if (error.response?.status === 0 || error.code === 'ERR_CORS') {
      console.error('⚠️ 跨域請求被阻止：請檢查後端 CORS 配置')
      error.message = '跨域請求失敗：請確認後端服務器允許來自當前域名的請求'
    }
    
    return Promise.reject(error)
  }
)

export default api