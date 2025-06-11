<script setup lang="ts">
import router from '@/router'
import {
  ArrowLeftOutlined,
} from '@ant-design/icons-vue'
// 無需 props，僅 slot
const goBack = () => {
  router.go(-1)
}
</script>
<template>
  <header class="header">
    <div class="header-content">
      <a-button type="link" @click="goBack">
        <template #icon><arrow-left-outlined /></template>
        back
      </a-button>
      <span class="header-title">Video Highlight Tool</span>
    </div>
  </header>
</template>



<style scoped lang="scss">
.header {
  background: rgba(26, 26, 46, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 0 24px;
  border-bottom: 1px solid rgba(157, 142, 199, 0.2);
  position: relative;
  z-index: 1;

  .header-content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 64px;

    .header-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #fff;
    }
  }
}
</style>