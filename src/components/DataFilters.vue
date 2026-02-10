<template>
  <header class="flex align-center justify-between">
    <InputGroup class="w-xs">
      <InputGroupInput placeholder="Search..." v-model="nameFilter" />
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
    </InputGroup>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline">
          <Filter />
          Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56" align="start">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Jobs</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem @click="setQueryArray('job', 'Software Engineer')">
                Software Engineer
              </DropdownMenuItem>
              <DropdownMenuItem @click="setQueryArray('job', 'Nurse')"> Nurse </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  </header>
</template>

<script setup lang="ts">
import { Filter, Search } from 'lucide-vue-next'
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
import { ref, watch } from 'vue'
import { useRouteQuery } from '@/composables/useRouteQuery'

const { setQueryValue, setQueryArray } = useRouteQuery()

const nameFilter = ref<string | null>(null)

watch(nameFilter, (value) => setQueryValue('name', value))
</script>

<style scoped></style>
