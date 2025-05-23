<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  videoFile: {
    type: Object,
    default: null
  },
  isProcessing: {
    type: Boolean,
    default: false
  }
})

const videoUrl = ref('')
const videoRef = ref(null)

watch(() => props.videoFile, (newFile) => {
  if (newFile) {
    videoUrl.value = URL.createObjectURL(newFile)
  } else {
    videoUrl.value = ''
  }
})
</script>

<template>
  <div class="video-preview">
    <div v-if="!videoFile" class="empty-state">
      <span class="preview-icon">🎥</span>
      <p>請先上傳影片</p>
    </div>

    <div v-else class="preview-content">
      <div v-if="isProcessing" class="processing-message">
        <p>正在處理影片...</p>
      </div>
      
      <div v-else class="video-container">
        <video
          ref="videoRef"
          :src="videoUrl"
          controls
          class="video-player"
        ></video>
        
        <div class="transcript-overlay">
          <!-- TODO: 添加轉錄稿覆蓋層 -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.video-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  gap: 1rem;
}

.preview-icon {
  font-size: 3rem;
}

.preview-content {
  flex: 1;
  position: relative;
}

.processing-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #666;
}

.video-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

.transcript-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
}
</style> 