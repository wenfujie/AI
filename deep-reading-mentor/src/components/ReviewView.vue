<script setup lang="ts">
import type { Book, DueReviewItem } from '~/composables'

const props = defineProps<{
  cards: DueReviewItem[]
  books: Book[]
  onGoToBookshelf: () => void
  onRefreshReviewDeck: () => void
}>()

const flippedCards = reactive<Record<string, boolean>>({})

const questionCount = computed(() => props.books.reduce((sum, book) => sum + book.qa.length, 0))

function toggleCard(cardId: string) {
  flippedCards[cardId] = !flippedCards[cardId]
}
</script>

<template>
  <section class="view-section">
    <div class="top-bar">
      <div>
        <h1>🔄 全部复习</h1>
        <p>闪卡模式 · 主动回忆</p>
      </div>
      <button class="btn ghost" @click="onGoToBookshelf">
        返回书架
      </button>
    </div>

    <div v-if="cards.length === 0" class="empty-state">
      <h3>暂无闪卡</h3>
      <p>完成阅读问答后这里会出现复习卡片。</p>
    </div>

    <template v-else>
      <article class="card">
        <p class="hint">
          共 {{ questionCount }} 条问答，点击翻转查看答案。
        </p>
      </article>

      <div class="flashcard-grid">
        <button
          v-for="qa in cards"
          :key="`${qa.bookId}-${qa.timestamp}`"
          class="flashcard"
          :class="{ flipped: flippedCards[`all-${qa.bookId}-${qa.timestamp}`] }"
          @click="toggleCard(`all-${qa.bookId}-${qa.timestamp}`)"
        >
          <span class="front">📖 {{ qa.bookTitle }} · {{ qa.question }}</span>
          <span class="back">💡 {{ qa.answer || '（未回答）' }}</span>
        </button>
      </div>

      <div class="center-card">
        <button class="btn ghost" @click="onRefreshReviewDeck">
          换一批
        </button>
      </div>
    </template>
  </section>
</template>
