import { useRoute, useRouter } from 'vue-router'

export function useRouteQuery() {
  const route = useRoute()
  const router = useRouter()

  function setQueryValue(key: string, value: string | null): void {
    const newQuery = {
      ...route.query,
    }
    if (value) {
      newQuery[key] = value
    } else {
      delete newQuery[key]
    }
    router.push({
      ...route,
      query: newQuery,
    })
  }

  function setQueryArray(key: string, value: string | null): void {
    const newQuery = {
      ...route.query,
    }

    let currentArray = route.query[key] as string[] | undefined
    if (!currentArray) {
      currentArray = []
    }
    if (value) {
      currentArray = currentArray.includes(value)
        ? currentArray.filter((v) => v !== value)
        : [...currentArray, value]

      newQuery[key] = currentArray
    }

    router.push({
      ...route,
      query: newQuery,
    })
  }

  return { setQueryValue, setQueryArray }
}
