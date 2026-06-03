<script setup lang="ts">
import type { MentorView } from '~/composables'

defineProps<{
  currentView: MentorView
  navItems: Array<{ label: string, view: MentorView }>
  reviewBadgeFor: (view: MentorView) => number | null
}>()

const emit = defineEmits<{
  switchView: [view: MentorView]
}>()
</script>

<template>
  <aside class="sidebar">
    <div class="logo">
      <span class="logo-mark">📚</span>
      <div>
        <h2>深度阅读导师</h2>
        <p>全方法版</p>
      </div>
    </div>

    <nav class="nav-links">
      <button
        v-for="item in navItems"
        :key="item.view"
        class="nav-link"
        :class="{ active: currentView === item.view }"
        @click="emit('switchView', item.view)"
      >
        <span>{{ item.label }}</span>
        <span
          v-if="reviewBadgeFor(item.view) !== null"
          class="badge"
          :class="{ urgent: item.view === 'daily-review' && (reviewBadgeFor(item.view) ?? 0) > 0 }"
        >
          {{ reviewBadgeFor(item.view) }}
        </span>
      </button>
    </nav>

    <div class="sidebar-footer">
      <p>SQ3R / 费曼 / RIA / 康奈尔 / 间隔重复 / 主题阅读</p>
    </div>
  </aside>
</template>
