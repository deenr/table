<template>
  <div class="flex flex-col gap-4 min-h-screen max-w-5xl mx-auto p-4">
    <DataFilters />
    <Separator />
    <main>
      <DataTable
        :columns="[
          { key: 'name', label: 'Name' },
          { key: 'job', label: 'Job', badge: true },
        ]"
        :items="[{ id: '1', name: 'Dean', job: 'Software Engineer' }]"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { Separator } from '@/components/ui/separator'
import DataTable from '@/components/DataTable.vue'
import DataFilters from '@/components/DataFilters.vue'
</script>

<style scoped></style>
