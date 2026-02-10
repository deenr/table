import { reactive } from 'vue'

export type RequestInspect = {
  requestKey: string
  requestId: string
} & (
  | {
      status: 'loading'
    }
  | {
      status: 'success'
      cacheHit: boolean
      durationInMs: number
    }
  | {
      status: 'aborted'
      durationInMs: number
    }
  | {
      status: 'error'
      errorMessage: string
    }
)

const requests = reactive<RequestInspect[]>([])
let requestIdCounter = 0

function createRequestId(): string {
  requestIdCounter += 1
  return `req-${requestIdCounter}`
}

export function useRequestInspector() {
  function addRequest(requestKey: string): string {
    const requestId = createRequestId()
    requests.unshift({ requestKey, requestId, status: 'loading' })
    return requestId
  }

  function updateLatestRequest(
    requestId: string,
    payload:
      | {
          status: 'success'
          cacheHit: boolean
          durationInMs: number
        }
      | {
          status: 'aborted'
          durationInMs: number
        }
      | {
          status: 'error'
          errorMessage: string
        },
    requestKey?: string,
  ): void {
    const requestIndex = requests.findIndex((r) => r.requestId === requestId)

    if (requestIndex !== -1) {
      requests[requestIndex] = {
        requestKey: requests[requestIndex]!.requestKey,
        requestId,
        ...payload,
      }
      return
    }

    if (requestKey) {
      requests.push({
        requestKey,
        requestId,
        ...payload,
      })
    }
  }

  return { requests, addRequest, updateLatestRequest }
}
