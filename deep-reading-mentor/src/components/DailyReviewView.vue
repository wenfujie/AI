<script setup lang="ts">
import type { DueReviewItem, ReviewDifficulty } from '~/composables'

defineProps<{
  items: DueReviewItem[]
  onGoToBookshelf: () => void
  onRateReview: (bookId: string, qaTimestamp: number, difficulty: ReviewDifficulty) => void
}>()

function daysFromNow(ts: number) {
  const now = Date.now()
  return Math.round((ts - now) / (1000 * 60 * 60 * 24))
}

function isOverdue(ts: number) {
  return ts < Date.now() - 24 * 60 * 60 * 1000
}
</script>

<template>
  <section class="view-section">
    <div class="top-bar">
      <div>
        <h1>📅 今日复习</h1>
        <p>间隔重复 · 遗忘曲线计划</p>
      </div>
      <button class="btn ghost" @click="onGoToBookshelf">
        返回书架
      </button>
    </div>

    <article class="card">
      <p class="hint">
        建议按难度反馈：困难→1天，良好→2倍间隔，简单→3倍间隔。
      </p>
    </article>

    <div v-if="items.length === 0" class="empty-state">
      <h3>今日无待复习</h3>
      <p>完成问答后系统会自动安排复习计划。</p>
    </div>

    <div v-else class="review-list">
      <article v-for="item in items" :key="`${item.bookId}-${item.timestamp}`" class="review-card" :class="{ overdue: isOverdue(item.nextReviewDate) }">
        <div>
          <h3>📖 {{ item.bookTitle }}</h3>
          <p>{{ item.question }}</p>
          <small>上次回答：{{ item.answer.slice(0, 60) }}{{ item.answer.length > 60 ? '…' : '' }}</small>
          <small v-if="isOverdue(item.nextReviewDate)">超期 {{ Math.abs(daysFromNow(item.nextReviewDate)) }} 天</small>
          <small v-else>今天复习</small>
        </div>
        <div class="difficulty-row">
          <button class="btn danger" @click="onRateReview(item.bookId, item.timestamp, 'hard')">
            困难
          </button>
          <button class="btn good" @click="onRateReview(item.bookId, item.timestamp, 'good')">
            良好
          </button>
          <button class="btn easy" @click="onRateReview(item.bookId, item.timestamp, 'easy')">
            简单
          </button>
        </div>
      </article>
    </div>
  </section>
</template>
