<template>
  <div class="relative h-full min-h-0 flex flex-col gap-4 max-w-5xl mx-auto p-4">
    <DataFilters :filter="filter" />
    <Separator />
    <main class="h-full min-h-0 relative flex flex-col gap-4 flex-1">
      <DataTable
        class="h-full min-h-0"
        :loading="loading"
        :columns="[
          { key: 'name', label: 'Name', skeletonWidth: 'w-[100px]' },
          {
            key: 'countryCode',
            label: 'Country',
            badge: { imageKey: 'countryFlag' },
            skeletonWidth: 'w-[100px]',
            formatter: (value) => getCountryNameByCode(value),
          },
          {
            key: 'sex',
            label: 'Sex',
            badge: true,
            skeletonWidth: 'w-[48px]',
            formatter: (value) => (value === 'male' ? 'Male' : 'Female'),
          },
        ]"
        :items="items"
      />
      <Pagination
        v-slot="{ page }"
        :items-per-page="pageSize"
        :total="pagination?.totalElements"
        :default-page="pagination?.currentPage"
        @update:page="setQueryValue('page', $event.toString())"
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
      <section
        v-if="error"
        class="absolute inset-0 z-50 flex items-center justify-center bg-background/60"
      >
        <div
          class="flex flex-col items-center text-center p-8 border rounded-xl bg-card shadow-lg animate-in fade-in zoom-in duration-200"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4"
          >
            <AlertCircle class="h-6 w-6 text-destructive" />
          </div>

          <h3 class="text-lg font-semibold tracking-tight">
            {{ error.code }}
          </h3>
          <h3 class="text-lg font-semibold tracking-tight">
            {{ error.field }}
          </h3>
          <p class="mt-2 text-sm text-muted-foreground leading-relaxed">
            {{ error.message }}
          </p>

          <Button variant="outline" size="sm" class="mt-6" @click="() => retryCount++">
            <RotateCcw class="h-4 w-4" />
            Try again
          </Button>
        </div>
      </section>
    </main>
  </div>
  <RequestInspector class="absolute right-0 top-0 bottom-0 h-full" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Separator } from '@/components/ui/separator'
import DataTable from '@/components/DataTable.vue'
import DataFilters, { type DataFilter } from '@/components/DataFilters.vue'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { getUsers, type ApiError, type PaginationMetadata, type User } from '@/api/mockApi'
import { useRouteQuery } from '@/composables/useRouteQuery'
import { AlertCircle, RotateCcw } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import { useFetch } from '@/composables/useFetch'

import userListJSON from '../../public/users.json'
import countriesJSON from '../../public/countries.json'
import RequestInspector from '@/components/RequestInspector.vue'

const { query, setQueryValue } = useRouteQuery()
const { fetch } = useFetch()

const filter: DataFilter = {
  search: {
    key: 'name',
    placeholder: 'Search name',
  },
  filters: [
    {
      key: 'country',
      label: 'Country',
      options: [...new Set(userListJSON.map((u) => u.countryCode))].map((c) => ({
        id: c,
        label: getCountryNameByCode(c)!,
      })),
    },
    {
      key: 'sex',
      label: 'Sex',
      options: [
        { id: 'male', label: 'Male' },
        { id: 'female', label: 'Female' },
      ],
    },
  ],
}

const pageSize = 30
const pagination = ref<PaginationMetadata>()

const userList = ref<User[]>([])
const items = computed<(User & { countryFlag: string | undefined })[]>(() =>
  userList.value.map((user) => {
    return {
      ...user,
      countryFlag: getCountryFlagByCode(user.countryCode),
    }
  }),
)

function getCountryNameByCode(countryCode: string): string | undefined {
  return countriesJSON.find((c) => c.code === countryCode)?.name
}

function getCountryFlagByCode(countryCode: string): string | undefined {
  const country = countriesJSON.find((c) => c.code === countryCode)
  return country ? `https://hatscripts.github.io/circle-flags/flags/${country.tld}.svg` : undefined
}

const loading = ref(false)
const error = ref<ApiError | null>(null)
const retryCount = ref(0)

watch(
  [query, retryCount],
  async ([query]) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('users-list', (signal) =>
        getUsers(
          {
            filters: { ...query },
            pagination: { currentPage: (query.page as unknown as number) ?? 1, pageSize },
          },
          { signal },
        ),
      )
      if (response.success) {
        userList.value = response.data
        pagination.value = response.pagination
        console.log(response.pagination)
      } else {
        userList.value = []
        error.value = response.error
      }
    } catch {
      // usual error functionality
    } finally {
      loading.value = false
    }
  },
  { immediate: true, deep: true },
)
</script>

<style scoped></style>
