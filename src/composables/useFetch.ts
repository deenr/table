export function useFetch() {
  const controllerMap = new Map<string, AbortController>()

  async function fetch<T>(key: string, fn: (signal: AbortSignal) => Promise<T>): Promise<T> {
    if (controllerMap.has(key)) {
      controllerMap.get(key)?.abort()
      controllerMap.delete(key)
    }

    const controller = new AbortController()
    controllerMap.set(key, controller)
    const signal = controller.signal

    console.log('hi')

    return await fn(signal)
  }

  return {
    fetch,
  }
}
