<script setup lang="ts">
import type { StageKey } from '~/composables'
import { computed, reactive, ref, watch } from 'vue'
import { stageKeys, useReadingMentor } from '~/composables'

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

const navItems = [
  { label: '📖 我的书架', view: 'bookshelf' as const },
  { label: '🧭 阅读流程', view: 'reading' as const },
  { label: '🔗 主题研究', view: 'topics' as const },
  { label: '📅 今日复习', view: 'daily-review' as const },
  { label: '🔄 全部复习', view: 'review' as const },
]

const showAddBookForm = ref(false)
const addBookForm = reactive({
  title: '',
  author: '',
  readingIntent: 'intensive' as 'intensive' | 'extensive',
  topicName: '',
})

const newTopicName = ref('')
const topicNodeName = ref('')
const topicNodeConnections = ref('')
const topicQaInput = ref('')

const prepForm = reactive({
  title: '',
  author: '',
  goal: '',
})

const previewInput = ref('')
const freeNoteInput = ref('')
const summaryInput = ref('')
const noteTab = ref<'free' | 'ria' | 'cornell'>('free')

const riaForm = reactive({
  excerpt: '',
  interpretation: '',
  experience: '',
  action: '',
})

const cornellForm = reactive({
  cues: '',
  notes: '',
  summary: '',
})

const stageQaInput = reactive<Record<StageKey, string>>({
  preparation: '',
  preview: '',
  reading: '',
  reflection: '',
  consolidation: '',
})

const flippedCards = reactive<Record<string, boolean>>({})
const notice = ref('')
const confirmState = reactive({
  open: false,
  message: '',
  onConfirm: null as null | (() => void),
})

const stageKey = computed<StageKey | null>(() => {
  if (!activeBook.value)
    return null

  return stageKeys[activeBook.value.currentStage] ?? null
})

const stageProgress = computed(() => {
  if (!activeBook.value)
    return []

  const maxStage = maxStageForBook(activeBook.value)
  return stageNames
    .map((name, index) => ({ name, index }))
    .filter(item => item.index <= maxStage)
})

const previewStageNotes = computed(() => {
  if (!activeBook.value)
    return []

  return activeBook.value.notes.filter(note => note.stage === 'preview')
})

const readingStageNotes = computed(() => {
  if (!activeBook.value)
    return []

  return activeBook.value.notes.filter(note => note.stage === 'reading')
})

const consolidationCards = computed(() => {
  if (!activeBook.value)
    return []

  return activeBook.value.qa.filter(qa => qa.stage !== 'consolidation').slice(-6)
})

const topicBooks = computed(() => {
  if (!activeTopic.value)
    return []

  return getTopicBooks(activeTopic.value.id)
})

watch(
  activeBook,
  (book) => {
    if (!book)
      return

    prepForm.title = book.title
    prepForm.author = book.author
    prepForm.goal = book.goal
    summaryInput.value = book.summary
    previewInput.value = ''
    freeNoteInput.value = ''
  },
  { immediate: true },
)

