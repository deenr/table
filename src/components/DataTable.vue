<template>
  <div class="overflow-y-auto bg-background">
    <Table>
      <TableHeader class="bg-white sticky top-0 z-10 border-b border-border">
        <TableRow>
          <TableHead v-for="column in props.columns" :key="column.key">{{
            column.label
          }}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="loading">
          <TableRow v-for="(_, index) in [...Array(30)]" :key="index">
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
          <TableRow v-for="item in items" :key="item.id">
            <TableCell v-for="column in props.columns" :key="item.id + column.key">
              <Badge v-if="column.badge">
                <img
                  v-if="typeof column.badge === 'object' && column.badge.imageKey"
                  class="size-3"
                  :src="item[column.badge.imageKey]"
                />
                {{ item.formatter ? item.formatter(item[column.key]) : item[column.key] }}
              </Badge>
              <template v-else>
                {{ item.formatter ? item.formatter(item[column.key]) : item[column.key] }}
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

type DataColumn = {
  key: string
  label: string
  badge?: boolean | { imageKey: string }
  skeletonWidth?: string
  formatter?: (value: string) => string | undefined
}

const props = defineProps<{
  loading?: boolean
  columns: DataColumn[]
  items: ({ id: string } & T)[]
}>()
</script>

<style scoped></style>
