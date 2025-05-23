<script setup>
import { ref } from 'vue'

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

const emit = defineEmits(['file-upload'])

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    console.log("📤 選擇檔案：", file.name)
    emit('file-upload', file)
  }
}
</script>

<template>
  <div class="video-editor">
    <div v-if="!videoFile" class="upload-area">
      <input
        type="file"
        accept="video/*"
        @change="handleFileChange"
        class="file-input"
      />
      <div class="upload-prompt">
        <span class="upload-icon">📁</span>
        <p>點擊或拖放影片檔案至此處</p>
      </div>
    </div>

    <div v-else class="editor-content">
      <div v-if="isProcessing" class="processing-overlay">
        <div class="spinner"></div>
        <p>正在處理影片...</p>
      </div>
      
      <div v-else class="transcript-section">
        <h2>影片轉錄稿</h2>
        <!-- TODO: 添加轉錄稿內容 -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.video-editor {
  height: 100%;
  position: relative;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  position: relative;
}

.file-input {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  cursor: pointer;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  font-size: 3rem;
}

.processing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.transcript-section {
  padding: 1rem;
}
</style> 