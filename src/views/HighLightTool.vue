<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { callApi } from '@/utils/callApi'
import { processVideo } from '@/api/video'
import VideoTimeline from '@/components/highLightToo/VideoTimeline.vue'
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

// 將時間字串轉換為秒數
const timeStringToSeconds = (timeStr: string): number => {
  const [minutes, seconds] = timeStr.split(':').map(Number)
  return minutes * 60 + seconds
}

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
    console.log('📹 影片時長:', videoDuration.value)
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
    console.log('🎯 切換高亮:', sentence.text, sentence.isHighlight)
  }
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

  console.log('⏭️ 跳轉到時間:', time)
  videoRef.value.currentTime = time
  currentTime.value = time
}

// 跳轉到片段
const jumpToSegment = (segment: TimelineSegment) => {
  const startSeconds = timeStringToSeconds(segment.startTime)
  seekTo(startSeconds)
  console.log('🎯 跳轉到片段:', segment.text)
}

</script>

<template>
  <div class="highlight-tool">
    <a-layout class="layout">
      <a-layout-header class="header">
        <div class="header-content">
          <a-button type="link" @click="goBack">
            <template #icon><arrow-left-outlined /></template>
            返回
          </a-button>
          <span class="header-title">Video Highlight Tool</span>
        </div>
      </a-layout-header>

      <a-layout-content class="content">
        <a-row :gutter="16">
          <a-col :span="12">
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

                <div v-else-if="transcriptData" class="transcript-content">
                  <div class="transcript-header">
                    <h2>Transcript</h2>
                  </div>

                  <div class="transcript-body">
                    <div v-for="(section, sectionIndex) in transcriptData.transcript.sections" :key="sectionIndex"
                      class="section">
                      <h3 class="section-title">{{ section.title }}</h3>

                      <div class="sentences">
                        <div v-for="(sentence, sentenceIndex) in section.sentences" :key="sentenceIndex"
                          class="sentence-item" :class="{ 'highlighted': sentence.isHighlight }"
                          @click="toggleHighlight(sectionIndex, sentenceIndex)">
                          <span class="time-stamp">{{ sentence.startTime }}</span>
                          <span class="sentence-text">{{ sentence.text }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a-col>

          <a-col :span="12">
            <div class="preview-section">
              <div v-if="!videoFile" class="empty-state">
                <video-camera-outlined class="preview-icon" />
                <p>請先上傳影片</p>
              </div>

              <div v-else class="video-container">
                <div v-if="isProcessing" class="processing-overlay">
                  <a-spin size="large" />
                  <p>正在處理影片...</p>
                </div>

                <div v-else class="video-content">
                  <video ref="videoRef" :src="videoUrl" controls class="video-player" preload="metadata"></video>

                  <!-- 時間軸組件 -->
                  <VideoTimeline v-if="videoDuration > 0" :segments="allSegments" :video-duration="videoDuration"
                    :current-time="currentTime" :is-playing="isPlaying" @seek-to="seekTo" @toggle-play="togglePlay"
                    @jump-to-segment="jumpToSegment" class="timeline-component" />
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
  height: calc(100vh - 96px);
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
  }

  p {
    color: $primary-dark;
    font-weight: 600;
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

.transcript-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.transcript-header {
  padding: 20px;
  background: #e8e8e8;
  border-bottom: 1px solid #ddd;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
  }
}

.transcript-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  margin: 0 0 12px 0;
  padding: 12px 20px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  background: #e8e8e8;
  border-bottom: 1px solid #ddd;
}

.sentences {
  background: #e8e8e8;
}

.sentence-item {
  display: flex;
  align-items: flex-start;
  padding: 8px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }

  &.highlighted {
    background: #4285f4;
    color: white;

    .time-stamp {
      color: rgba(255, 255, 255, 0.9);
    }

    &:hover {
      background: #3367d6;
    }
  }
}

.time-stamp {
  min-width: 50px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #666;
  margin-right: 12px;
  margin-top: 2px;
}

.sentence-text {
  flex: 1;
  line-height: 1.5;
  color: #333;
  font-size: 0.95rem;
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
  }
}

.video-container {
  height: 100%;
  position: relative;
}

.video-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.video-player {
  flex: 1;
  width: 100%;
  object-fit: contain;
  background: #000;
}

.timeline-component {
  flex-shrink: 0;
  margin: 0;
  border-radius: 0;
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
</style>