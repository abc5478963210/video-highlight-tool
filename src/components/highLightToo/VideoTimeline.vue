<script setup lang="ts">
import { ref, computed } from 'vue'

interface TimelineSegment {
  startTime: string
  endTime: string
  text: string
  isHighlight: boolean
}

const props = defineProps<{
  segments: TimelineSegment[]
  videoDuration: number
  currentTime: number
}>()

const emit = defineEmits<{
  seekTo: [time: number]
  updateSegment: [index: number, segment: TimelineSegment]
}>()

const timelineRef = ref<HTMLElement>()
const isDragging = ref(false)

const timeToPixel = (time: string) => {
  const [minutes, seconds] = time.split(':').map(Number)
  const totalSeconds = minutes * 60 + seconds

  // 確保即使時間超出videoDuration也能正常計算位置
  if (props.videoDuration <= 0) {
    console.log('⚠️ 影片時長為0，無法計算位置')
    return 0
  }

  const position = (totalSeconds / props.videoDuration) * 100

  // 不限制位置範圍，允許超出100%的位置
  console.log(`📍 時間 ${time} (${totalSeconds}s) 轉換為位置: ${position}%`)

  return position
}

// 將時間字串轉換為秒數
const timeStringToSeconds = (timeStr: string): number => {
  const [minutes, seconds] = timeStr.split(':').map(Number)
  return minutes * 60 + seconds
}

// 格式化時間顯示
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 計算適當的刻度數量，基於影片時長
const scaleMarks = computed(() => {
  if (!props.videoDuration || props.videoDuration <= 0) {
    console.log('⚠️ 時間軸：無有效的影片時長資料')
    return []
  }

  console.log('🕐 時間軸：收到的影片時長:', props.videoDuration, '秒')
  console.log('🕐 時間軸：格式化時長:', formatTime(props.videoDuration))

  // 根據影片時長決定刻度間隔
  let interval: number
  let marksCount: number

  if (props.videoDuration <= 60) {
    // 1分鐘以內，每10秒一個刻度
    interval = 10
    marksCount = Math.ceil(props.videoDuration / interval) + 1
  } else if (props.videoDuration <= 300) {
    // 5分鐘以內，每30秒一個刻度
    interval = 30
    marksCount = Math.ceil(props.videoDuration / interval) + 1
  } else if (props.videoDuration <= 600) {
    // 10分鐘以內，每60秒一個刻度
    interval = 60
    marksCount = Math.ceil(props.videoDuration / interval) + 1
  } else {
    // 10分鐘以上，每120秒一個刻度
    interval = 120
    marksCount = Math.ceil(props.videoDuration / interval) + 1
  }

  console.log('📏 時間軸：刻度間隔:', interval, '秒，刻度數量:', marksCount)

  const marks = []
  for (let i = 0; i < marksCount; i++) {
    const timeInSeconds = i * interval
    if (timeInSeconds <= props.videoDuration) {
      marks.push({
        time: timeInSeconds,
        label: formatTime(timeInSeconds),
        position: (timeInSeconds / props.videoDuration) * 100
      })
    }
  }

  // 確保最後一個刻度是影片結束時間
  if (marks.length > 0 && marks[marks.length - 1].time < props.videoDuration) {
    marks.push({
      time: props.videoDuration,
      label: formatTime(props.videoDuration),
      position: 100
    })
  }

  console.log('📏 時間軸刻度生成完成:', marks.map(m => m.label).join(', '))
  return marks
})

// 處理片段點擊，跳轉到片段開始時間
const handleSegmentClick = (segment: TimelineSegment) => {
  const startSeconds = timeStringToSeconds(segment.startTime)
  emit('seekTo', startSeconds)
  console.log('🎯 點擊片段，跳轉到時間:', segment.startTime, '(', startSeconds, '秒)')
}

const handleTimelineClick = (event: MouseEvent) => {
  if (!timelineRef.value) return

  const rect = timelineRef.value.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percentage = clickX / rect.width
  const seekTime = percentage * props.videoDuration

  emit('seekTo', seekTime)
  console.log('🎯 點擊時間軸，跳轉到:', formatTime(seekTime))
}
</script>

<template>
  <div class="video-timeline">
    <div ref="timelineRef" class="timeline-container" @click="handleTimelineClick">
      <!-- 時間軸背景 -->
      <div class="timeline-track"></div>

      <!-- 高亮片段 -->
      <div v-for="(segment, index) in segments" :key="index" class="timeline-segment"
        :class="{ 'highlighted': segment.isHighlight }" :style="{
          left: timeToPixel(segment.startTime) + '%',
          width: (timeToPixel(segment.endTime) - timeToPixel(segment.startTime)) + '%'
        }" @click.stop="handleSegmentClick(segment)">
        <div class="segment-label">{{ segment.startTime }}</div>
      </div>

      <!-- 播放進度指示器 -->
      <div class="playhead" :style="{ left: (currentTime / videoDuration) * 100 + '%' }"></div>
    </div>

    <!-- 時間刻度 -->
    <div class="timeline-scale">
      <div v-for="mark in scaleMarks" :key="mark.time" class="scale-mark" :style="{ left: mark.position + '%' }">
        {{ mark.label }}
      </div>
    </div>

    <!-- 調試信息 -->
    <div v-if="false" class="debug-timeline">
      <p>影片時長: {{ formatTime(videoDuration) }} ({{ videoDuration }}秒)</p>
      <p>當前時間: {{ formatTime(currentTime) }}</p>
      <p>片段數量: {{ segments.length }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.video-timeline {
  width: 100%;
  padding: 20px 0;
}

.timeline-container {
  position: relative;
  height: 46px;
  background: #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  overflow-x: visible;
  min-width: 100%;
}

.timeline-track {
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, #e0e0e0, #f5f5f5);
}

.timeline-segment {
  position: absolute;
  top: 8px;
  height: 30px;
  background: rgba(66, 133, 244, 0.3);
  border: 2px solid #4285f4;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 2px;
  z-index: 5;

  &.highlighted {
    background: rgba(66, 133, 244, 0.8);
    border-color: #3367d6;
    z-index: 6;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 7;
  }
}

.segment-label {
  padding: 2px 6px;
  font-size: 11px;
  color: white;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.playhead {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background: #ff4444;
  pointer-events: none;
  z-index: 10;

  &::before {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    width: 10px;
    height: 10px;
    background: #ff4444;
    border-radius: 50%;
  }
}

.timeline-scale {
  display: flex;
  position: relative;
  height: 20px;
  margin-top: 8px;
}

.scale-mark {
  position: absolute;
  font-size: 11px;
  color: #666;
  transform: translateX(-50%);
  white-space: nowrap;
  font-weight: 500;
}

.debug-timeline {
  margin-top: 10px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  font-size: 12px;

  p {
    margin: 2px 0;
    color: #666;
  }
}
</style>