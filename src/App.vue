<script setup lang="ts">
// App.vue 現在只負責路由視圖的渲染
import { ref, onMounted, onUnmounted } from 'vue';

const isMobileLandscape = ref(false);

function checkMobileLandscape() {
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  isMobileLandscape.value = isMobile && window.matchMedia('(orientation: landscape)').matches;
  // 掛到window，方便全局存取
  (window as any).isMobileLandscape = isMobileLandscape.value;
}

onMounted(() => {
  checkMobileLandscape();
  window.addEventListener('resize', checkMobileLandscape);
  window.addEventListener('orientationchange', checkMobileLandscape);
});
onUnmounted(() => {
  window.removeEventListener('resize', checkMobileLandscape);
  window.removeEventListener('orientationchange', checkMobileLandscape);
});
</script>

<template>
  <router-view></router-view>
</template>

<style>
/* 全局樣式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
}
</style>
