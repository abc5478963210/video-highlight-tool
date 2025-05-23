import Mock from 'mockjs'

// 模擬影片處理 API
Mock.mock('/api/process-video', 'post', {
  code: 200,
  data: {
    transcript: {
      sections: [
        {
          title: '開場介紹',
          startTime: 0,
          endTime: 30,
          sentences: [
            {
              text: '歡迎來到我們的影片',
              startTime: 0,
              endTime: 5,
              isHighlight: false
            },
            {
              text: '今天我們要討論一個重要的主題',
              startTime: 5,
              endTime: 10,
              isHighlight: true
            }
          ]
        },
        {
          title: '主要內容',
          startTime: 30,
          endTime: 120,
          sentences: [
            {
              text: '首先，讓我們看看第一個重點',
              startTime: 30,
              endTime: 40,
              isHighlight: true
            },
            {
              text: '這是一個非常重要的概念',
              startTime: 40,
              endTime: 50,
              isHighlight: false
            }
          ]
        }
      ]
    }
  },
  message: '處理成功'
})

// 模擬保存高亮 API
Mock.mock('/api/save-highlights', 'post', {
  code: 200,
  data: {
    success: true,
    highlights: [
      {
        startTime: 5,
        endTime: 10,
        text: '今天我們要討論一個重要的主題'
      },
      {
        startTime: 30,
        endTime: 40,
        text: '首先，讓我們看看第一個重點'
      }
    ]
  },
  message: '保存成功'
}) 