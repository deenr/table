<template>
  <header class="flex align-center justify-between">
    <InputGroup v-if="props.filter.search" class="w-xs">
      <InputGroupInput
        :placeholder="props.filter.search.placeholder"
        :value="query[props.filter.search.key]"
        @update:modelValue="setQueryValue(props.filter.search.key, $event)"
      />
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
    </InputGroup>
    <DropdownMenu v-if="props.filter">
      <DropdownMenuTrigger as-child>
        <Button variant="outline">
          <Filter />
          Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56" align="start">
        <DropdownMenuSub
          v-for="filter in props.filter.filters"
          :key="filter.key"
          class="max-h-screen overflow-y-scroll"
        >
          <DropdownMenuSubTrigger>{{ filter.label }}</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                v-for="option in filter.options"
                :key="`${filter.key}_${option.id}`"
                @click="
                  filter.multiple
                    ? setQueryArray(filter.key, option.id)
                    : setQueryValue(filter.key, option.id)
                "
              >
                {{ option.label }}
                <Check
                  v-if="
                    filter.multiple
                      ? query[filter.key]?.includes(option.id)
                      : query[filter.key] === option.id
                  "
                />
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  </header>
</template>

<script setup lang="ts">
import { Check, Filter, Search } from 'lucide-vue-next'
import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouteQuery } from '@/composables/useRouteQuery'

export interface DataFilter {
  search?: {
    key: string
    placeholder?: string
  }
  filters?: {
    key: string
    label: string
    options: { id: string; label: string }[]
    multiple?: boolean
  }[]
}

const { query, setQueryValue, setQueryArray } = useRouteQuery()

const props = defineProps<{
  filter: DataFilter
}>()
</script>

<style scoped></style>
