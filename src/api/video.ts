import axios from 'axios'

const api = axios.create({
  baseURL: '/',
  timeout: 10000
})

export interface TranscriptSection {
  title: string
  startTime: number
  endTime: number
  sentences: {
    text: string
    startTime: number
    endTime: number
    isHighlight: boolean
  }[]
}

export interface ProcessVideoResponse {
  code: number
  data: {
    transcript: {
      sections: TranscriptSection[]
    }
  }
  message: string
}

export const processVideo = async (file: File): Promise<ProcessVideoResponse> => {
  const formData = new FormData()
  formData.append('video', file)
  
  const response = await api.post<ProcessVideoResponse>('/api/process-video', formData)
  return response.data
}

export const saveHighlights = async (highlights: { startTime: number; endTime: number; text: string }[]) => {
  const response = await api.post('/api/save-highlights', { highlights })
  return response.data
} 