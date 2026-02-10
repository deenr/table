<template>
  <div class="mx-auto flex h-dvh w-full max-w-[1320px] flex-col overflow-hidden p-4 md:p-6">
    <header class="mb-4 border border-border bg-card px-4 py-3">
      <p class="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        Async Data Inspector
      </p>
      <h1 class="mt-2 text-xl font-semibold uppercase tracking-[0.16em]">Users List Requests</h1>
    </header>
    <div
      class="grid min-h-0 flex-1 grid-cols-1 border border-border bg-card md:grid-cols-[minmax(0,1fr)_320px]"
    >
      <section
        class="relative flex min-h-0 min-w-0 flex-col border-b border-border md:border-r md:border-b-0"
      >
        <div class="flex h-20 items-center border-b border-border px-4">
          <DataFilters :filter="filter" />
        </div>
        <main class="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <DataTable
            class="min-h-0 min-w-0 flex-1"
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
              },
            ]"
            :items="items"
          />
          <Pagination
            v-slot="{ page }"
            :items-per-page="pageSize"
            :total="pagination?.totalElements"
            :default-page="pagination?.currentPage"
            :sibling-count="1"
            :show-edges="true"
            class="min-w-0 shrink-0 overflow-hidden"
            @update:page="setQueryValue('page', $event.toString())"
          >
            <PaginationContent v-slot="{ items }" class="w-full min-w-0 border-t border-border p-3">
              <template v-for="(item, index) in items" :key="index">
                <PaginationItem
                  v-if="item.type === 'page'"
                  :value="item.value"
                  :is-active="item.value === page"
                  size="icon-sm"
                >
                  {{ item.value }}
                </PaginationItem>
              </template>
              <PaginationPrevious size="sm" class="ml-auto" />
              <PaginationNext size="sm" />
            </PaginationContent>
          </Pagination>
          <section
            v-if="error"
            class="absolute inset-0 z-50 flex items-center justify-center bg-background/80 p-4"
          >
            <div
              class="animate-in fade-in zoom-in duration-200 border border-border bg-card p-8 text-center"
            >
              <div
                class="mx-auto mb-4 flex h-10 w-10 items-center justify-center border border-border"
              >
                <AlertCircle class="h-5 w-5 text-foreground" />
              </div>
              <h3 class="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Request Failed
              </h3>
              <h3 class="mt-2 text-base font-semibold uppercase tracking-[0.08em]">
                {{ error.code }}
              </h3>
              <h3 v-if="error.field" class="text-sm font-medium uppercase tracking-[0.08em]">
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
      </section>
      <RequestInspector class="h-full min-h-[260px] md:min-h-0" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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
