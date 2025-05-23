import axios from 'axios'

const api = axios.create({
  baseURL: '/',
  timeout: 10000
})

// request 攔截器（可加 token）
api.interceptors.request.use(
  config => {
    // 例如自動帶 token
    // const token = localStorage.getItem('token')
    // if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  error => Promise.reject(error)
)

// response 攔截器（統一錯誤處理）
api.interceptors.response.use(
  response => response,
  error => {
    // 這裡可統一彈窗、log、導向等
    // 例如：message.error(error.response?.data?.message || 'API 錯誤')
    return Promise.reject(error)
  }
)

export default api