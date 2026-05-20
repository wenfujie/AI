import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('BaseModal exposes reusable slots and close event contract', () => {
  const content = readFileSync('./src/components/BaseModal.vue', 'utf8')

  assert.match(content, /defineProps<\{\s*open: boolean\s*title: string/s)
  assert.match(content, /\(event: 'close'\): void/)
  assert.match(content, /<slot \/>/)
  assert.match(content, /<slot name="actions" \/>/)
})
