<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { callApi } from '@/utils/callApi'
import { processVideo } from '@/api/video'
import VideoTimeline from '@/components/highLightToo/VideoTimeline.vue'
import TranscriptViewer from '@/components/highLightToo/TranscriptViewer.vue'
import {
  ArrowLeftOutlined,
  UploadOutlined,
  VideoCameraOutlined
} from '@ant-design/icons-vue'
import { UploadProps } from 'ant-design-vue'

interface Sentence {
  text: string
  startTime: string
  endTime: string
  isHighlight: boolean
}

interface Section {
  title: string
  startTime: number
  endTime: number
  sentences: Sentence[]
}

interface TranscriptData {
  videoDuration?: number // API回傳的影片總時長（秒）
  transcript: {
    sections: Section[]
  }
}

interface TimelineSegment {
  startTime: string
  endTime: string
  text: string
  isHighlight: boolean
  sectionIndex: number
  sentenceIndex: number
}

const router = useRouter()
const videoFile = ref<File | null>(null)
const isProcessing = ref(false)
const videoUrl = ref<string>('')
const transcriptData = ref<TranscriptData | null>(null)
const videoRef = ref<HTMLVideoElement>()

// 影片播放狀態
const isPlaying = ref(false)
const currentTime = ref(0)
const videoDuration = ref(0)
// 從API資料獲取的影片時長
const apiVideoDuration = ref(0)

// 將時間字串轉換為秒數
const timeStringToSeconds = (timeStr: string): number => {
  const [minutes, seconds] = timeStr.split(':').map(Number)
  return minutes * 60 + seconds
}

// 從API回傳的transcript資料中計算影片時長（備用方法）
const calculateVideoDurationFromApi = (data: TranscriptData): number => {
  if (!data || !data.transcript.sections.length) {
    console.log('❌ API資料為空，無法計算時長')
    return 0
  }

  let maxTime = 0
  console.log('📊 備用方法：從transcript計算影片時長...')

  // 遍歷所有section找到最大的endTime
  data.transcript.sections.forEach((section) => {
    if (section.endTime > maxTime) {
      maxTime = section.endTime
    }

    // 也檢查sentence的endTime
    section.sentences.forEach((sentence) => {
      const sentenceEndSeconds = timeStringToSeconds(sentence.endTime)
      if (sentenceEndSeconds > maxTime) {
        maxTime = sentenceEndSeconds
      }
    })
  })

  const formattedTime = Math.floor(maxTime / 60) + ':' + String(Math.floor(maxTime % 60)).padStart(2, '0')
  console.log('📊 從transcript計算得出的影片時長:', maxTime, '秒 (', formattedTime, ')')

  return maxTime
}

// 獲取實際使用的影片時長（API優先）
const actualVideoDuration = computed(() => {
  // 第一優先：API直接回傳的videoDuration
  if (apiVideoDuration.value > 0) {
    const source = transcriptData.value?.videoDuration ? 'API直接回傳' : 'transcript計算'
    console.log(`📡 使用${source}的影片時長:`, apiVideoDuration.value, '秒')
    return apiVideoDuration.value
  }

  // 第二優先：瀏覽器解析的影片時長（備用）
  if (videoDuration.value > 0) {
    console.log('🎥 使用瀏覽器解析的影片時長:', videoDuration.value, '秒')
    return videoDuration.value
  }

  console.log('⚠️ 無可用的影片時長資料')
  return 0
})

// 獲取所有片段（包含高亮和非高亮）
const allSegments = computed((): TimelineSegment[] => {
  if (!transcriptData.value) return []

  const segments: TimelineSegment[] = []

  transcriptData.value.transcript.sections.forEach((section, sectionIndex) => {
    section.sentences.forEach((sentence, sentenceIndex) => {
      segments.push({
        startTime: sentence.startTime,
        endTime: sentence.endTime,
        text: sentence.text,
        isHighlight: sentence.isHighlight,
        sectionIndex,
        sentenceIndex
      })
    })
  })

  return segments
})

