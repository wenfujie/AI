import { computed, reactive, ref, watch } from 'vue'

export type ReadingIntent = 'intensive' | 'extensive'
export type MentorView = 'bookshelf' | 'reading' | 'topics' | 'daily-review' | 'review'
export type StageKey = 'preparation' | 'preview' | 'reading' | 'reflection' | 'consolidation'
export type ReviewDifficulty = 'hard' | 'good' | 'easy'

export interface BookNote {
  stage: 'preview' | 'reading'
  content: string
  timestamp: number
}

export interface RiaNote {
  excerpt: string
  interpretation: string
  experience: string
  action: string
  timestamp: number
}

export interface CornellNote {
  cues: string
  notes: string
  summary: string
  timestamp: number
}

export interface StageQA {
  question: string
  answer: string
  stage: StageKey
  timestamp: number
  nextReviewDate: number
  reviewCount: number
  difficulty: ReviewDifficulty
  reviewInterval: number
  lastReviewed?: number
}

export interface Book {
  id: string
  title: string
  author: string
  goal: string
  readingIntent: ReadingIntent
  topicId: string | null
  currentStage: number
  createdAt: number
  notes: BookNote[]
  riaNotes: RiaNote[]
  cornellNotes: CornellNote[]
  qa: StageQA[]
  summary: string
  stageCompleted: boolean[]
}

export interface TopicNode {
  name: string
  connections: string[]
  timestamp: number
}

export interface TopicQA {
  question: string
  answer: string
  timestamp: number
}

export interface Topic {
  id: string
  name: string
  createdAt: number
  conceptNodes: TopicNode[]
  qa: TopicQA[]
}

interface MentorState {
  books: Book[]
  topics: Topic[]
  activeBookId: string | null
  currentView: MentorView
  currentStage: number
  selectedTopicId: string | null
}

export interface DueReviewItem extends StageQA {
  bookId: string
  bookTitle: string
}

const STORAGE_KEY = 'deep_reading_mentor_v2'

export const stageNames = ['🎯 准备', '🔍 预览', '📝 深度阅读', '💡 反思', '🧠 巩固'] as const
export const stageKeys: StageKey[] = ['preparation', 'preview', 'reading', 'reflection', 'consolidation']

const questionBank: Record<StageKey, string[]> = {
  preparation: [
    '你为什么选择读这本书？它吸引你的地方是什么？',
    '读完这本书后，你希望自己能回答哪些问题？',
    '你目前对这个主题了解多少？请简单描述一下。',
    '设定一个具体的阅读目标吧：你希望从这本书中获得什么？',
  ],
  preview: [
    '浏览目录后，你觉得哪个章节最吸引你？为什么？',
    '根据标题和目录，你猜测作者的核心论点会是什么？',
    '这本书的结构是怎样的？是递进式、并列式还是问题解决式？',
    '你希望在书中找到哪些具体信息？请列出 2-3 个问题。',
  ],
  reading: [
    '这一章的核心观点是什么？请用一句话概括。',
    '作者用了哪些论据来支持观点？这些论据有说服力吗？',
    '你同意作者在这个问题上的看法吗？为什么？',
    '这一章中有没有让你产生共鸣或反对的段落？',
  ],
  reflection: [
    '请用最简单的语言，向一个完全不懂的人解释这本书的核心内容。',
    '如果只能用三句话总结这本书，你会怎么说？',
    '这本书改变或强化了你的哪些观点？',
    '你会如何将书中的知识应用到实际生活中？请给出具体场景。',
  ],
  consolidation: [
    '不看书，你能回忆起书中的三个核心观点吗？',
    '作者的主要论证逻辑是什么？试着写出来。',
    '如果朋友问“这本书值得读吗”，你会怎么回答？',
    '一周后回顾：这本书的核心思想你还记得多少？',
  ],
}

const state = reactive<MentorState>({
  books: [],
  topics: [],
  activeBookId: null,
  currentView: 'bookshelf',
  currentStage: 0,
  selectedTopicId: null,
})

const reviewDeckSeed = ref(Date.now())

