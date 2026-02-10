<script setup lang="ts">
import { ref, computed, type Component } from 'vue'
import AsyncDashboard from '@/pages/AsyncDashboard.vue'

const routes: Record<string, Component> = {
  '/': AsyncDashboard,
}

const currentPath = ref(window.location.hash)

window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash
})

const currentView = computed(() => {
  return routes[currentPath.value.slice(1) || '/'] || AsyncDashboard
})
</script>

<template>
  <component :is="currentView" />
</template>

<style scoped></style>