// 設置影片事件監聽器
const setupVideoEvents = () => {
  if (!videoRef.value) {
    console.log('❌ videoRef 不存在')
    return
  }

  console.log('🎥 設置影片事件監聽器')

  const video = videoRef.value

  // 移除舊的事件監聽器（如果存在）
  video.removeEventListener('loadedmetadata', onLoadedMetadata)
  video.removeEventListener('timeupdate', onTimeUpdate)
  video.removeEventListener('play', onPlay)
  video.removeEventListener('pause', onPause)

  // 添加新的事件監聽器
  video.addEventListener('loadedmetadata', onLoadedMetadata)
  video.addEventListener('timeupdate', onTimeUpdate)
  video.addEventListener('play', onPlay)
  video.addEventListener('pause', onPause)

  // 如果影片已經載入，直接設置時長
  if (video.readyState >= 1) {
    onLoadedMetadata()
  }
}

const onLoadedMetadata = () => {
  if (videoRef.value) {
    videoDuration.value = videoRef.value.duration
    console.log('📹 影片時長:', videoDuration.value, '秒')
    console.log('📹 影片時長格式化:', Math.floor(videoDuration.value / 60) + ':' + String(Math.floor(videoDuration.value % 60)).padStart(2, '0'))
    console.log('📹 影片準備狀態:', videoRef.value.readyState)

    // 確認影片元數據已完全載入
    if (videoRef.value.duration && videoRef.value.duration > 0) {
      console.log('✅ 影片元數據已正確載入')
    } else {
      console.log('⚠️ 影片時長獲取異常:', videoRef.value.duration)
    }
  }
}

const onTimeUpdate = () => {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime
  }
}

const onPlay = () => {
  isPlaying.value = true
  console.log('▶️ 影片開始播放')
}

const onPause = () => {
  isPlaying.value = false
  console.log('⏸️ 影片暫停')
}

// 監聽 videoUrl 變化，當影片載入後設置事件
watch(videoUrl, async (newUrl) => {
  if (newUrl) {
    console.log('🎬 影片 URL 已設置:', newUrl)
    await nextTick()
    // 等待一小段時間確保 DOM 更新完成
    setTimeout(() => {
      setupVideoEvents()
    }, 100)
  }
})

const handleUpload: UploadProps['customRequest'] = async ({ file }) => {
  if (file instanceof File) {
    try {
      videoFile.value = file
      isProcessing.value = true

      console.log('📤 開始上傳影片:', file.name)

      const response = await callApi(processVideo(file))

      // 創建影片 URL
      videoUrl.value = URL.createObjectURL(file)
      console.log('🎥 影片 URL 已創建')

      // 儲存轉錄資料
      if (response.data) {
        transcriptData.value = response.data
        console.log('✅ 轉錄資料:', transcriptData.value)

        // 優先使用API直接回傳的影片時長
        if (response.data.videoDuration) {
          apiVideoDuration.value = response.data.videoDuration
          console.log('✅ API直接回傳影片時長:', apiVideoDuration.value, '秒')

          const formattedTime = Math.floor(apiVideoDuration.value / 60) + ':' + String(Math.floor(apiVideoDuration.value % 60)).padStart(2, '0')
          console.log('📊 API判斷的影片時長:', formattedTime)
          console.log('🎯 這個時長是API動態分析影片後的結果')
        } else {
          // 備用：從transcript資料計算影片時長
          apiVideoDuration.value = calculateVideoDurationFromApi(response.data)
          console.log('🔄 API未直接回傳時長，從transcript計算:', apiVideoDuration.value, '秒')
        }
      }

    } catch (error) {
      console.log("❌ API 錯誤：", error)
    }
    finally {
      isProcessing.value = false
    }
  }
}

const goBack = () => {
  router.push('/')
}

const toggleHighlight = (sectionIndex: number, sentenceIndex: number) => {
  if (transcriptData.value) {
    const sentence = transcriptData.value.transcript.sections[sectionIndex].sentences[sentenceIndex]
    sentence.isHighlight = !sentence.isHighlight

    console.log('🎯 切換高亮標記:')
    console.log('  📝 句子:', sentence.text)
    console.log('  ⏰ 時間:', sentence.startTime, '-', sentence.endTime)
    console.log('  🎨 高亮狀態:', sentence.isHighlight)
    console.log('  🚀 無時間限制：任何句子都可以標記為高亮')
  } else {
    console.log('❌ 無transcript資料，無法切換高亮')
  }
}

// 處理從組件傳來的跳轉時間事件
const handleJumpToTime = (timeString: string) => {
  const startSeconds = timeStringToSeconds(timeString)
  seekTo(startSeconds)
  console.log('⏭️ 跳轉到時間:', timeString, '(', startSeconds, '秒)')
}