function generateId() {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function todayKey(ts = Date.now()) {
  return new Date(ts).toISOString().slice(0, 10)
}

function isReviewedToday(qa: StageQA) {
  return !!qa.lastReviewed && todayKey(qa.lastReviewed) === todayKey()
}

function maxStageForBook(book: Book) {
  return book.readingIntent === 'extensive' ? 3 : 4
}

function getStageQuestions(stageKey: StageKey) {
  return questionBank[stageKey]
}

function getNextReviewDate(difficulty: ReviewDifficulty, currentInterval: number) {
  let interval = currentInterval || 1
  if (difficulty === 'hard')
    interval = 1
  else if (difficulty === 'good')
    interval = Math.min(interval * 2, 30)
  else if (difficulty === 'easy')
    interval = Math.min(Math.floor(interval * 3), 60)

  return Date.now() + interval * 24 * 60 * 60 * 1000
}

function getActiveBook() {
  return state.books.find(book => book.id === state.activeBookId) ?? null
}

function ensureStateConsistency() {
  if (state.currentView === 'reading' && !getActiveBook()) {
    if (state.books.length > 0) {
      state.activeBookId = state.books[0].id
      state.currentStage = state.books[0].currentStage
    }
    else {
      state.currentView = 'bookshelf'
    }
  }

  if (state.currentView === 'topics' && state.selectedTopicId && !state.topics.some(topic => topic.id === state.selectedTopicId))
    state.selectedTopicId = null
}

function normalizeBook(raw: Partial<Book>): Book {
  return {
    id: raw.id ?? generateId(),
    title: raw.title?.trim() || '未命名书籍',
    author: raw.author?.trim() || '',
    goal: raw.goal?.trim() || '',
    readingIntent: raw.readingIntent === 'extensive' ? 'extensive' : 'intensive',
    topicId: raw.topicId ?? null,
    currentStage: Math.max(0, Math.min(raw.currentStage ?? 0, 4)),
    createdAt: raw.createdAt ?? Date.now(),
    notes: Array.isArray(raw.notes) ? raw.notes : [],
    riaNotes: Array.isArray(raw.riaNotes) ? raw.riaNotes : [],
    cornellNotes: Array.isArray(raw.cornellNotes) ? raw.cornellNotes : [],
    qa: Array.isArray(raw.qa) ? raw.qa : [],
    summary: raw.summary ?? '',
    stageCompleted: Array.isArray(raw.stageCompleted) ? raw.stageCompleted : [false, false, false, false, false],
  }
}

function normalizeTopic(raw: Partial<Topic>): Topic {
  return {
    id: raw.id ?? generateId(),
    name: raw.name?.trim() || '未命名主题',
    createdAt: raw.createdAt ?? Date.now(),
    conceptNodes: Array.isArray(raw.conceptNodes) ? raw.conceptNodes : [],
    qa: Array.isArray(raw.qa) ? raw.qa : [],
  }
}

function loadData() {
  if (typeof window === 'undefined')
    return

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved)
      return

    const parsed = JSON.parse(saved) as Partial<MentorState>
    state.books = Array.isArray(parsed.books) ? parsed.books.map(item => normalizeBook(item)) : []
    state.topics = Array.isArray(parsed.topics) ? parsed.topics.map(item => normalizeTopic(item)) : []
    state.activeBookId = parsed.activeBookId ?? null
    state.currentView = (parsed.currentView as MentorView) || 'bookshelf'
    state.currentStage = parsed.currentStage ?? 0
    state.selectedTopicId = parsed.selectedTopicId ?? null
    ensureStateConsistency()
  }
  catch {
    state.books = []
    state.topics = []
    state.activeBookId = null
    state.currentView = 'bookshelf'
    state.currentStage = 0
    state.selectedTopicId = null
  }
}

function saveData() {
  if (typeof window === 'undefined')
    return

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      books: state.books,
      topics: state.topics,
      activeBookId: state.activeBookId,
      currentView: state.currentView,
      currentStage: state.currentStage,
      selectedTopicId: state.selectedTopicId,
    }),
  )
}

loadData()
watch(() => state, saveData, { deep: true })

function goToView(view: MentorView) {
  state.currentView = view
  if (view !== 'topics')
    state.selectedTopicId = null

  if (view === 'reading' && !getActiveBook()) {
    if (state.books.length > 0)
      openBook(state.books[0].id)
    else
      state.currentView = 'bookshelf'
  }
}

function addBook(payload: { title: string, author: string, readingIntent: ReadingIntent, topicName?: string }) {
  const title = payload.title.trim()
  if (!title)
    return null

  const topicName = payload.topicName?.trim()
  let topicId: string | null = null

  if (topicName) {
    const existingTopic = state.topics.find(topic => topic.name === topicName)
    if (existingTopic) {
      topicId = existingTopic.id
    }
    else {
      const topic = normalizeTopic({ name: topicName, conceptNodes: [] })
      state.topics.unshift(topic)
      topicId = topic.id
    }
  }

  const newBook = normalizeBook({
    title,
    author: payload.author.trim(),
    readingIntent: payload.readingIntent,
    topicId,
    stageCompleted: [false, false, false, false, false],
  })

  state.books.unshift(newBook)
  state.activeBookId = newBook.id
  state.currentStage = 0
  state.currentView = 'reading'

  return newBook
}

