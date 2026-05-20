import test from 'node:test'
import assert from 'node:assert/strict'

import { convertExpenseRowsToMarkdownTable } from '../src/utils/expenseMarkdown.js'

test('convertExpenseRowsToMarkdownTable includes header and row data', () => {
  const markdown = convertExpenseRowsToMarkdownTable([
    { expenseItem: '午餐', expenseAmount: '25.50' },
    { expenseItem: '交通费', expenseAmount: '8.00' },
  ])

  assert.equal(
    markdown,
    [
      '| 花销项 | 花销金额 |',
      '| --- | --- |',
      '| 午餐 | 25.50 |',
      '| 交通费 | 8.00 |',
    ].join('\n'),
  )
})

test('convertExpenseRowsToMarkdownTable keeps empty row values', () => {
  const markdown = convertExpenseRowsToMarkdownTable([
    { expenseItem: '', expenseAmount: '' },
  ])

  assert.equal(
    markdown,
    ['| 花销项 | 花销金额 |', '| --- | --- |', '|  |  |'].join('\n'),
  )
})
