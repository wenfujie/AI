<script setup lang="ts">
import type { Book, Topic } from '~/composables'

const props = defineProps<{
  topics: Topic[]
  activeTopic: Topic | null
  getTopicBooks: (topicId: string) => Book[]
  onOpenBook: (bookId: string) => void
  onOpenTopic: (topicId: string) => void
  onCloseTopicDetail: () => void
  onCreateTopic: (name: string) => Topic | null
  onAddTopicNode: (topicId: string, payload: { name: string, connections: string }) => boolean
  onSubmitTopicAnswer: (topicId: string, answer: string) => boolean
}>()

const newTopicName = ref('')
const topicNodeName = ref('')
const topicNodeConnections = ref('')
const topicQaInput = ref('')

const topicBooks = computed(() => {
  if (!props.activeTopic)
    return []

  return props.getTopicBooks(props.activeTopic.id)
})

watch(
  () => props.activeTopic?.id,
  () => {
    topicNodeName.value = ''
    topicNodeConnections.value = ''
    topicQaInput.value = ''
  },
)

function onCreateTopicClick() {
  const topic = props.onCreateTopic(newTopicName.value)
  if (!topic)
    return

  newTopicName.value = ''
}

function onAddTopicNodeClick() {
  if (!props.activeTopic)
    return

  const ok = props.onAddTopicNode(props.activeTopic.id, {
    name: topicNodeName.value,
    connections: topicNodeConnections.value,
  })

  if (!ok)
    return

  topicNodeName.value = ''
  topicNodeConnections.value = ''
}

function onSubmitTopicQa() {
  if (!props.activeTopic)
    return

  const ok = props.onSubmitTopicAnswer(props.activeTopic.id, topicQaInput.value)
  if (!ok)
    return

  topicQaInput.value = ''
}
</script>

<template>
  <section class="view-section">
    <template v-if="activeTopic">
      <div class="top-bar">
        <div>
          <h1>🔗 {{ activeTopic.name }}</h1>
          <p>{{ topicBooks.length }} 本书 · 跨书对比</p>
        </div>
        <button class="btn ghost" @click="onCloseTopicDetail">
          返回主题列表
        </button>
      </div>

      <article class="card">
        <h3>📚 关联书籍</h3>
        <div class="tag-row">
          <button v-for="book in topicBooks" :key="book.id" class="tag-btn" @click="onOpenBook(book.id)">
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
        <button class="btn primary" @click="onAddTopicNodeClick">
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
        <button class="btn primary" @click="onCreateTopicClick">
          创建主题
        </button>
      </article>

      <div v-if="topics.length === 0" class="empty-state">
        <h3>暂无主题</h3>
        <p>创建主题并将书籍归类，进行跨书对比阅读。</p>
      </div>

      <div v-else class="topic-grid">
        <article v-for="topic in topics" :key="topic.id" class="topic-card" @click="onOpenTopic(topic.id)">
          <h3>🔗 {{ topic.name }}</h3>
          <p>
            关联书籍：{{ getTopicBooks(topic.id).map(book => book.title).join('、') || '暂无' }}
          </p>
          <small>概念节点：{{ topic.conceptNodes.length }}</small>
        </article>
      </div>
    </template>
  </section>
</template>
