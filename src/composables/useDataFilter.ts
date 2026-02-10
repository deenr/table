import { reactive } from 'vue'

const globalState = reactive<Record<string, Record<string, string | string[]>>>({})

export function useDataFilter(id: string) {
  if (!globalState[id]) {
    globalState[id] = {}
  }

  const state = globalState[id]

  function updateFilter(key: string, value: string | string[]): void {
    state[key] = value
  }

  return {
    state,
    updateFilter,
  }
}