// 影片播放控制
const togglePlay = () => {
  if (!videoRef.value) {
    console.log('❌ 無法控制播放：videoRef 不存在')
    return
  }

  console.log('🎮 切換播放狀態，當前:', isPlaying.value)

  if (isPlaying.value) {
    videoRef.value.pause()
  } else {
    videoRef.value.play()
  }
}

// 跳轉到指定時間
const seekTo = (time: number) => {
  if (!videoRef.value) {
    console.log('❌ 無法跳轉：videoRef 不存在')
    return
  }

  console.log('⏭️ 跳轉到時間:', time, '秒')
  console.log('📊 API時長:', apiVideoDuration.value, '實際影片時長:', videoDuration.value)

  // 移除所有時間限制，允許跳轉到任何時間點
  console.log('🚀 無限制跳轉模式：允許跳轉到任何API定義的時間點')

  // 執行跳轉，不做任何時間範圍檢查
  try {
    videoRef.value.currentTime = time
    currentTime.value = time
    console.log('✅ 已跳轉到時間:', time, '秒（無時間限制）')
  } catch (error) {
    console.log('⚠️ 跳轉超出影片範圍但這是允許的:', error)
    // 即使跳轉失敗，仍然更新currentTime以支持UI顯示
    currentTime.value = time
    console.log('🔄 已更新UI時間指示器到:', time, '秒')
  }
}

// 跳轉到片段
const jumpToSegment = (segment: TimelineSegment) => {
  const startSeconds = timeStringToSeconds(segment.startTime)
  seekTo(startSeconds)
  console.log('🎯 跳轉到片段:', segment.text)
}

const clearAll = () => {
  console.log('🗑️ 清空所有資料')

  // 清空檔案和URL
  videoFile.value = null
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value) // 釋放記憶體
  }
  videoUrl.value = ''

  // 清空轉錄資料
  transcriptData.value = null

  // 重置影片播放狀態
  isPlaying.value = false
  currentTime.value = 0
  videoDuration.value = 0
  apiVideoDuration.value = 0 // 重置API時長
  isProcessing.value = false

  // 清空影片元素
  if (videoRef.value) {
    videoRef.value.src = ''
    videoRef.value.load() // 重載影片元素
  }

  console.log('✅ 已清空所有資料')
}

</script>

<template>
  <div class="highlight-tool">
    <a-layout class="layout">
      <a-layout-header class="header">
        <div class="header-content">
          <a-button type="link" @click="goBack">
            <template #icon><arrow-left-outlined /></template>
            back
          </a-button>
          <span class="header-title">Video Highlight Tool</span>
        </div>
      </a-layout-header>

      <a-layout-content class="content">
        <a-row :gutter="16" class="main-row">
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="editor-col">
            <div class="editor-section">
              <div v-if="!videoFile" class="upload-wrapper">
                <a-upload :customRequest="handleUpload" :showUploadList="false" accept="video/*" class="upload-area">
                  <div class="upload-content">
                    <upload-outlined class="upload-icon" />
                    <p>點擊或拖放影片檔案至此處</p>
                  </div>
                </a-upload>
              </div>

              <div v-else class="transcript-section">
                <div v-if="isProcessing" class="processing-overlay">
                  <a-spin size="large" />
                  <p>正在處理影片...</p>
                </div>

                <TranscriptViewer v-else :transcript-data="transcriptData" :current-time="currentTime"
                  @toggle-highlight="toggleHighlight" @jump-to-time="handleJumpToTime" />
              </div>
            </div>
          </a-col>

          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="preview-col">
            <div class="preview-section">
              <div v-if="!videoFile" class="empty-state">
                <video-camera-outlined class="preview-icon" />
                <p>請先上傳影片</p>
              </div>

              <div v-else class="video-container">
                <!-- 新增關閉按鈕 -->
                <div class="video-header">
                  <a-button @click="clearAll" class="close-button">
                    <template #icon>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path
                          d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                    </template>
                    close
                  </a-button>
                </div>

                <div v-if="isProcessing" class="processing-overlay">
                  <a-spin size="large" />
                  <p>正在處理影片...</p>
                </div>

                <div v-else class="video-content">
                  <video ref="videoRef" :src="videoUrl" controls class="video-player" preload="metadata"></video>

                  <!-- 時間軸組件 -->
                  <VideoTimeline v-if="actualVideoDuration > 0" :segments="allSegments"
                    :video-duration="actualVideoDuration" :current-time="currentTime" :is-playing="isPlaying"
                    @seek-to="seekTo" @toggle-play="togglePlay" @jump-to-segment="jumpToSegment"
                    class="timeline-component" />
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<style scoped lang="scss">
@import '../styles/variables';
@import '../styles/mixins';

