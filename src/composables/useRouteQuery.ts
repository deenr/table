import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useRouteQuery() {
  const route = useRoute()
  const router = useRouter()

  const query = computed(() => route.query)

  function setQueryValue(key: string, value: string | null): void {
    const newQuery = {
      ...query.value,
    }
    if (value) {
      newQuery[key] = query.value[key] === value ? [] : value
    } else {
      delete newQuery[key]
    }
    router.replace({
      ...route,
      query: newQuery,
    })
  }

  function setQueryValues(values: Record<string, string | null>): void {
    const newQuery = {
      ...query.value,
    }

    for (const [key, value] of Object.entries(values)) {
      if (value) {
        newQuery[key] = value
      } else {
        delete newQuery[key]
      }
    }

    router.replace({
      ...route,
      query: newQuery,
    })
  }

  function setQueryArray(key: string, value: string | null): void {
    const newQuery = {
      ...query.value,
    }

    let currentArray = query.value[key] as string[] | undefined
    if (!currentArray) {
      currentArray = []
    }
    if (value) {
      currentArray = currentArray.includes(value)
        ? currentArray.filter((v) => v !== value)
        : [...currentArray, value]

      newQuery[key] = currentArray
    }

    console.log(currentArray)

    router.replace({
      ...route,
      query: newQuery,
    })
  }

  function removeQueryByKey(key: string): void {
    const newQuery = {
      ...query.value,
    }
    delete newQuery[key]
    router.replace({
      ...route,
      query: newQuery,
    })
  }

  return { query, setQueryValue, setQueryValues, setQueryArray, removeQueryByKey }
}
