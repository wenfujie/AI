import test from 'node:test'
import assert from 'node:assert/strict'

import {
  calculateExpenseTotal,
  normalizeExpenseAmountInput,
} from '../src/utils/expenseAmount.js'

test('normalizeExpenseAmountInput strips invalid characters and limits decimals', () => {
  assert.equal(normalizeExpenseAmountInput('12a3.4567'), '123.45')
  assert.equal(normalizeExpenseAmountInput('.5'), '0.5')
  assert.equal(normalizeExpenseAmountInput('12..34'), '12.34')
})

test('calculateExpenseTotal sums valid amount strings', () => {
  assert.equal(calculateExpenseTotal(['12.30', '0.10', '', '3']), 15.4)
})