.highlight-tool {
  min-height: 100vh;
  background-color: $bg-dark;
  position: relative;

  &::before {
    display: none;
  }
}

.layout {
  background-color: $bg-dark;
  background-image: linear-gradient(45deg, rgba(157, 142, 199, 0.1) 0%, rgba(122, 107, 163, 0.5) 100%);
}

.header {
  background: rgba($bg-card, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 0 $spacing-lg;
  border-bottom: 1px solid $border-color;
  position: relative;
  z-index: 1;

  .header-content {
    @include flex(row, space-between, center);
    height: 64px;

    .header-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: $text-primary;
    }
  }
}

.content {
  position: relative;
  padding: $spacing-sm;
  z-index: 1;
}

.editor-section,
.preview-section {
  height: 100%;
  background: rgba($bg-card, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  overflow: hidden;
  border: 1px solid $border-color;
  box-shadow: $shadow-md;
  transition: $transition-normal;

  &:hover {
    box-shadow: $shadow-lg;
    border-color: rgba($primary-color, 0.3);
  }

  // 直立模式下的高度調整
  @media (orientation: portrait),
  (max-width: 767px) {
    height: calc(50vh - 48px);
  }

  // 桌面版高度
  @media (min-width: 768px) and (orientation: landscape) {
    height: calc(100vh - 96px);
  }

  // 手機橫向特別處理
  @media (max-width: 767px) and (orientation: landscape) {
    height: calc(100vh - 80px);
    /* 減少header等佔用空間 */
    overflow-y: auto;
    /* 允許滾動以防內容過多 */
  }
}

.editor-section {
  @include flex(column, center, center);
  background: #f6f6f6;
}

.upload-wrapper {
  @include flex(column, center, center);
  width: 50%;
  height: 50%;
  color: $primary-dark;

  // 響應式調整
  @media (orientation: portrait),
  (max-width: 767px) {
    width: 80%;
    height: 60%;
  }
}

.upload-area {
  width: 100%;
  height: 100%;

  :deep(.ant-upload) {
    width: 100%;
    height: 100%;
  }
}

.upload-content {
  @include flex(column, center, center);
  height: 100%;
  gap: $spacing-md;
  color: $primary-dark;
  border: 2px dashed $primary-color;
  border-radius: $border-radius-md;

  .upload-icon {
    font-size: 3rem;
    color: $primary-color;

    // 響應式調整圖示大小
    @media (orientation: portrait),
    (max-width: 767px) {
      font-size: 2rem;
    }
  }

  p {
    color: $primary-dark;
    font-weight: 600;
    text-align: center;

    // 響應式調整文字大小
    @media (orientation: portrait),
    (max-width: 767px) {
      font-size: 0.9rem;
    }
  }

  &:hover {
    color: $primary-light;
    background-color: $bg-hover;
  }
}

.transcript-section {
  height: 100%;
  width: 100%;
  background: #e8e8e8;
}

.processing-overlay {
  @include flex(column, center, center);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  gap: $spacing-md;
  color: $primary-color;

  :deep(.ant-spin) {
    .ant-spin-dot-item {
      background-color: $primary-color;
    }
  }
}

.empty-state {
  @include flex(column, center, center);
  height: 100%;
  color: $text-secondary;
  gap: $spacing-md;

  .preview-icon {
    font-size: 3rem;
    color: $primary-color;

    // 響應式調整圖示大小
    @media (orientation: portrait),
    (max-width: 767px) {
      font-size: 2rem;
    }
  }

  p {

    // 響應式調整文字大小
    @media (orientation: portrait),
    (max-width: 767px) {
      font-size: 0.9rem;
    }
  }
}

.video-container {
  height: 100%;
  position: relative;
}

.video-header {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

.close-button {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(220, 53, 69, 0.8);
    color: white;
  }

  svg {
    margin-right: 4px;
  }
}

.video-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0;
  /* 移除元素間的間距 */
}

