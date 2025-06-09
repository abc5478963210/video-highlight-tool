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

  // 手機端調整
  @media (max-width: 768px) {
    padding: $spacing-md;
  }
}

.welcome-card {
  width: 100%;
  background-color: rgba(255, 255, 255, 0);
  border: none;
  max-width: 100%;

  :deep(.ant-card-head) {
    border-bottom: 1px solid rgba($primary-color, 0.1);
  }

  :deep(.ant-card-head-title) {
    padding: $spacing-lg 0;

    // 手機端調整
    @media (max-width: 768px) {
      padding: $spacing-md 0;
    }
  }
}

.title-container {
  text-align: center;
  max-width: 100%;
  word-wrap: break-word;

  h1 {
    color: $text-primary;
    margin-bottom: $spacing-sm;
    font-size: 3.5rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    line-height: 1.1;

    // 手機端響應式調整
    @media (max-width: 768px) {
      font-size: 2.5rem;
      letter-spacing: 0.04em;
      margin-bottom: $spacing-xs;
      line-height: 1.2;
    }

    @media (max-width: 480px) {
      font-size: 1.8rem;
      letter-spacing: 0.02em;
      word-break: break-word;
      hyphens: auto;
    }

    @media (max-width: 360px) {
      font-size: 1.5rem;
      letter-spacing: 0.01em;
    }
  }

  .subtitle {
    color: $text-secondary;
    font-size: 1.2rem;
    margin-bottom: $spacing-lg;
    line-height: 1.4;

    // 手機端調整
    @media (max-width: 768px) {
      font-size: 1rem;
      margin-bottom: $spacing-md;
      padding: 0 $spacing-sm;
    }

    @media (max-width: 480px) {
      font-size: 0.9rem;
      margin-bottom: $spacing-sm;
    }
  }

  .btn-main {
    display: inline-block;
    padding: 0.75em 2.5em;
    border-radius: 2em;
    background: #fff;
    color: #120f2d;
    font-weight: 700;
    font-size: 1.1rem;
    border: none;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
    transition: box-shadow 0.2s, background 0.2s, color 0.2s;
    cursor: pointer;
    margin: 1.5rem auto 0 auto;

    // 手機端調整
    @media (max-width: 768px) {
      padding: 0.6em 2em;
      font-size: 1rem;
      margin: 1rem auto 0 auto;
    }

    @media (max-width: 480px) {
      padding: 0.5em 1.5em;
      font-size: 0.9rem;
      margin: 0.8rem auto 0 auto;
    }

    &:hover {
      box-shadow: 0 4px 32px rgba(0, 0, 0, 0.18);
      background: $primary-color;
      color: #fff;
    }
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