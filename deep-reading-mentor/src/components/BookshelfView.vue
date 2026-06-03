<script setup lang="ts">
import type { Book, ReadingIntent } from '~/composables'

const props = defineProps<{
  books: Book[]
  onCreateBook: (payload: { title: string, author: string, readingIntent: ReadingIntent, topicName: string }) => Book | null
  onOpenBook: (bookId: string) => void
  onDeleteBook: (bookId: string) => void
}>()

const showAddBookForm = ref(false)
const addBookForm = reactive({
  title: '',
  author: '',
  readingIntent: 'intensive' as ReadingIntent,
  topicName: '',
})

function submitAddBook() {
  const title = addBookForm.title.trim()
  if (!title)
    return

  const created = props.onCreateBook({
    title,
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
</script>

<template>
  <section class="view-section">
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
      <button class="btn primary" @click="submitAddBook">
        创建并开始阅读
      </button>
    </div>

    <div v-if="props.books.length === 0" class="empty-state">
      <h3>书架空空</h3>
      <p>添加第一本书，开始构建你的深度阅读系统。</p>
    </div>

    <div v-else class="book-grid">
      <article
        v-for="book in props.books"
        :key="book.id"
        class="book-card"
        @click="props.onOpenBook(book.id)"
      >
        <div class="book-header">
          <h3>{{ book.title }}</h3>
          <button class="icon-danger" @click.stop="props.onDeleteBook(book.id)">
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
</template>
