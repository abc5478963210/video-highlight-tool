import { http, HttpResponse } from 'msw'

// Mock 數據
const mockTranscriptData = {
  code: 200,
  data: {
    videoDuration: 33,
    transcript: {
      sections: [
        {
          title: 'Introduction',
          startTime: 0,
          endTime: 15,
          sentences: [
            {
              text: 'Welcome to our product demonstration.',
              startTime: '00:00',
              endTime: '00:05',
              isHighlight: false
            },
            {
              text: "Today, we'll be showcasing our latest innovation.",
              startTime: '00:05',
              endTime: '00:15',
              isHighlight: true
            }
          ]
        },
        {
          title: 'Key Features',
          startTime: 15,
          endTime: 30,
          sentences: [
            {
              text: 'Our product has three main features.',
              startTime: '00:15',
              endTime: '00:20',
              isHighlight: false
            },
            {
              text: "First, it's incredibly easy to use.",
              startTime: '00:20',
              endTime: '00:25',
              isHighlight: false
            },
            {
              text: "Second, it's highly efficient.",
              startTime: '00:25',
              endTime: '00:30',
              isHighlight: true
            }
          ]
        }
      ]
    },
    message: '處理成功'
  }
}

export const handlers = [
  // 處理影片並生成轉錄
  http.post('/api/process-video', async ({ request }) => {
    // 模擬處理延遲
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 嘗試從 FormData 中獲取文件信息（用於動態計算時長）
    const formData = await request.formData()
    const videoFile = formData.get('video') as File | null
    
    let videoDuration = 33 // 默認值
    
    if (videoFile) {
      // 嘗試從文件名或文件大小估算時長（這只是示例）
      // 實際應該使用視頻解析庫，但這裡簡化處理
      console.log('📹 收到影片文件:', videoFile.name, '大小:', videoFile.size)
      // 這裡可以添加實際的視頻時長計算邏輯
    }
    
    return HttpResponse.json({
      ...mockTranscriptData,
      data: {
        ...mockTranscriptData.data,
        videoDuration // 使用計算或默認的時長
      }
    })
  }),

  // 保存影片高亮標記
  http.post('/api/save-highlights', async ({ request }) => {
    // 模擬處理延遲
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const body = await request.json() as { highlights: any[] }
    
    console.log('💾 保存高亮標記:', body.highlights)
    
    return HttpResponse.json({
      code: 200,
      data: {
        ...mockTranscriptData.data,
        success: true,
        highlights: body.highlights || []
      },
      message: '保存成功'
    })
  })
]

