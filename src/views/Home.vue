<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToEditor = () => {
  router.push('/highlight-tool')
}
</script>

<template>
  <div class="home-container">
    <a-card class="welcome-card">
      <template #title>
        <div class="title-container">
          <h1>Video Highlight Tool</h1>
          <p class="subtitle">Quick Marking, Easy Editing, Smart Generation</p>
          <button class="btn-main" @click="goToEditor">
            Start Editing
          </button>
        </div>
      </template>
    </a-card>
  </div>
</template>

<style scoped lang="scss">
@import '../styles/variables';
@import '../styles/mixins';

.home-container {
  min-height: 100vh;
  @include flex(column, center, center);
  padding: $spacing-xl;
  @include gradient-bg;
}

.welcome-card {
  width: 100%;
  background-color: rgba(255, 255, 255, 0);
  border: none;

  :deep(.ant-card-head) {
    border-bottom: 1px solid rgba($primary-color, 0.1);
  }

  :deep(.ant-card-head-title) {
    padding: $spacing-lg 0;
  }
}

.title-container {
  text-align: center;

  h1 {
    color: $text-primary;
    margin-bottom: $spacing-sm;
  }

  .subtitle {
    color: $text-secondary;
    font-size: 1.2rem;
    margin-bottom: $spacing-lg;
  }
}

.feature-list {
  @include flex(column, center, center);
  gap: $spacing-md;
  margin: $spacing-lg 0;
}

.feature-item {
  @include flex(row, flex-start, center);
  gap: $spacing-md;
  color: $text-primary;

  .icon {
    font-size: 1.5rem;
  }
}

.description {
  color: $text-secondary;
  text-align: center;
  margin-top: $spacing-lg;
}
</style>