<script setup lang="ts">
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

interface Props {
  transcriptData: TranscriptData | null
  currentTime?: number
}

interface Emits {
  (e: 'toggle-highlight', sectionIndex: number, sentenceIndex: number): void
  (e: 'jump-to-time', timeString: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 將時間字串轉換為秒數
const timeStringToSeconds = (timeStr: string): number => {
  const [minutes, seconds] = timeStr.split(':').map(Number)
  return minutes * 60 + seconds
}

// 檢查句子是否是當前播放的句子
const isCurrentSentence = (sentence: Sentence): boolean => {
  if (props.currentTime === undefined || !props.transcriptData) return false

  const currentTime = props.currentTime || 0

  // 找到所有已經開始的句子（添加0.1秒容錯）
  const allSentences: { sentence: Sentence, startSeconds: number }[] = []
  props.transcriptData.transcript.sections.forEach(section => {
    section.sentences.forEach(s => {
      const startSeconds = timeStringToSeconds(s.startTime)
      if (startSeconds <= currentTime + 0.1) {
        allSentences.push({ sentence: s, startSeconds })
      }
    })
  })

  if (allSentences.length === 0) return false

  // 找到最接近當前時間的句子（最大的startTime）
  const currentSentenceData = allSentences.reduce((latest, current) =>
    current.startSeconds > latest.startSeconds ? current : latest
  )

  console.log('🎯 當前時間:', currentTime, '選中句子:', currentSentenceData.sentence.startTime, currentSentenceData.sentence.text)

  return currentSentenceData.sentence === sentence
}

const handleSentenceClick = (sectionIndex: number, sentenceIndex: number) => {
  if (props.transcriptData) {
    const sentence = props.transcriptData.transcript.sections[sectionIndex].sentences[sentenceIndex]

    // 只跳轉到對應時間，不再處理高亮
    emit('jump-to-time', sentence.startTime)

    console.log('🎯 點擊句子:', sentence.text, '時間:', sentence.startTime)
  }
}

// 處理標記按鈕點擊
const handleMarkClick = (event: Event, sectionIndex: number, sentenceIndex: number) => {
  event.stopPropagation() // 防止觸發句子點擊事件
  emit('toggle-highlight', sectionIndex, sentenceIndex)
  console.log('📌 標記/取消標記句子')
}
</script>

<template>
  <div class="transcript-viewer">
    <div v-if="!transcriptData" class="empty-state">
      <p>暫無轉錄內容</p>
    </div>

    <div v-else class="transcript-content">
      <div class="transcript-header">
        <h2>Transcript</h2>
      </div>

      <div class="transcript-body">
        <div v-for="(section, sectionIndex) in transcriptData.transcript.sections" :key="sectionIndex" class="section">
          <h3 class="section-title">{{ section.title }}</h3>

          <div class="sentences">
            <div v-for="(sentence, sentenceIndex) in section.sentences" :key="sentenceIndex" class="sentence-item"
              :class="{
                'highlighted': sentence.isHighlight,
                'current': isCurrentSentence(sentence)
              }" @click="handleSentenceClick(sectionIndex, sentenceIndex)">
              <span class="time-stamp">{{ sentence.startTime }}</span>
              <span class="sentence-text">{{ sentence.text }}</span>

              <!-- Mark 按鈕，用於標記/取消標記 -->
              <div class="mark-btn" @click="handleMarkClick($event, sectionIndex, sentenceIndex)">
                {{ sentence.isHighlight ? '×' : 'mark' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.transcript-viewer {
  height: 100%;
  width: 100%;
  background: #e8e8e8;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  font-size: 1.1rem;
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
  align-items: center;
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

  &.current {
    background: #4caf50;
    color: white;

    .time-stamp {
      color: rgba(255, 255, 255, 0.9);
    }

    &:hover {
      background: #45a049;
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

.mark-btn {
  margin-left: 10px;
  min-width: 40px;
  height: 24px;
  background: transparent;
  color: #666;
  border: 1px solid #ccc;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  line-height: 1;
  text-align: center;
  padding: 0 6px;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
    border-color: #999;
  }

  .highlighted & {
    background: transparent;
    color: white;
    border-color: rgba(255, 255, 255, 0.6);

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: white;
    }
  }

  .current & {
    background: transparent;
    color: white;
    border-color: rgba(255, 255, 255, 0.6);

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: white;
    }
  }
}
</style>