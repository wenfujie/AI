<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseModal from './components/BaseModal.vue'
import {
  calculateExpenseTotal,
  normalizeExpenseAmountInput,
} from './utils/expenseAmount.js'
import { convertExpenseRowsToMarkdownTable } from './utils/expenseMarkdown.js'

type ExpenseRow = {
  id: number
  expenseItem: string
  expenseAmount: string
}

type CopyStatus = 'idle' | 'success' | 'error'

const rows = ref<ExpenseRow[]>([
  { id: 1, expenseItem: '', expenseAmount: '' },
  { id: 2, expenseItem: '', expenseAmount: '' },
  { id: 3, expenseItem: '', expenseAmount: '' },
])

const isMarkdownModalOpen = ref(false)
const markdownDraft = ref('')
const copyStatus = ref<CopyStatus>('idle')

const totalAmount = computed(() =>
  calculateExpenseTotal(rows.value.map((row) => row.expenseAmount)),
)

const displayAmount = computed(() => totalAmount.value.toFixed(2))
const copyStatusText = computed(() => {
  if (copyStatus.value === 'success') {
    return '已复制到剪切板'
  }
  if (copyStatus.value === 'error') {
    return '复制失败，请手动复制'
  }
  return ''
})

function updateExpenseItem(id: number, value: string) {
  const row = rows.value.find((entry) => entry.id === id)
  if (!row) {
    return
  }
  row.expenseItem = value
}

function updateExpenseAmount(id: number, rawValue: string) {
  const row = rows.value.find((entry) => entry.id === id)
  if (!row) {
    return
  }
  row.expenseAmount = normalizeExpenseAmountInput(rawValue)
}

function addRow() {
  rows.value.push({
    id: rows.value.length > 0 ? rows.value[rows.value.length - 1].id + 1 : 1,
    expenseItem: '',
    expenseAmount: '',
  })
}

function openMarkdownModal() {
  markdownDraft.value = convertExpenseRowsToMarkdownTable(rows.value)
  copyStatus.value = 'idle'
  isMarkdownModalOpen.value = true
}

function closeMarkdownModal() {
  isMarkdownModalOpen.value = false
  markdownDraft.value = ''
  copyStatus.value = 'idle'
}

async function copyMarkdown() {
  try {
    if (!navigator?.clipboard?.writeText) {
      throw new Error('Clipboard API unavailable')
    }
    await navigator.clipboard.writeText(markdownDraft.value)
    copyStatus.value = 'success'
  } catch {
    copyStatus.value = 'error'
  }
}
</script>

<template>
  <main class="expense-page">
    <section class="expense-card">
      <header class="expense-header">
        <p class="eyebrow">Expense Console</p>
        <h1>花销统计页面</h1>
        <p class="summary">录入花销项和金额，系统会实时计算下方总金额 amount。</p>
      </header>

      <div class="table-wrap">
        <table class="expense-table">
          <thead>
            <tr>
              <th scope="col">花销项</th>
              <th scope="col">花销金额</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td>
                <input
                  :value="row.expenseItem"
                  type="text"
                  placeholder="例如：午餐、交通费"
                  @input="
                    updateExpenseItem(
                      row.id,
                      ($event.target as HTMLInputElement).value,
                    )
                  "
                />
              </td>
              <td>
                <input
                  :value="row.expenseAmount"
                  type="text"
                  inputmode="decimal"
                  placeholder="0.00"
                  @input="
                    updateExpenseAmount(
                      row.id,
                      ($event.target as HTMLInputElement).value,
                    )
                  "
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="footer-bar">
        <div class="footer-actions">
          <button type="button" class="ghost-btn" @click="addRow">新增一行</button>
          <button type="button" class="ghost-btn secondary" @click="openMarkdownModal">
            markdown表格转换
          </button>
        </div>
        <p class="total">总金额：<strong>{{ displayAmount }}</strong></p>
      </div>
    </section>

    <BaseModal
      :open="isMarkdownModalOpen"
      title="Markdown 表格转换"
      @close="closeMarkdownModal"
    >
      <textarea
        v-model="markdownDraft"
        class="markdown-textarea"
        rows="10"
        placeholder="Markdown 表格代码"
      />
      <p class="copy-status" :class="copyStatus">{{ copyStatusText }}</p>

      <template #actions>
        <button type="button" class="ghost-btn secondary" @click="copyMarkdown">复制</button>
        <button type="button" class="ghost-btn" @click="closeMarkdownModal">关闭</button>
      </template>
    </BaseModal>
  </main>
</template>
