<template>
  <div class="flex flex-col gap-4 min-h-screen overflow-hidden max-w-5xl mx-auto p-4">
    <DataFilters />
    <Separator />
    <main class="flex flex-col gap-4 flex-1">
      <DataTable
        class="h-120"
        :columns="[
          { key: 'name', label: 'Name' },
          { key: 'job_title', label: 'Job', badge: true },
          { key: 'sex', label: 'Sex', badge: true },
        ]"
        :items="userList"
      />

      <Pagination
        v-slot="{ page }"
        :items-per-page="pageSize"
        :total="pagination?.totalElements"
        :default-page="pagination?.currentPage"
        @update:page="onPageUpdate"
      >
        <PaginationContent v-slot="{ items }" class="w-full">
          <template v-for="(item, index) in items" :key="index">
            <PaginationItem
              v-if="item.type === 'page'"
              :value="item.value"
              :is-active="item.value === page"
            >
              {{ item.value }}
            </PaginationItem>
          </template>
          <PaginationPrevious class="ml-auto" />
          <PaginationNext />
        </PaginationContent>
      </Pagination>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Separator } from '@/components/ui/separator'
import DataTable from '@/components/DataTable.vue'
import DataFilters from '@/components/DataFilters.vue'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { getUsers, type PaginationMetadata, type User } from '@/api/mockApi'
import { useRoute } from 'vue-router'

const route = useRoute()

const pageSize = 30

const currentPage = ref<number>(1)
const userList = ref<User[]>([])
const pagination = ref<PaginationMetadata>()

function onPageUpdate(page: number): void {
  currentPage.value = page
}

watch(
  [() => route.query, () => currentPage.value],
  async ([query, currentPage]) => {
    const response = await getUsers({
      filters: { ...query },
      pagination: { currentPage, pageSize },
    })
    if (response.success) {
      userList.value = response.data
      pagination.value = response.pagination
    }
  },
  { immediate: true },
)
</script>

<style scoped></style>
