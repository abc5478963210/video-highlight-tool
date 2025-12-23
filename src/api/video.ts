import api from './index' // 統一用這個

export const processVideo = async (file: File) => {
  const formData = new FormData()
  formData.append('video', file)
  // 不設置 Content-Type，讓瀏覽器自動設置（包括 boundary）
  const response = await api.post('/api/process-video', formData)
  return response.data
}

export const saveHighlights = async (highlights: any[]) => {
  const response = await api.post('/api/save-highlights', { highlights })
  return response.data
}