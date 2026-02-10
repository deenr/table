<script setup lang="ts">
import type { PaginationListProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { PaginationList } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<PaginationListProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <PaginationList
    v-slot="slotProps"
    data-slot="pagination-content"
    v-bind="delegatedProps"
    :class="
      cn(
        'm-0 flex w-full min-w-0 list-none flex-row items-center gap-1 overflow-x-auto p-0 whitespace-nowrap',
        props.class,
      )
    "
  >
    <slot v-bind="slotProps" />
  </PaginationList>
</template>
