<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
}>()

const emit = defineEmits<{
  (event: 'close'): void
}>()

function requestClose() {
  emit('close')
}
</script>

<template>
  <div v-if="open" class="modal-overlay" role="presentation" @click.self="requestClose">
    <section
      class="modal-panel"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
    >
      <header class="modal-header">
        <h2>{{ title }}</h2>
        <button type="button" class="modal-close-icon" @click="requestClose">
          ×
        </button>
      </header>
      <div class="modal-body">
        <slot />
      </div>
      <footer class="modal-actions">
        <slot name="actions" />
      </footer>
    </section>
  </div>
</template>
