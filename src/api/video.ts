import api from './index' // 統一用這個

export const processVideo = async (file: File) => {
  const formData = new FormData()
  formData.append('video', file)
  const response = await api.post('/api/process-video', formData)
  return response.data
}