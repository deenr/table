<template>
  <section class="m-4 p-4 border-1">
    <article
      v-for="request in requests"
      :key="request.requestId"
      class="grid grid-cols-[1fr_2fr] items-baseline gap-x-2 gap-y-1 border-b border-slate-200 py-3 last:border-b-0"
    >
      <p class="text-xs font-semibold uppercase leading-5 tracking-wide text-slate-500">Key</p>
      <span class="text-sm font-medium leading-5 text-slate-900">{{ request.requestKey }}</span>
      <p class="text-xs font-semibold uppercase leading-5 tracking-wide text-slate-500">Status</p>
      <Badge
        :class="{
          ['bg-green-500']: request.status === 'success',
          ['bg-red-500']: request.status === 'error',
          ['bg-blue-500']: request.status === 'aborted',
          ['bg-slate-500']: request.status === 'loading',
        }"
        class="self-center"
        >{{ request.status }}</Badge
      >
      <template v-if="request.status === 'loading'">
        <p class="text-xs font-semibold uppercase leading-5 tracking-wide text-slate-500">
          Context
        </p>
        <span class="text-sm font-medium leading-5 text-slate-900">Loading</span>
      </template>
      <template v-else-if="request.status === 'success'">
        <p class="text-xs font-semibold uppercase leading-5 tracking-wide text-slate-500">
          Cache Hit
        </p>
        <span class="text-sm font-medium leading-5 text-slate-900">{{
          request.cacheHit ? 'Yes' : 'No'
        }}</span>
        <p class="text-xs font-semibold uppercase leading-5 tracking-wide text-slate-500">
          Duration
        </p>
        <span class="text-sm font-medium leading-5 text-slate-900"
          >{{ request.durationInMs }} ms</span
        >
      </template>
      <template v-else-if="request.status === 'aborted'">
        <p class="text-xs font-semibold uppercase leading-5 tracking-wide text-slate-500">
          Duration
        </p>
        <span class="text-sm font-medium leading-5 text-slate-900"
          >{{ request.durationInMs }} ms</span
        >
      </template>
      <template v-else-if="request.status === 'error'">
        <p class="text-xs font-semibold uppercase leading-5 tracking-wide text-slate-500">Error</p>
        <span class="text-sm font-medium leading-5 text-red-700">{{ request.errorMessage }}</span>
      </template>
    </article>
  </section>
</template>

<script setup lang="ts">
import { useRequestInspector } from '@/composables/useRequestInspector'
import Badge from './ui/badge/Badge.vue'

const { requests } = useRequestInspector()
</script>

<style scoped></style>