function formatDate(ts: number) {
  const date = new Date(ts)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

function daysFromNow(ts: number) {
  const now = Date.now()
  return Math.round((ts - now) / (1000 * 60 * 60 * 24))
}

function stageHistory(key: StageKey) {
  return activeBook.value?.qa.filter(qa => qa.stage === key) ?? []
}

function stageNextQuestion(key: StageKey) {
  const existing = stageHistory(key)
  const asked = new Set(existing.map(qa => qa.question))
  const unanswered = getStageQuestions(key).filter(question => !asked.has(question))
  if (unanswered.length > 0)
    return `${existing.length > 0 ? '下一个问题：' : '开始吧：'} ${unanswered[0]}`

  return '太棒了！本轮问题已全部回答。'
}

function reviewBadgeFor(view: string) {
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

function onSwitchView(view: 'bookshelf' | 'reading' | 'topics' | 'daily-review' | 'review') {
  if (view === 'reading' && state.books.length === 0) {
    pushNotice('请先添加一本书')
    goToView('bookshelf')
    return
  }

  goToView(view)
}

function onSubmitAddBook() {
  const created = addBook({
    title: addBookForm.title,
    author: addBookForm.author,
    readingIntent: addBookForm.readingIntent,
    topicName: addBookForm.topicName,
  })

  if (!created)
    return

  addBookForm.title = ''
  addBookForm.author = ''
  addBookForm.readingIntent = 'intensive'
  addBookForm.topicName = ''
  showAddBookForm.value = false
}

function onDeleteBook(bookId: string) {
  askConfirm('确定删除这本书吗？', () => {
    deleteBook(bookId)
    pushNotice('已删除')
  })
}

function onSavePrepMeta() {
  saveBookMeta({
    title: prepForm.title,
    author: prepForm.author,
    goal: prepForm.goal,
  })
  pushNotice('已保存')
}

function onSubmitStageQa(key: StageKey) {
  submitStageAnswer(key, stageQaInput[key])
  stageQaInput[key] = ''
}

function onSavePreviewNotes() {
  const ok = savePreviewNote(previewInput.value)
  if (!ok)
    return

  previewInput.value = ''
}

function onSaveReadingNote() {
  const ok = addReadingNote(freeNoteInput.value)
  if (!ok)
    return

  freeNoteInput.value = ''
}

function onSaveRiaNote() {
  const ok = addRiaNote(riaForm)
  if (!ok) {
    pushNotice('请至少填写“用自己的话解释（I）”')
    return
  }

  riaForm.excerpt = ''
  riaForm.interpretation = ''
  riaForm.experience = ''
  riaForm.action = ''
}

function onSaveCornellNote() {
  const ok = addCornellNote(cornellForm)
  if (!ok) {
    pushNotice('请至少填写关键词或详细笔记')
    return
  }

  cornellForm.cues = ''
  cornellForm.notes = ''
  cornellForm.summary = ''
}

function onSaveSummary() {
  saveSummary(summaryInput.value)
  pushNotice('已保存')
}

function onResetBook() {
  askConfirm('确定重新开始？笔记会保留，仅重置进度。', () => {
    resetBookProgress()
    pushNotice('进度已重置')
  })
}

function onCreateTopic() {
  const topic = createTopic(newTopicName.value)
  if (!topic)
    return

  newTopicName.value = ''
}

function onAddTopicNode() {
  if (!activeTopic.value)
    return

  const ok = addTopicNode(activeTopic.value.id, {
    name: topicNodeName.value,
    connections: topicNodeConnections.value,
  })

  if (!ok)
    return

  topicNodeName.value = ''
  topicNodeConnections.value = ''
}

function onSubmitTopicQa() {
  if (!activeTopic.value)
    return

  const ok = submitTopicAnswer(activeTopic.value.id, topicQaInput.value)
  if (!ok)
    return

  topicQaInput.value = ''
}

function onRateReview(bookId: string, qaTimestamp: number, difficulty: 'hard' | 'good' | 'easy') {
  rateReview(bookId, qaTimestamp, difficulty)
}

function toggleCard(cardId: string) {
  flippedCards[cardId] = !flippedCards[cardId]
}

function isOverdue(ts: number) {
  return ts < Date.now() - 24 * 60 * 60 * 1000
} 
</script>

<template>
  <div class="mentor-page">
    <div v-if="notice" class="toast">
      {{ notice }}
    </div>
    <div v-if="confirmState.open" class="confirm-mask">
      <div class="confirm-card">
        <p>{{ confirmState.message }}</p>
        <div class="confirm-actions">
          <button class="btn ghost" @click="closeConfirm()">
            取消
          </button>
          <button class="btn primary" @click="runConfirm()">
            确认
          </button>
        </div>
      </div>
    </div>

    <aside class="sidebar">
      <div class="logo">
        <span class="logo-mark">📚</span>
        <div>
          <h2>深度阅读导师</h2>
          <p>全方法版</p>
        </div>
      </div>

      <nav class="nav-links">
        <button
          v-for="item in navItems"
          :key="item.view"
          class="nav-link"
          :class="{ active: state.currentView === item.view }"
          @click="onSwitchView(item.view)"
        >
          <span>{{ item.label }}</span>
          <span
            v-if="reviewBadgeFor(item.view) !== null"
            class="badge"
            :class="{ urgent: item.view === 'daily-review' && dueReviewCount > 0 }"
          >
            {{ reviewBadgeFor(item.view) }}
          </span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <p>SQ3R / 费曼 / RIA / 康奈尔 / 间隔重复 / 主题阅读</p>
      </div>
    </aside>

    <main class="main-content">
      <section v-if="state.currentView === 'bookshelf'" class="view-section">
        <div class="top-bar">
          <div>
            <h1>📖 我的书架</h1>
            <p>选择一本书开始深度阅读</p>
          </div>
          <button class="btn primary" @click="showAddBookForm = !showAddBookForm">
            {{ showAddBookForm ? '取消' : '+ 添加新书' }}
          </button>
        </div>

        <div v-if="showAddBookForm" class="card form-grid">
          <label>
            书名
            <input v-model="addBookForm.title" placeholder="例如：思考，快与慢">
          </label>
          <label>
            作者
            <input v-model="addBookForm.author" placeholder="可选">
          </label>
          <label>
            阅读模式
            <select v-model="addBookForm.readingIntent">
              <option value="intensive">
                精读（完整 5 阶段）
              </option>
              <option value="extensive">
                略读（4 阶段）
              </option>
            </select>
          </label>
          <label>
            所属主题
            <input v-model="addBookForm.topicName" placeholder="可选，填写会自动归类或新建主题">
          </label>
          <button class="btn primary" @click="onSubmitAddBook">
            创建并开始阅读
          </button>
        </div>

        <div v-if="state.books.length === 0" class="empty-state">
          <h3>书架空空</h3>
          <p>添加第一本书，开始构建你的深度阅读系统。</p>
        </div>

        <div v-else class="book-grid">
          <article
            v-for="book in state.books"
            :key="book.id"
            class="book-card"
            @click="openBook(book.id)"
          >
            <div class="book-header">
              <h3>{{ book.title }}</h3>
              <button class="icon-danger" @click.stop="onDeleteBook(book.id)">
                删除
              </button>
            </div>
            <p>✍ {{ book.author || '未知作者' }}</p>
            <div class="tag-row">
              <span class="tag">{{ book.readingIntent === 'intensive' ? '📖精读' : '📄略读' }}</span>
              <span v-if="book.topicId" class="tag">🔗主题</span>
              <span class="tag">阶段 {{ book.currentStage + 1 }}/5</span>
            </div>
            <small>
              RIA {{ book.riaNotes.length }} · 康奈尔 {{ book.cornellNotes.length }} · 问答 {{ book.qa.length }}
            </small>
          </article>
        </div>
      </section>

      <section v-else-if="state.currentView === 'reading'" class="view-section">
        <div v-if="!activeBook" class="empty-state">
          <h3>请先选择一本书</h3>
          <button class="btn primary" @click="goToView('bookshelf')">
            返回书架
          </button>
        </div>

        <template v-else>
          <div class="top-bar">
            <div>
              <h1>{{ activeBook.title }}</h1>
              <p>
                ✍ {{ activeBook.author || '未知作者' }} · 阶段 {{ activeBook.currentStage + 1 }}/{{ maxStageForBook(activeBook) + 1 }} ·
                {{ activeBook.readingIntent === 'intensive' ? '精读模式' : '略读模式' }}
              </p>
            </div>
            <div class="toolbar">
              <button class="btn ghost" @click="goToView('bookshelf')">
                书架
              </button>
              <button v-if="activeBook.currentStage > 0" class="btn ghost" @click="prevStage()">
                上一步
              </button>
              <button v-if="activeBook.currentStage < maxStageForBook(activeBook)" class="btn primary" @click="nextStage()">
                完成本阶段
              </button>
            </div>
          </div>

          <div class="stage-bar">
            <button
              v-for="item in stageProgress"
              :key="item.index"
              class="stage-item"
              :class="{ done: item.index < activeBook.currentStage, active: item.index === activeBook.currentStage }"
              @click="goToStage(item.index)"
            >
              {{ item.name }}
            </button>
          </div>

          <div v-if="stageKey === 'preparation'" class="stage-stack">
            <article class="card form-grid">
              <h3>🎯 准备阶段：设定目标</h3>
              <label>书名<input v-model="prepForm.title"></label>
              <label>作者<input v-model="prepForm.author"></label>
              <label>阅读目标<textarea v-model="prepForm.goal" rows="4" /></label>
              <button class="btn primary" @click="onSavePrepMeta">
                保存信息
              </button>
            </article>

            <article class="card qa-box">
              <h3>💬 引导提问</h3>
              <div class="qa-log">
                <template v-for="qa in stageHistory('preparation')" :key="qa.timestamp">
                  <p class="qa-system">🧑‍🏫 {{ qa.question }}</p>
                  <p class="qa-user">你：{{ qa.answer }}</p>
                </template>
                <p class="qa-system">🧑‍🏫 {{ stageNextQuestion('preparation') }}</p>
              </div>
              <div class="qa-input">
                <input
                  v-model="stageQaInput.preparation"
                  placeholder="输入回答…"
                  @keydown.enter="onSubmitStageQa('preparation')"
                >
                <button class="btn primary" @click="onSubmitStageQa('preparation')">
                  提交
                </button>
              </div>
            </article>
          </div>

          <div v-else-if="stageKey === 'preview'" class="stage-stack">
            <article class="card form-grid">
              <h3>🔍 预览阶段：快速浏览</h3>
              <p class="hint">
                花 5-10 分钟翻目录、前言、后记，建立全局结构。
              </p>
              <label>
                结构印象
                <textarea v-model="previewInput" rows="4" placeholder="记录你的结构印象" />
              </label>
              <button class="btn primary" @click="onSavePreviewNotes">
                添加预览笔记
              </button>
              <ul class="note-list">
                <li v-for="note in previewStageNotes" :key="note.timestamp">
                  {{ note.content }}
                  <small>{{ formatDate(note.timestamp) }}</small>
                </li>
              </ul>
            </article>

            <article class="card qa-box">
              <h3>💬 预测性提问</h3>
              <div class="qa-log">
                <template v-for="qa in stageHistory('preview')" :key="qa.timestamp">
                  <p class="qa-system">🧑‍🏫 {{ qa.question }}</p>
                  <p class="qa-user">你：{{ qa.answer }}</p>
                </template>
                <p class="qa-system">🧑‍🏫 {{ stageNextQuestion('preview') }}</p>
              </div>
              <div class="qa-input">
                <input v-model="stageQaInput.preview" placeholder="输入回答…" @keydown.enter="onSubmitStageQa('preview')">
                <button class="btn primary" @click="onSubmitStageQa('preview')">
                  提交
                </button>
              </div>
            </article>
          </div>

          <div v-else-if="stageKey === 'reading'" class="stage-stack">
            <article class="card">
              <h3>📝 深度阅读：笔记系统</h3>
              <div class="tab-row">
                <button class="tab-btn" :class="{ active: noteTab === 'free' }" @click="noteTab = 'free'">
                  自由笔记
                </button>
                <button class="tab-btn" :class="{ active: noteTab === 'ria' }" @click="noteTab = 'ria'">
                  RIA 便签
                </button>
                <button class="tab-btn" :class="{ active: noteTab === 'cornell' }" @click="noteTab = 'cornell'">
                  康奈尔笔记
                </button>
              </div>

              <div v-if="noteTab === 'free'" class="form-grid">
                <label>阅读笔记<textarea v-model="freeNoteInput" rows="4" /></label>
                <button class="btn primary" @click="onSaveReadingNote">
                  添加笔记
                </button>
                <ul class="note-list">
                  <li v-for="note in readingStageNotes" :key="note.timestamp">
                    <span>{{ note.content }}</span>
                    <button class="link-danger" @click="removeReadingNote(note.timestamp)">
                      删除
                    </button>
                  </li>
                </ul>
              </div>

              <div v-if="noteTab === 'ria'" class="form-grid">
                <label>原文摘录（可选）<textarea v-model="riaForm.excerpt" rows="2" /></label>
                <label>用自己的话解释（I）<textarea v-model="riaForm.interpretation" rows="2" /></label>
                <label>关联我的经验（A1）<textarea v-model="riaForm.experience" rows="2" /></label>
                <label>下一步行动（A2）<input v-model="riaForm.action"></label>
                <button class="btn primary" @click="onSaveRiaNote">
                  保存 RIA
                </button>
                <ul class="note-list">
                  <li v-for="note in activeBook.riaNotes" :key="note.timestamp">
                    <div>
                      <p>📌 {{ note.excerpt || '（无摘录）' }}</p>
                      <p>💬 {{ note.interpretation }}</p>
                      <p v-if="note.experience">
                        🔗 {{ note.experience }}
                      </p>
                      <p v-if="note.action">
                        🎯 {{ note.action }}
                      </p>
                    </div>
                    <button class="link-danger" @click="removeRiaNote(note.timestamp)">
                      删除
                    </button>
                  </li>
                </ul>
              </div>

              <div v-if="noteTab === 'cornell'" class="form-grid">
                <label>关键词 / 问题<textarea v-model="cornellForm.cues" rows="2" /></label>
                <label>详细笔记<textarea v-model="cornellForm.notes" rows="3" /></label>
                <label>一句话总结<textarea v-model="cornellForm.summary" rows="2" /></label>
                <button class="btn primary" @click="onSaveCornellNote">
                  保存康奈尔笔记
                </button>
                <ul class="note-list">
                  <li v-for="note in activeBook.cornellNotes" :key="note.timestamp">
                    <div>
                      <p>🔑 {{ note.cues }}</p>
                      <p>📝 {{ note.notes }}</p>
                      <p>📄 {{ note.summary }}</p>
                    </div>
                    <button class="link-danger" @click="removeCornellNote(note.timestamp)">
                      删除
                    </button>
                  </li>
                </ul>
              </div>
            </article>

            <article class="card qa-box">
              <h3>💬 理解性提问</h3>
              <div class="qa-log">
                <template v-for="qa in stageHistory('reading')" :key="qa.timestamp">
                  <p class="qa-system">🧑‍🏫 {{ qa.question }}</p>
                  <p class="qa-user">你：{{ qa.answer }}</p>
                </template>
                <p class="qa-system">🧑‍🏫 {{ stageNextQuestion('reading') }}</p>
              </div>
              <div class="qa-input">
                <input v-model="stageQaInput.reading" placeholder="输入回答…" @keydown.enter="onSubmitStageQa('reading')">
                <button class="btn primary" @click="onSubmitStageQa('reading')">
                  提交
                </button>
              </div>
            </article>
          </div>

          <div v-else-if="stageKey === 'reflection'" class="stage-stack">
            <article class="card form-grid">
              <h3>💡 反思总结：费曼技巧</h3>
              <p class="hint">
                用最简单的话解释这本书的核心内容。
              </p>
              <label>总结<textarea v-model="summaryInput" rows="5" /></label>
              <button class="btn primary" @click="onSaveSummary">
                保存总结
              </button>
            </article>

            <article class="card qa-box">
              <h3>💬 深度反思提问</h3>
              <div class="qa-log">
                <template v-for="qa in stageHistory('reflection')" :key="qa.timestamp">
                  <p class="qa-system">🧑‍🏫 {{ qa.question }}</p>
                  <p class="qa-user">你：{{ qa.answer }}</p>
                </template>
                <p class="qa-system">🧑‍🏫 {{ stageNextQuestion('reflection') }}</p>
              </div>
              <div class="qa-input">
                <input
                  v-model="stageQaInput.reflection"
                  placeholder="输入回答…"
                  @keydown.enter="onSubmitStageQa('reflection')"
                >
                <button class="btn primary" @click="onSubmitStageQa('reflection')">
                  提交
                </button>
              </div>
            </article>
          </div>

          <div v-else-if="stageKey === 'consolidation'" class="stage-stack">
            <article class="card">
              <h3>🧠 巩固测试：主动回忆</h3>
              <p class="hint">
                点击卡片翻转查看答案。
              </p>
              <div v-if="consolidationCards.length === 0" class="empty-inline">
                暂无闪卡，先完成前面阶段问答。
              </div>
              <div v-else class="flashcard-grid">
                <button
                  v-for="qa in consolidationCards"
                  :key="qa.timestamp"
                  class="flashcard"
                  :class="{ flipped: flippedCards[`con-${qa.timestamp}`] }"
                  @click="toggleCard(`con-${qa.timestamp}`)"
                >
                  <span class="front">📌 {{ qa.question }}</span>
                  <span class="back">💡 {{ qa.answer || '（未回答）' }}</span>
                </button>
              </div>
            </article>

            <article class="card qa-box">
              <h3>💬 最终提问</h3>
              <div class="qa-log">
                <template v-for="qa in stageHistory('consolidation')" :key="qa.timestamp">
                  <p class="qa-system">🧑‍🏫 {{ qa.question }}</p>
                  <p class="qa-user">你：{{ qa.answer }}</p>
                </template>
                <p class="qa-system">🧑‍🏫 {{ stageNextQuestion('consolidation') }}</p>
              </div>
              <div class="qa-input">
                <input
                  v-model="stageQaInput.consolidation"
                  placeholder="输入回答…"
                  @keydown.enter="onSubmitStageQa('consolidation')"
                >
                <button class="btn primary" @click="onSubmitStageQa('consolidation')">
                  提交
                </button>
              </div>
            </article>

            <article class="card center-card">
              <p>🎉 恭喜完成！建议 3 天、1 周、1 个月后回来复习。</p>
              <button class="btn primary" @click="onResetBook">
                重新开始
              </button>
            </article>
          </div>
        </template>
      </section>

      <section v-else-if="state.currentView === 'topics'" class="view-section">
        <template v-if="activeTopic">
          <div class="top-bar">
            <div>
              <h1>🔗 {{ activeTopic.name }}</h1>
              <p>{{ topicBooks.length }} 本书 · 跨书对比</p>
            </div>
            <button class="btn ghost" @click="closeTopicDetail()">
              返回主题列表
            </button>
          </div>

          <article class="card">
            <h3>📚 关联书籍</h3>
            <div class="tag-row">
              <button v-for="book in topicBooks" :key="book.id" class="tag-btn" @click="openBook(book.id)">
                📖 {{ book.title }}
              </button>
            </div>
          </article>

          <article class="card form-grid">
            <h3>🧩 知识图谱</h3>
            <div class="graph-wrap">
              <p v-if="activeTopic.conceptNodes.length === 0" class="empty-inline">
                暂无节点，请添加。
              </p>
              <div v-else class="node-list">
                <p v-for="node in activeTopic.conceptNodes" :key="node.timestamp">
                  {{ node.name }}
                  <span v-if="node.connections.length > 0">→ {{ node.connections.join('、') }}</span>
                </p>
              </div>
            </div>

            <label>概念名称<input v-model="topicNodeName" placeholder="例如：刻意练习"></label>
            <label>关联到（逗号分隔）<input v-model="topicNodeConnections" placeholder="反馈, 反思"></label>
            <button class="btn primary" @click="onAddTopicNode">
              添加节点
            </button>
          </article>

          <article class="card qa-box">
            <h3>💬 跨书对比提问</h3>
            <p v-if="topicBooks.length < 2" class="hint">
              需要至少 2 本书归类到该主题，才能进行跨书对比。
            </p>
            <template v-else>
              <p class="hint">
                《{{ topicBooks[0].title }}》与《{{ topicBooks[1].title }}》在“{{ activeTopic.name }}”上的观点有何异同？
              </p>
              <p class="hint">
                你更倾向哪位作者的观点？请结合经验说明。
              </p>
            </template>

            <div class="qa-input">
              <input v-model="topicQaInput" placeholder="输入你的对比分析…" @keydown.enter="onSubmitTopicQa">
              <button class="btn primary" @click="onSubmitTopicQa">
                提交
              </button>
            </div>

            <div class="qa-log">
              <template v-for="qa in activeTopic.qa" :key="qa.timestamp">
                <p class="qa-system">🧑‍🏫 {{ qa.question }}</p>
                <p class="qa-user">你：{{ qa.answer }}</p>
              </template>
            </div>
          </article>
        </template>

        <template v-else>
          <div class="top-bar">
            <div>
              <h1>🔗 主题研究</h1>
              <p>跨书对比与知识图谱</p>
            </div>
          </div>

          <article class="card form-grid">
            <h3>新建主题</h3>
            <label>主题名称<input v-model="newTopicName" placeholder="例如：学习方法"></label>
            <button class="btn primary" @click="onCreateTopic">
              创建主题
            </button>
          </article>

          <div v-if="state.topics.length === 0" class="empty-state">
            <h3>暂无主题</h3>
            <p>创建主题并将书籍归类，进行跨书对比阅读。</p>
          </div>

          <div v-else class="topic-grid">
            <article v-for="topic in state.topics" :key="topic.id" class="topic-card" @click="openTopic(topic.id)">
              <h3>🔗 {{ topic.name }}</h3>
              <p>
                关联书籍：{{ getTopicBooks(topic.id).map(book => book.title).join('、') || '暂无' }}
              </p>
              <small>概念节点：{{ topic.conceptNodes.length }}</small>
            </article>
          </div>
        </template>
      </section>

      <section v-else-if="state.currentView === 'daily-review'" class="view-section">
        <div class="top-bar">
          <div>
            <h1>📅 今日复习</h1>
            <p>间隔重复 · 遗忘曲线计划</p>
          </div>
          <button class="btn ghost" @click="goToView('bookshelf')">
            返回书架
          </button>
        </div>

        <article class="card">
          <p class="hint">
            建议按难度反馈：困难→1天，良好→2倍间隔，简单→3倍间隔。
          </p>
        </article>

        <div v-if="dueReviewItems.length === 0" class="empty-state">
          <h3>今日无待复习</h3>
          <p>完成问答后系统会自动安排复习计划。</p>
        </div>

        <div v-else class="review-list">
          <article v-for="item in dueReviewItems" :key="`${item.bookId}-${item.timestamp}`" class="review-card" :class="{ overdue: isOverdue(item.nextReviewDate) }">
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

      <section v-else class="view-section">
        <div class="top-bar">
          <div>
            <h1>🔄 全部复习</h1>
            <p>闪卡模式 · 主动回忆</p>
          </div>
          <button class="btn ghost" @click="goToView('bookshelf')">
            返回书架
          </button>
        </div>

        <div v-if="allReviewCards.length === 0" class="empty-state">
          <h3>暂无闪卡</h3>
          <p>完成阅读问答后这里会出现复习卡片。</p>
        </div>

        <template v-else>
          <article class="card">
            <p class="hint">
              共 {{ state.books.reduce((sum, book) => sum + book.qa.length, 0) }} 条问答，点击翻转查看答案。
            </p>
          </article>

          <div class="flashcard-grid">
            <button
              v-for="qa in allReviewCards"
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
            <button class="btn ghost" @click="refreshReviewDeck()">
              换一批
            </button>
          </div>
        </template>
      </section>
    </main>
  </div>
</template>

<style scoped>
.mentor-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 240px 1fr;
  background: #f8f5ef;
  color: #2d3748;
}

.toast {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 40;
  background: #1f2937;
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
}

.confirm-mask {
  position: fixed;
  inset: 0;
  background: rgb(17 24 39 / 38%);
  z-index: 35;
  display: grid;
  place-items: center;
}

.confirm-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5dfd5;
  padding: 16px;
  width: min(420px, calc(100vw - 28px));
  display: grid;
  gap: 12px;
}

