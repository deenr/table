<template>
  <div class="overflow-y-auto">
    <Table>
      <TableHeader class="sticky top-0 z-10 bg-card border-b border-border">
        <TableRow>
          <TableHead
            v-for="column in props.columns"
            :key="column.key"
            :class="{
              'cursor-pointer': column.sortable,
            }"
            @click="column.sortable ? setSortKey(column.key) : undefined"
          >
            <span v-if="column.sortable" class="flex flex-row gap-1">
              {{ column.label }}
              <template v-if="sortKey === column.key">
                <ArrowDown v-if="sortDirection === 'asc'" class="size-3" />
                <ArrowUp v-if="sortDirection === 'desc'" class="size-3" />
              </template>
            </span>
            <template v-else>{{ column.label }}</template>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody class="bg-card">
        <template v-if="loading">
          <TableRow v-for="(_, index) in [...Array(30)]" :key="index" class="bg-card">
            <TableCell v-for="column in props.columns" :key="index + column.key">
              <Skeleton
                v-if="column.badge"
                :class="[column.skeletonWidth ?? 'w-[56px]', 'h-[22px]']"
              />
              <Skeleton v-else :class="[column.skeletonWidth ?? 'w-[72px]', 'h-[17px]']" />
            </TableCell>
          </TableRow>
        </template>
        <template v-else>
          <TableRow v-for="item in items" :key="item.id" class="bg-card">
            <TableCell v-for="column in props.columns" :key="item.id + column.key">
              <Badge v-if="column.badge">
                <img
                  v-if="typeof column.badge === 'object' && column.badge.imageKey"
                  class="size-3"
                  :src="item[column.badge.imageKey]"
                />
                {{ column.formatter ? column.formatter(item[column.key]) : item[column.key] }}
              </Badge>
              <template v-else>
                {{ column.formatter ? column.formatter(item[column.key]) : item[column.key] }}
              </template>
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowDown, ArrowUp } from 'lucide-vue-next'
import { ref, watch } from 'vue'

type DataColumn = {
  key: string
  label: string
  sortable?: boolean
  badge?: boolean | { imageKey: string }
  skeletonWidth?: string
  formatter?: (value: string) => string | undefined
}

const props = defineProps<{
  loading?: boolean
  columns: DataColumn[]
  items: ({ id: string } & T)[]
  sort?: { key: string; direction: 'asc' | 'desc' } | null
}>()

const emit = defineEmits<{
  sortChange: [{ key: string; direction: 'asc' | 'desc' } | null]
}>()

const sortKey = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc'>('asc')

watch(
  () => props.sort,
  (sort) => {
    sortKey.value = sort?.key ?? null
    sortDirection.value = sort?.direction ?? 'asc'
  },
  { immediate: true },
)

function setSortKey(key: string): void {
  if (sortKey.value === key) {
    if (sortDirection.value === 'asc') {
      sortKey.value = key
      sortDirection.value = 'desc'

      emit('sortChange', { key: sortKey.value, direction: sortDirection.value })
    } else {
      sortKey.value = null
      sortDirection.value = 'asc'

      emit('sortChange', null)
    }
  } else {
    sortKey.value = key
    sortDirection.value = 'asc'

    emit('sortChange', { key: sortKey.value, direction: sortDirection.value })
  }
}
</script>

<style scoped></style>