function deleteBook(bookId: string) {
  state.books = state.books.filter(book => book.id !== bookId)

  if (state.activeBookId === bookId)
    state.activeBookId = state.books[0]?.id ?? null

  ensureStateConsistency()
}

function openBook(bookId: string) {
  const book = state.books.find(item => item.id === bookId)
  if (!book)
    return

  state.activeBookId = book.id
  state.currentStage = book.currentStage
  state.currentView = 'reading'
}

function saveBookMeta(payload: { title: string, author: string, goal: string }) {
  const book = getActiveBook()
  if (!book)
    return

  const title = payload.title.trim()
  if (title)
    book.title = title

  book.author = payload.author.trim()
  book.goal = payload.goal.trim()
}

function goToStage(stage: number) {
  const book = getActiveBook()
  if (!book)
    return

  const max = maxStageForBook(book)
  const safeStage = Math.max(0, Math.min(stage, max))
  book.currentStage = safeStage
  state.currentStage = safeStage
}

function nextStage() {
  const book = getActiveBook()
  if (!book)
    return

  const max = maxStageForBook(book)
  if (book.currentStage >= max)
    return

  book.stageCompleted[book.currentStage] = true
  book.currentStage += 1
  state.currentStage = book.currentStage
}

function prevStage() {
  const book = getActiveBook()
  if (!book)
    return

  if (book.currentStage <= 0)
    return

  book.currentStage -= 1
  state.currentStage = book.currentStage
}

function resetBookProgress() {
  const book = getActiveBook()
  if (!book)
    return

  book.currentStage = 0
  book.stageCompleted = [false, false, false, false, false]
  state.currentStage = 0
}

function submitStageAnswer(stageKey: StageKey, answer: string) {
  const book = getActiveBook()
  if (!book)
    return

  const content = answer.trim()
  if (!content)
    return

  const existing = book.qa.filter(item => item.stage === stageKey)
  const askedQuestions = new Set(existing.map(item => item.question))
  const unanswered = getStageQuestions(stageKey).filter(question => !askedQuestions.has(question))
  const currentQuestion = unanswered[0] ?? '请继续思考…'

  book.qa.push({
    question: currentQuestion,
    answer: content,
    stage: stageKey,
    timestamp: Date.now(),
    nextReviewDate: getNextReviewDate('good', 1),
    reviewCount: 0,
    difficulty: 'good',
    reviewInterval: 1,
  })
}

function savePreviewNote(content: string) {
  const book = getActiveBook()
  if (!book)
    return false

  const text = content.trim()
  if (!text)
    return false

  book.notes.push({
    stage: 'preview',
    content: text,
    timestamp: Date.now(),
  })

  return true
}

function addReadingNote(content: string) {
  const book = getActiveBook()
  if (!book)
    return false

  const text = content.trim()
  if (!text)
    return false

  book.notes.push({
    stage: 'reading',
    content: text,
    timestamp: Date.now(),
  })

  return true
}

function removeReadingNote(timestamp: number) {
  const book = getActiveBook()
  if (!book)
    return

  book.notes = book.notes.filter(note => note.timestamp !== timestamp)
}

function addRiaNote(payload: { excerpt: string, interpretation: string, experience: string, action: string }) {
  const book = getActiveBook()
  if (!book)
    return false

  const interpretation = payload.interpretation.trim()
  if (!interpretation)
    return false

  book.riaNotes.push({
    excerpt: payload.excerpt.trim(),
    interpretation,
    experience: payload.experience.trim(),
    action: payload.action.trim(),
    timestamp: Date.now(),
  })

  return true
}

function removeRiaNote(timestamp: number) {
  const book = getActiveBook()
  if (!book)
    return

  book.riaNotes = book.riaNotes.filter(note => note.timestamp !== timestamp)
}

function addCornellNote(payload: { cues: string, notes: string, summary: string }) {
  const book = getActiveBook()
  if (!book)
    return false

  const cues = payload.cues.trim()
  const notes = payload.notes.trim()
  if (!cues && !notes)
    return false

  book.cornellNotes.push({
    cues,
    notes,
    summary: payload.summary.trim(),
    timestamp: Date.now(),
  })

  return true
}

