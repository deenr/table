<template>
  <section class="flex h-full min-h-0 flex-col">
    <header class="flex h-20 flex-col justify-center border-b border-border px-4">
      <p class="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        Request Timeline
      </p>
      <h2 class="mt-2 text-sm font-semibold uppercase tracking-[0.1em]">Inspector</h2>
    </header>
    <div class="min-h-0 flex-1 overflow-y-hidden md:overflow-y-auto px-4 py-2">
      <article
        v-for="request in requests"
        :key="request.requestId"
        class="grid grid-cols-[1fr_2fr] items-baseline gap-x-3 gap-y-1 border-b border-border py-3 last:border-b-0"
      >
        <p
          class="text-[10px] font-semibold uppercase leading-5 tracking-[0.08em] text-muted-foreground"
        >
          Status
        </p>
        <Badge
          :class="{
            ['border-emerald-700 bg-emerald-700 text-white']: request.status === 'success',
            ['border-red-700 bg-red-700 text-white']: request.status === 'error',
            ['border-amber-600 bg-amber-600 text-black']: request.status === 'aborted',
            ['border-zinc-700 bg-zinc-700 text-white']: request.status === 'loading',
          }"
          class="self-center"
          >{{ request.status }}</Badge
        >
        <template v-if="request.status === 'loading'">
          <p
            class="text-[10px] font-semibold uppercase leading-5 tracking-[0.08em] text-muted-foreground"
          >
            Context
          </p>
          <span class="text-sm font-medium leading-5 text-foreground">Loading</span>
        </template>
        <template v-else-if="request.status === 'success'">
          <p
            class="text-[10px] font-semibold uppercase leading-5 tracking-[0.08em] text-muted-foreground"
          >
            Cache Hit
          </p>
          <span class="text-sm font-medium leading-5 text-foreground">{{
            request.cacheHit ? 'Yes' : 'No'
          }}</span>
          <p
            class="text-[10px] font-semibold uppercase leading-5 tracking-[0.08em] text-muted-foreground"
          >
            Duration
          </p>
          <span class="text-sm font-medium leading-5 text-foreground"
            >{{ Math.round(request.durationInMs) }} ms</span
          >
        </template>
        <template v-else-if="request.status === 'aborted'">
          <p
            class="text-[10px] font-semibold uppercase leading-5 tracking-[0.08em] text-muted-foreground"
          >
            Duration
          </p>
          <span class="text-sm font-medium leading-5 text-foreground"
            >{{ Math.round(request.durationInMs) }} ms</span
          >
        </template>
        <template v-else-if="request.status === 'error'">
          <p
            class="text-[10px] font-semibold uppercase leading-5 tracking-[0.08em] text-muted-foreground"
          >
            Error
          </p>
          <span class="text-sm font-medium leading-5 text-foreground">{{
            request.errorMessage
          }}</span>
        </template>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRequestInspector } from '@/composables/useRequestInspector'
import Badge from './ui/badge/Badge.vue'

const { requests } = useRequestInspector()
</script>

<style scoped></style>
