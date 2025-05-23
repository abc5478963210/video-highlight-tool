<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { callApi } from '@/utils/callApi'
import { processVideo } from '@/api/video'
import {
  ArrowLeftOutlined,
  UploadOutlined,
  VideoCameraOutlined
} from '@ant-design/icons-vue'
import { UploadProps } from 'ant-design-vue'

const router = useRouter()
const videoFile = ref<File | null>(null)
const isProcessing = ref(false)
const videoUrl = ref<string>('')

const handleUpload: UploadProps['customRequest'] = async ({ file }) => {
  if (file instanceof File) {
    console.log("📥 接收到檔案上傳：", file.name)
    try {
      const response = await callApi(processVideo(file))
      console.log("✅ API 回應：", response)
      videoFile.value = file
      videoUrl.value = URL.createObjectURL(file)
      isProcessing.value = true
      // TODO: 模擬 AI 處理
      setTimeout(() => {
        isProcessing.value = false
      }, 2000)
    } catch (error) {
      console.log("❌ API 錯誤：", error)
      // 可以加入錯誤處理，例如顯示錯誤訊息
    }
  }
}

const goBack = () => {
  router.push('/')
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

                <div v-else>
                  <h2>影片轉錄稿</h2>
                  <!-- TODO: 添加轉錄稿內容 -->
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
                <div v-if="isProcessing" class="processing-message">
                  <p>正在處理影片...</p>
                </div>

                <div v-else>
                  <video :src="videoUrl" controls class="video-player"></video>

                  <div class="transcript-overlay">
                    <!-- TODO: 添加轉錄稿覆蓋層 -->
                  </div>
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

    h1 {
      margin: 0;
      color: $text-primary;
      font-weight: 500;
      background: linear-gradient(90deg, $text-primary 0%, $primary-light 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

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
  // border-radius: $border-radius-md;
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
  padding: $spacing-lg;
  background: rgba($bg-dark, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: $text-primary;
  border-top: 1px solid $border-color;
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