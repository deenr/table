<template>
  <div class="overflow-y-auto">
    <Table>
      <TableHeader class="bg-background sticky top-0">
        <TableRow>
          <TableHead v-for="column in props.columns" :key="column.key">{{
            column.label
          }}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="item in items" :key="item.id">
          <TableCell v-for="column in props.columns" :key="item.id + column.key">
            <Badge v-if="column.badge">{{ item[column.key] }}</Badge>
            <template v-else>
              {{ item[column.key] }}
            </template>
          </TableCell>
        </TableRow>
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

type DataColumn = {
  key: string
  label: string
  badge?: boolean
}

const props = defineProps<{
  columns: DataColumn[]
  items: ({ id: string } & T)[]
}>()
</script>

<style scoped></style>