function removeCornellNote(timestamp: number) {
  const book = getActiveBook()
  if (!book)
    return

  book.cornellNotes = book.cornellNotes.filter(note => note.timestamp !== timestamp)
}

function saveSummary(summary: string) {
  const book = getActiveBook()
  if (!book)
    return

  book.summary = summary.trim()
}

function createTopic(name: string) {
  const topicName = name.trim()
  if (!topicName)
    return null

  const existing = state.topics.find(topic => topic.name === topicName)
  if (existing)
    return existing

  const topic = normalizeTopic({ name: topicName })
  state.topics.unshift(topic)
  return topic
}

function openTopic(topicId: string) {
  const topic = state.topics.find(item => item.id === topicId)
  if (!topic)
    return

  state.currentView = 'topics'
  state.selectedTopicId = topicId
}

function closeTopicDetail() {
  state.selectedTopicId = null
}

function addTopicNode(topicId: string, payload: { name: string, connections: string }) {
  const topic = state.topics.find(item => item.id === topicId)
  if (!topic)
    return false

  const name = payload.name.trim()
  if (!name)
    return false

  const connections = payload.connections
    .split(/[,，]/)
    .map(item => item.trim())
    .filter(Boolean)

  topic.conceptNodes.push({
    name,
    connections,
    timestamp: Date.now(),
  })

  return true
}

function submitTopicAnswer(topicId: string, answer: string) {
  const topic = state.topics.find(item => item.id === topicId)
  if (!topic)
    return false

  const content = answer.trim()
  if (!content)
    return false

  const topicBooks = state.books.filter(book => book.topicId === topicId)
  const question = topicBooks.length >= 2
    ? `对比《${topicBooks[0].title}》和《${topicBooks[1].title}》关于“${topic.name}”的论述：`
    : `关于“${topic.name}”，请分享你的思考：`

  topic.qa.push({
    question,
    answer: content,
    timestamp: Date.now(),
  })

  return true
}

function getTopicBooks(topicId: string) {
  return state.books.filter(book => book.topicId === topicId)
}

function rateReview(bookId: string, qaTimestamp: number, difficulty: ReviewDifficulty) {
  const book = state.books.find(item => item.id === bookId)
  if (!book)
    return

  const qa = book.qa.find(item => item.timestamp === qaTimestamp)
  if (!qa)
    return

  const currentInterval = qa.reviewInterval || 1
  qa.nextReviewDate = getNextReviewDate(difficulty, currentInterval)
  qa.reviewInterval = difficulty === 'hard'
    ? 1
    : difficulty === 'good'
      ? Math.min(currentInterval * 2, 30)
      : Math.min(Math.floor(currentInterval * 3), 60)
  qa.reviewCount += 1
  qa.difficulty = difficulty
  qa.lastReviewed = Date.now()
}

function refreshReviewDeck() {
  reviewDeckSeed.value = Date.now()
}

function shuffleBySeed<T>(list: T[], seed: number) {
  const arr = [...list]
  let randomSeed = seed

  const random = () => {
    randomSeed = (randomSeed * 9301 + 49297) % 233280
    return randomSeed / 233280
  }

  for (let index = arr.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[arr[index], arr[swapIndex]] = [arr[swapIndex], arr[index]]
  }

  return arr
}

const activeBook = computed(() => getActiveBook())

const activeTopic = computed(() => {
  if (!state.selectedTopicId)
    return null

  return state.topics.find(topic => topic.id === state.selectedTopicId) ?? null
})

const dueReviewItems = computed<DueReviewItem[]>(() => {
  const now = Date.now()
  const reviews: DueReviewItem[] = []

  state.books.forEach((book) => {
    book.qa.forEach((qa) => {
      if (qa.nextReviewDate <= now && !isReviewedToday(qa)) {
        reviews.push({
          ...qa,
          bookId: book.id,
          bookTitle: book.title,
        })
      }
    })
  })

  return reviews.sort((a, b) => a.nextReviewDate - b.nextReviewDate)
})

const allReviewCards = computed(() => {
  const cards = state.books.flatMap(book => book.qa.map(qa => ({
    ...qa,
    bookTitle: book.title,
    bookId: book.id,
  })))

  return shuffleBySeed(cards, reviewDeckSeed.value).slice(0, 8)
})

const dueReviewCount = computed(() => dueReviewItems.value.length)

export function useReadingMentor() {
  return {
    state,
    stageNames,
    stageKeys,
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
  }
}
