import axios from 'axios'

// 根據環境自動判斷 API URL
const getApiBaseURL = () => {
  const envApiUrl = import.meta.env.VITE_APP_API_BASE_URL
  const useMock = import.meta.env.DEV || import.meta.env.VITE_MOCK === 'true'
  
  // 開發環境：使用環境變數或默認 localhost
  if (import.meta.env.DEV) {
    // 如果使用 MSW mock，使用相對路徑（讓 MSW 攔截）
    if (useMock && !envApiUrl) {
      return '' // 空字符串表示使用相對路徑
    }
    return envApiUrl || 'http://localhost:8081'
  }
  
  // 生產環境
  if (useMock) {
    // 如果生產環境也使用 mock，使用相對路徑（讓 MSW 攔截）
    console.log('✅ 生產環境使用 MSW Mock，API 使用相對路徑')
    return '' // 空字符串表示使用相對路徑，MSW 會攔截請求
  }
  
  // 生產環境：必須使用有效的 API URL
  if (envApiUrl) {
    // 檢查是否為 localhost（生產環境不應該使用 localhost，除非使用 mock）
    if ((envApiUrl.includes('localhost') || envApiUrl.includes('127.0.0.1')) && !useMock) {
      console.error('❌ 錯誤：生產環境不能使用 localhost！')
      console.error('請設置 .env.production 文件，使用實際的 API 服務器地址')
      console.error('或設置 VITE_MOCK=true 來使用 MSW mock')
      console.error('範例：VITE_APP_API_BASE_URL=https://api.yourdomain.com')
    } else {
      console.log('✅ 使用生產環境 API URL:', envApiUrl)
      return envApiUrl
    }
  }
  
  // 生產環境後備配置（如果沒有設置環境變數且不使用 mock）
  // ⚠️ 請在下方填入你的實際 API 服務器地址
  // 例如：'https://api.yourdomain.com' 或 'https://your-backend.herokuapp.com'
  const PRODUCTION_API_URL = '' // 👈 請在這裡填入你的實際 API URL
  
  if (PRODUCTION_API_URL) {
    console.log('✅ 使用後備生產環境 API URL:', PRODUCTION_API_URL)
    return PRODUCTION_API_URL
  }
  
  // 如果沒有設置且不使用 mock，給出明確的錯誤提示
  if (!useMock) {
    console.error('❌ 錯誤：生產環境未設置 API URL！')
    console.error('請創建 .env.production 文件並設置 VITE_APP_API_BASE_URL')
    console.error('或設置 VITE_MOCK=true 來使用 MSW mock')
    console.error('或在 src/api/index.ts 中設置 PRODUCTION_API_URL 變數')
  }
  
  // 如果使用 mock，返回空字符串（相對路徑）
  return ''
}

const apiBaseURL = getApiBaseURL()

// 始終顯示當前使用的 API URL（方便調試）
console.log('🔗 API Base URL:', apiBaseURL || '(未設置)')
if (!apiBaseURL && !import.meta.env.DEV) {
  console.error('❌ 生產環境 API URL 未正確設置！請檢查環境變數配置。')
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