.timeline-component {
  flex-shrink: 0;
  /* 不縮小，保持固定大小 */
  height: auto;
  /* 自動高度 */
  margin: 0;
  border-radius: 0;

  // 直立模式下調整時間軸高度
  @media (orientation: portrait),
  (max-width: 767px) {
    min-height: 60px;
    /* 直立模式下的最小高度 */

    :deep(.timeline-container) {
      height: auto;
      /* 自動高度適應 */
      min-height: 46px;
      /* 保證最小高度 */
    }
  }

  // 手機橫向特別處理 - 確保時間軸有足夠空間
  @media (max-width: 767px) and (orientation: landscape) {
    min-height: 120px;
    /* 手機橫向確保足夠高度 */
    max-height: 200px;
    /* 限制最大高度 */
    height: 120px;
    /* 固定高度 */
    background: rgba(0, 0, 0, 0.8);
    /* 增加背景確保可見性 */

    :deep(.timeline-container) {
      height: 80px;
      /* 固定高度確保可見 */
      min-height: 80px;
      padding: 10px;
    }

    :deep(.timeline-scale) {
      height: 30px;
      /* 刻度區域高度 */
      margin-top: 10px;
      font-size: 12px;
    }

    :deep(.timeline-segments) {
      height: 40px;
      /* 片段區域高度 */
      margin-bottom: 10px;
    }
  }
}

.video-player {
  flex: 1;
  /* 占滿剩餘空間 */
  width: 100%;
  max-height: calc(100vh - 200px);
  /* 最大高度避免超出螢幕 */
  // min-height: 300px;
  /* 最小高度保證可用性 */
  object-fit: contain;
  background: #000;

  // 響應式調整
  @media (orientation: portrait),
  (max-width: 767px) {
    min-height: 200px;
    /* 直立模式下的最小高度 */
    max-height: calc(50vh - 100px);
    /* 直立模式下的最大高度 */
  }

  // 手機橫向特別處理 - 更嚴格的高度限制
  @media (max-width: 767px) and (orientation: landscape) {
    max-height: calc(100vh - 200px);
    /* 為時間軸預留200px空間 */
    height: calc(100vh - 200px);
    /* 強制設定高度 */
    flex: none;
    /* 不使用flex，強制固定大小 */
  }

  // 小螢幕進一步調整
  @media (max-width: 480px) and (orientation: portrait) {
    min-height: 180px;
    /* 更小螢幕的最小高度 */
    max-height: calc(50vh - 80px);
  }
}

.debug-info {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 100;

  p {
    margin: 2px 0;
  }
}

:deep(.ant-btn-link) {
  color: $text-secondary;

  &:hover {
    color: $primary-light;
  }

  .anticon {
    color: $primary-color;
  }
}

// 針對 Ant Design Row 的額外樣式調整
:deep(.ant-row) {
  height: 100%;

  @media (orientation: portrait),
  (max-width: 767px) {
    display: flex !important;
    flex-direction: column !important;
  }
}

:deep(.ant-col) {

  @media (orientation: portrait),
  (max-width: 767px) {
    width: 100% !important;
    max-width: 100% !important;
    flex: none !important;
  }
}

.main-row {
  height: calc(100vh - 96px);

  // 橫向（landscape）一律左右分割
  @media (orientation: landscape) {
    display: flex !important;
    flex-direction: row !important;

    .editor-col {
      order: 1;
      height: 100% !important;
    }

    .preview-col {
      order: 2;
      height: 100% !important;
    }
  }

  // 直立（portrait）一律上下分割
  @media (orientation: portrait) {
    display: flex !important;
    flex-direction: column !important;

    .editor-col {
      order: 2;
      height: 50% !important;
    }

    .preview-col {
      order: 1;
      height: 50% !important;
    }
  }
}

// 預設：直立（column）
.main-container {
  display: flex;
  flex-direction: column;
}

// 手機橫向（max-width: 767px 且 landscape）改為 row
@media (max-width: 767px) and (orientation: landscape) {
  .main-container {
    flex-direction: row;
  }
}

// 桌面橫向（大於 767px）也用 row
@media (min-width: 768px) {
  .main-container {
    flex-direction: row;
  }
}

@media (orientation: landscape) {

  .main-row,
  :deep(.ant-row) {
    display: flex !important;
    flex-direction: row !important;
  }

  .editor-col,
  .preview-col,
  :deep(.ant-col) {
    height: 100% !important;
    width: 50% !important;
    max-width: 50% !important;
    flex: 1 1 0 !important;
  }
}
</style>