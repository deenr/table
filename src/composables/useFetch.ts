export function useFetch() {
  const controllerMap = new Map<string, AbortController>()

  async function fetch<T>(
    key: string,
    fn: (signal: AbortSignal) => Promise<T>,
  ): Promise<T | undefined> {
    if (controllerMap.has(key)) {
      controllerMap.get(key)?.abort()
      controllerMap.delete(key)
    }

    const controller = new AbortController()
    controllerMap.set(key, controller)
    const signal = controller.signal

    try {
      return await fn(signal)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return undefined
      }
      throw error
    } finally {
      if (controllerMap.get(key) === controller) {
        controllerMap.delete(key)
      }
    }
  }

  return {
    fetch,
  }
}