.confirm-card p {
  margin: 0;
}

.confirm-actions {
  display: flex;
  justify-content: end;
  gap: 8px;
}

.sidebar {
  border-right: 1px solid #e5dfd5;
  background: #fffdf9;
  padding: 18px 14px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.logo {
  display: flex;
  gap: 10px;
  align-items: center;
}

.logo-mark {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: #df9f66;
  color: #fff;
}

.logo h2 {
  margin: 0;
  font-size: 18px;
}

.logo p {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.nav-links {
  display: grid;
  gap: 8px;
}

.nav-link {
  border: none;
  background: transparent;
  text-align: left;
  padding: 10px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  color: #4b5563;
}

.nav-link.active {
  background: #f4e7da;
  color: #b86b30;
}

.badge {
  min-width: 24px;
  text-align: center;
  border-radius: 999px;
  padding: 2px 8px;
  background: #c6854a;
  color: #fff;
  font-size: 12px;
}

.badge.urgent {
  background: #c05a5a;
}

.sidebar-footer {
  margin-top: auto;
  color: #9ca3af;
  font-size: 12px;
  line-height: 1.5;
}

.main-content {
  padding: 24px;
}

.view-section {
  max-width: 960px;
  margin: 0 auto;
  display: grid;
  gap: 14px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 10px;
}

.top-bar h1 {
  margin: 0;
  font-size: 28px;
}

.top-bar p {
  margin: 6px 0 0;
  color: #6b7280;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.card {
  background: #fff;
  border: 1px solid #ece6dd;
  border-radius: 14px;
  padding: 16px;
  display: grid;
  gap: 12px;
}

.form-grid {
  display: grid;
  gap: 12px;
}

.form-grid label {
  display: grid;
  gap: 6px;
  font-size: 14px;
  color: #374151;
}

input,
textarea,
select {
  width: 100%;
  border: 1px solid #d8d1c7;
  border-radius: 10px;
  padding: 10px;
  box-sizing: border-box;
  font: inherit;
  background: #fff;
}

input:focus,
textarea:focus,
select:focus {
  outline: 2px solid #ecd7c1;
  border-color: #c6854a;
}

.btn {
  border: none;
  border-radius: 10px;
  padding: 8px 14px;
  cursor: pointer;
  font-weight: 600;
}

.btn.primary {
  background: #c6854a;
  color: #fff;
}

.btn.ghost {
  background: #f3f4f6;
  color: #374151;
}

.btn.danger {
  background: #c05a5a;
  color: #fff;
}

.btn.good {
  background: #4f8a64;
  color: #fff;
}

.btn.easy {
  background: #4a6fa5;
  color: #fff;
}

.empty-state {
  border: 1px dashed #d8d1c7;
  border-radius: 14px;
  padding: 30px;
  text-align: center;
  color: #6b7280;
  background: #fff;
}

.book-grid,
.topic-grid,
.review-list {
  display: grid;
  gap: 12px;
}

.book-card,
.topic-card,
.review-card {
  background: #fff;
  border: 1px solid #ece6dd;
  border-radius: 12px;
  padding: 14px;
  display: grid;
  gap: 8px;
}

.book-card,
.topic-card {
  cursor: pointer;
}

.book-card:hover,
.topic-card:hover {
  border-color: #d6b391;
}

.book-header {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.book-header h3 {
  margin: 0;
}

.icon-danger,
.link-danger {
  border: none;
  background: transparent;
  color: #b91c1c;
  cursor: pointer;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag,
.tag-btn {
  border-radius: 999px;
  padding: 4px 10px;
  background: #f4efe8;
  color: #6b4c2f;
  font-size: 12px;
  border: none;
}

.tag-btn {
  cursor: pointer;
}

.stage-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stage-item {
  border: 1px solid #e5dfd5;
  background: #fff;
  color: #6b7280;
  border-radius: 999px;
  padding: 6px 12px;
  cursor: pointer;
}

.stage-item.active {
  background: #f4e7da;
  color: #b86b30;
  border-color: #e2c3a3;
}

.stage-item.done {
  background: #e8f3eb;
  color: #2f6e44;
  border-color: #9ec7ab;
}

.stage-stack {
  display: grid;
  gap: 12px;
}

.qa-box {
  display: grid;
  gap: 10px;
}

.qa-log {
  max-height: 280px;
  overflow: auto;
  border: 1px solid #ece6dd;
  border-radius: 10px;
  padding: 10px;
  background: #fcfaf7;
}

.qa-system,
.qa-user {
  margin: 0 0 8px;
  line-height: 1.5;
}

.qa-user {
  color: #2563eb;
}

.qa-input {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}

.hint {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.note-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
}

.note-list li {
  border: 1px solid #ece6dd;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.tab-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tab-btn {
  border: 1px solid #e5dfd5;
  background: #fff;
  border-radius: 999px;
  padding: 6px 10px;
  cursor: pointer;
}

.tab-btn.active {
  background: #f4e7da;
  border-color: #e2c3a3;
  color: #b86b30;
}

.flashcard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
}

.flashcard {
  border: 1px solid #e5dfd5;
  border-radius: 12px;
  padding: 12px;
  text-align: left;
  background: #fff;
  cursor: pointer;
  min-height: 120px;
}

.flashcard .back {
  display: none;
}

.flashcard.flipped .front {
  display: none;
}

.flashcard.flipped .back {
  display: inline;
}

.center-card {
  text-align: center;
}

.empty-inline {
  color: #6b7280;
}

.graph-wrap {
  border: 1px dashed #d8d1c7;
  border-radius: 10px;
  padding: 10px;
  background: #fcfaf7;
}

.node-list p {
  margin: 0 0 6px;
}

.review-card {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.review-card.overdue {
  border-color: #e3b3b3;
  background: #fff5f5;
}

.review-card h3,
.review-card p,
.review-card small {
  margin: 0;
  display: block;
}

.difficulty-row {
  display: grid;
  gap: 8px;
  align-content: center;
}

@media (max-width: 960px) {
  .mentor-page {
    grid-template-columns: 1fr;
  }

  .sidebar {
    border-right: none;
    border-bottom: 1px solid #e5dfd5;
  }

  .nav-links {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .main-content {
    padding: 14px;
  }

  .top-bar {
    flex-direction: column;
  }

  .review-card {
    flex-direction: column;
  }
}
</style>
