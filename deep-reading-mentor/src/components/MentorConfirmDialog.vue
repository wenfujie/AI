<script setup lang="ts">
defineProps<{
  open: boolean
  message: string
}>()

const emit = defineEmits<{
  cancel: []
  confirm: []
}>()
</script>

<template>
  <div v-if="open" class="confirm-mask">
    <div class="confirm-card">
      <p>{{ message }}</p>
      <div class="confirm-actions">
        <button class="btn ghost" @click="emit('cancel')">
          取消
        </button>
        <button class="btn primary" @click="emit('confirm')">
          确认
        </button>
      </div>
    </div>
  </div>
</template>
