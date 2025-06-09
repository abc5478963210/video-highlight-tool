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
  return (totalSeconds / props.videoDuration) * 100
}

// 將時間字串轉換為秒數
const timeStringToSeconds = (timeStr: string): number => {
  const [minutes, seconds] = timeStr.split(':').map(Number)
  return minutes * 60 + seconds
}

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
      <div v-for="i in 10" :key="i" class="scale-mark" :style="{ left: (i * 10) + '%' }">
        {{ Math.floor((i * videoDuration) / 10 / 60) }}:{{ String(Math.floor((i * videoDuration) / 10 % 60)).padStart(2,
          '0') }}
      </div>
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
  height: 60px;
  background: #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
}

.timeline-track {
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, #e0e0e0, #f5f5f5);
}

.timeline-segment {
  position: absolute;
  top: 10px;
  height: 40px;
  background: rgba(66, 133, 244, 0.3);
  border: 2px solid #4285f4;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &.highlighted {
    background: rgba(66, 133, 244, 0.8);
    border-color: #3367d6;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
}

.segment-label {
  padding: 2px 6px;
  font-size: 12px;
  color: white;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  font-size: 12px;
  color: #666;
  transform: translateX(-50%);
}
</style>