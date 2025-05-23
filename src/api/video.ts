import api from './index' // 統一用這個

export const processVideo = async (file: File) => {
  const formData = new FormData()
  formData.append('video', file)
  const response = await api.post('/api/process-video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

export const saveHighlights = async (highlights: any[]) => {
  const response = await api.post('/api/save-highlights', { highlights })
  return response.data
}