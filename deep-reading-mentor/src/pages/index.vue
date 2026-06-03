<script setup lang="ts">
import type { Book, MentorView, ReadingIntent } from '~/composables'
import { reactive, ref } from 'vue'
import BookshelfView from '~/components/BookshelfView.vue'
import DailyReviewView from '~/components/DailyReviewView.vue'
import MentorConfirmDialog from '~/components/MentorConfirmDialog.vue'
import MentorNoticeToast from '~/components/MentorNoticeToast.vue'
import MentorSidebar from '~/components/MentorSidebar.vue'
import ReadingView from '~/components/ReadingView.vue'
import ReviewView from '~/components/ReviewView.vue'
import TopicsView from '~/components/TopicsView.vue'
import { useReadingMentor } from '~/composables'

import '~/styles/mentor.css'

defineOptions({
  name: 'IndexPage',
})

const {
  state,
  stageNames,
  activeBook,
  activeTopic,
  dueReviewItems,
  dueReviewCount,
  allReviewCards,
  getStageQuestions,
  maxStageForBook,
  goToView,
  addBook,
  deleteBook,
  openBook,
  saveBookMeta,
  goToStage,
  nextStage,
  prevStage,
  resetBookProgress,
  submitStageAnswer,
  savePreviewNote,
  addReadingNote,
  removeReadingNote,
  addRiaNote,
  removeRiaNote,
  addCornellNote,
  removeCornellNote,
  saveSummary,
  createTopic,
  openTopic,
  closeTopicDetail,
  addTopicNode,
  submitTopicAnswer,
  getTopicBooks,
  rateReview,
  refreshReviewDeck,
} = useReadingMentor()

const navItems: Array<{ label: string, view: MentorView }> = [
  { label: '📖 我的书架', view: 'bookshelf' },
  { label: '🧭 阅读流程', view: 'reading' },
  { label: '🔗 主题研究', view: 'topics' },
  { label: '📅 今日复习', view: 'daily-review' },
  { label: '🔄 全部复习', view: 'review' },
]

const notice = ref('')
const confirmState = reactive({
  open: false,
  message: '',
  onConfirm: null as null | (() => void),
})

function formatDate(ts: number) {
  const date = new Date(ts)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

function reviewBadgeFor(view: MentorView) {
  if (view === 'bookshelf')
    return state.books.length

  if (view === 'topics')
    return state.topics.length

  if (view === 'daily-review')
    return dueReviewCount.value

  return null
}

function pushNotice(message: string) {
  notice.value = message
  window.setTimeout(() => {
    if (notice.value === message)
      notice.value = ''
  }, 1800)
}

function askConfirm(message: string, onConfirm: () => void) {
  confirmState.open = true
  confirmState.message = message
  confirmState.onConfirm = onConfirm
}

function closeConfirm() {
  confirmState.open = false
  confirmState.message = ''
  confirmState.onConfirm = null
}

function runConfirm() {
  confirmState.onConfirm?.()
  closeConfirm()
}

function onSwitchView(view: MentorView) {
  if (view === 'reading' && state.books.length === 0) {
    pushNotice('请先添加一本书')
    goToView('bookshelf')
    return
  }

  goToView(view)
}

function onCreateBook(payload: { title: string, author: string, readingIntent: ReadingIntent, topicName: string }): Book | null {
  return addBook({
    title: payload.title,
    author: payload.author,
    readingIntent: payload.readingIntent,
    topicName: payload.topicName,
  })
}

function onDeleteBook(bookId: string) {
  askConfirm('确定删除这本书吗？', () => {
    deleteBook(bookId)
    pushNotice('已删除')
  })
}

function onResetBook() {
  askConfirm('确定重新开始？笔记会保留，仅重置进度。', () => {
    resetBookProgress()
    pushNotice('进度已重置')
  })
}
</script>

<template>
  <div class="mentor-page">
    <MentorNoticeToast :message="notice" />
    <MentorConfirmDialog
      :open="confirmState.open"
      :message="confirmState.message"
      @cancel="closeConfirm"
      @confirm="runConfirm"
    />

    <MentorSidebar
      :current-view="state.currentView"
      :nav-items="navItems"
      :review-badge-for="reviewBadgeFor"
      @switch-view="onSwitchView"
    />

    <main class="main-content">
      <BookshelfView
        v-if="state.currentView === 'bookshelf'"
        :books="state.books"
        :on-create-book="onCreateBook"
        :on-open-book="openBook"
        :on-delete-book="onDeleteBook"
      />

      <ReadingView
        v-else-if="state.currentView === 'reading'"
        :book="activeBook"
        :stage-names="stageNames"
        :max-stage-for-book="maxStageForBook"
        :get-stage-questions="getStageQuestions"
        :format-date="formatDate"
        :on-go-to-bookshelf="() => goToView('bookshelf')"
        :on-prev-stage="prevStage"
        :on-next-stage="nextStage"
        :on-go-to-stage="goToStage"
        :on-save-prep-meta="saveBookMeta"
        :on-save-preview-note="savePreviewNote"
        :on-add-reading-note="addReadingNote"
        :on-remove-reading-note="removeReadingNote"
        :on-add-ria-note="addRiaNote"
        :on-remove-ria-note="removeRiaNote"
        :on-add-cornell-note="addCornellNote"
        :on-remove-cornell-note="removeCornellNote"
        :on-save-summary="saveSummary"
        :on-submit-stage-answer="submitStageAnswer"
        :on-reset-book="onResetBook"
        :on-notify="pushNotice"
      />

      <TopicsView
        v-else-if="state.currentView === 'topics'"
        :topics="state.topics"
        :active-topic="activeTopic"
        :get-topic-books="getTopicBooks"
        :on-open-book="openBook"
        :on-open-topic="openTopic"
        :on-close-topic-detail="closeTopicDetail"
        :on-create-topic="createTopic"
        :on-add-topic-node="addTopicNode"
        :on-submit-topic-answer="submitTopicAnswer"
      />

      <DailyReviewView
        v-else-if="state.currentView === 'daily-review'"
        :items="dueReviewItems"
        :on-go-to-bookshelf="() => goToView('bookshelf')"
        :on-rate-review="rateReview"
      />

      <ReviewView
        v-else
        :cards="allReviewCards"
        :books="state.books"
        :on-go-to-bookshelf="() => goToView('bookshelf')"
        :on-refresh-review-deck="refreshReviewDeck"
      />
    </main>
  </div>
</template>
