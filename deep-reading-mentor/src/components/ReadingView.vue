<script setup lang="ts">
import type { Book, StageKey } from '~/composables'
import { stageKeys } from '~/composables'

const props = defineProps<{
  book: Book | null
  stageNames: readonly string[]
  maxStageForBook: (book: Book) => number
  getStageQuestions: (stage: StageKey) => string[]
  formatDate: (ts: number) => string
  onGoToBookshelf: () => void
  onPrevStage: () => void
  onNextStage: () => void
  onGoToStage: (stage: number) => void
  onSavePrepMeta: (payload: { title: string, author: string, goal: string }) => void
  onSavePreviewNote: (content: string) => boolean
  onAddReadingNote: (content: string) => boolean
  onRemoveReadingNote: (timestamp: number) => void
  onAddRiaNote: (payload: { excerpt: string, interpretation: string, experience: string, action: string }) => boolean
  onRemoveRiaNote: (timestamp: number) => void
  onAddCornellNote: (payload: { cues: string, notes: string, summary: string }) => boolean
  onRemoveCornellNote: (timestamp: number) => void
  onSaveSummary: (summary: string) => void
  onSubmitStageAnswer: (stage: StageKey, answer: string) => void
  onResetBook: () => void
  onNotify: (message: string) => void
}>()

const noteTab = ref<'free' | 'ria' | 'cornell'>('free')
const prepForm = reactive({
  title: '',
  author: '',
  goal: '',
})
const previewInput = ref('')
const freeNoteInput = ref('')
const summaryInput = ref('')
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

watch(
  () => props.book?.id,
  () => {
    if (!props.book)
      return

    prepForm.title = props.book.title
    prepForm.author = props.book.author
    prepForm.goal = props.book.goal
    summaryInput.value = props.book.summary
    previewInput.value = ''
    freeNoteInput.value = ''
    noteTab.value = 'free'
  },
  { immediate: true },
)

const stageKey = computed<StageKey | null>(() => {
  if (!props.book)
    return null

  return stageKeys[props.book.currentStage] ?? null
})

const stageProgress = computed(() => {
  if (!props.book)
    return []

  const maxStage = props.maxStageForBook(props.book)
  return props.stageNames
    .map((name, index) => ({ name, index }))
    .filter(item => item.index <= maxStage)
})

const previewStageNotes = computed(() => {
  if (!props.book)
    return []

  return props.book.notes.filter(note => note.stage === 'preview')
})

const readingStageNotes = computed(() => {
  if (!props.book)
    return []

  return props.book.notes.filter(note => note.stage === 'reading')
})

const consolidationCards = computed(() => {
  if (!props.book)
    return []

  return props.book.qa.filter(qa => qa.stage !== 'consolidation').slice(-6)
})

function stageHistory(key: StageKey) {
  return props.book?.qa.filter(qa => qa.stage === key) ?? []
}

function stageNextQuestion(key: StageKey) {
  const existing = stageHistory(key)
  const asked = new Set(existing.map(qa => qa.question))
  const unanswered = props.getStageQuestions(key).filter(question => !asked.has(question))
  if (unanswered.length > 0)
    return `${existing.length > 0 ? '下一个问题：' : '开始吧：'} ${unanswered[0]}`

  return '太棒了！本轮问题已全部回答。'
}

function onSavePrepMeta() {
  props.onSavePrepMeta({
    title: prepForm.title,
    author: prepForm.author,
    goal: prepForm.goal,
  })
}

function onSubmitStageQa(key: StageKey) {
  props.onSubmitStageAnswer(key, stageQaInput[key])
  stageQaInput[key] = ''
}

function onSavePreviewNotes() {
  const ok = props.onSavePreviewNote(previewInput.value)
  if (!ok)
    return

  previewInput.value = ''
}

function onSaveReadingNote() {
  const ok = props.onAddReadingNote(freeNoteInput.value)
  if (!ok)
    return

  freeNoteInput.value = ''
}

function onSaveRiaNote() {
  const ok = props.onAddRiaNote(riaForm)
  if (!ok) {
    props.onNotify('请至少填写“用自己的话解释（I）”')
    return
  }

  riaForm.excerpt = ''
  riaForm.interpretation = ''
  riaForm.experience = ''
  riaForm.action = ''
}

function onSaveCornellNote() {
  const ok = props.onAddCornellNote(cornellForm)
  if (!ok) {
    props.onNotify('请至少填写关键词或详细笔记')
    return
  }

  cornellForm.cues = ''
  cornellForm.notes = ''
  cornellForm.summary = ''
}

function onSaveSummary() {
  props.onSaveSummary(summaryInput.value)
}

function toggleCard(cardId: string) {
  flippedCards[cardId] = !flippedCards[cardId]
}
</script>

<template>
  <section class="view-section">
    <div v-if="!book" class="empty-state">
      <h3>请先选择一本书</h3>
      <button class="btn primary" @click="onGoToBookshelf">
        返回书架
      </button>
    </div>

    <template v-else>
      <div class="top-bar">
        <div>
          <h1>{{ book.title }}</h1>
          <p>
            ✍ {{ book.author || '未知作者' }} · 阶段 {{ book.currentStage + 1 }}/{{ maxStageForBook(book) + 1 }} ·
            {{ book.readingIntent === 'intensive' ? '精读模式' : '略读模式' }}
          </p>
        </div>
        <div class="toolbar">
          <button class="btn ghost" @click="onGoToBookshelf">
            书架
          </button>
          <button v-if="book.currentStage > 0" class="btn ghost" @click="onPrevStage">
            上一步
          </button>
          <button v-if="book.currentStage < maxStageForBook(book)" class="btn primary" @click="onNextStage">
            完成本阶段
          </button>
        </div>
      </div>

      <div class="stage-bar">
        <button
          v-for="item in stageProgress"
          :key="item.index"
          class="stage-item"
          :class="{ done: item.index < book.currentStage, active: item.index === book.currentStage }"
          @click="onGoToStage(item.index)"
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
                <button class="link-danger" @click="onRemoveReadingNote(note.timestamp)">
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
              <li v-for="note in book.riaNotes" :key="note.timestamp">
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
                <button class="link-danger" @click="onRemoveRiaNote(note.timestamp)">
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
              <li v-for="note in book.cornellNotes" :key="note.timestamp">
                <div>
                  <p>🔑 {{ note.cues }}</p>
                  <p>📝 {{ note.notes }}</p>
                  <p>📄 {{ note.summary }}</p>
                </div>
                <button class="link-danger" @click="onRemoveCornellNote(note.timestamp)">
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
</template>
