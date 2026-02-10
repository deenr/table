export interface User {
  id: string
  name: string
  countryCode: string
  sex: string
}

export interface UserParams {
  filters?: { name?: string; country?: string[]; sex?: string[] }
  sort?: { key: string; order: string }
  pagination: {
    currentPage: number
    pageSize: number
  }
}

import { useRequestInspector } from '@/composables/useRequestInspector'
import userList from '../../public/users.json'

import { faker } from '@faker-js/faker'

// const userList: User[] = Array.from({ length: 10000 }).map(() => {
//   const sex = faker.person.sexType()

//   return {
//     id: faker.string.uuid(),
//     name: faker.person.fullName({ sex }),
//     countryCode: faker.location.countryCode(),
//     sex,
//   }
// })

const cache = new Map<string, ApiResponse<User[]>>()

export async function getUsers(
  params: UserParams,
  options?: { signal: AbortSignal },
): Promise<ApiResponse<User[]>> {
  const { addRequest, updateLatestRequest } = useRequestInspector()
  const requestId = addRequest('users-list')

  const start = performance.now()
  let isSettled = false

  const markSettled = () => {
    isSettled = true
  }

  const throwIfAborted = () => {
    if (options?.signal?.aborted) {
      throw createAbortError()
    }
  }

  const onAbort = () => {
    if (isSettled) return

    const end = performance.now()
    updateLatestRequest(requestId, { status: 'aborted', durationInMs: end - start })
    markSettled()
  }

  if (options?.signal) {
    options.signal.addEventListener('abort', onAbort, { once: true })
  }

  try {
    throwIfAborted()

    const { currentPage, pageSize } = params.pagination
    const totalPages = Math.ceil(userList.length / pageSize)

    const hasError = Math.random() < 0.1
    if (hasError) {
      if (!isSettled) {
        updateLatestRequest(requestId, {
          status: 'error',
          errorMessage: 'INTERNAL_SERVER_ERROR',
        })
        markSettled()
      }
      return {
        message: 'Error trying to retrieved successfully',
        timestamp: new Date().toISOString(),
        success: false,
        data: null,
        pagination: null,
        error: { message: 'Database connection timeout.', code: 'INTERNAL_SERVER_ERROR' },
      }
    }

    const cacheKey = JSON.stringify(params)
    if (cache.has(cacheKey)) {
      const cachedResponse = cache.get(cacheKey)
      if (
        cachedResponse &&
        Math.abs(new Date(cachedResponse.timestamp).getTime() - new Date().getTime()) <= 6000
      ) {
        if (!isSettled) {
          const end = performance.now()
          updateLatestRequest(requestId, {
            status: 'success',
            cacheHit: true,
            durationInMs: end - start,
          })
          markSettled()
        }
        return cachedResponse
      }
    }

    await waitForDelayOrAbort(options?.signal)
    throwIfAborted()

    const sortedList = getSortedUserList(userList, params.sort)
    const filteredList = getFilteredUserList(sortedList, params.filters)

    const newResponse = {
      message: 'Data retrieved successfully',
      timestamp: new Date().toISOString(),
      success: true,
      data: filteredList.slice(currentPage * pageSize, currentPage * pageSize + pageSize),
      pagination: {
        currentPage,
        pageSize,
        totalElements: filteredList.length,
        totalPages: Math.ceil(filteredList.length / pageSize),
        hasPrevious: currentPage - 1 > 0,
        hasNext: currentPage - 1 !== totalPages,
      },
      error: null,
    } as ApiResponse<User[]>
    cache.set(cacheKey, newResponse)

    if (!isSettled) {
      const end = performance.now()
      updateLatestRequest(requestId, {
        status: 'success',
        cacheHit: false,
        durationInMs: end - start,
      })
      markSettled()
    }
    return newResponse
  } catch (error) {
    if (isAbortError(error)) {
      if (!isSettled) {
        const end = performance.now()
        updateLatestRequest(requestId, { status: 'aborted', durationInMs: end - start })
        markSettled()
      }
      throw error
    }
    throw error
  } finally {
    if (options?.signal) {
      options.signal.removeEventListener('abort', onAbort)
    }
  }
}

function waitForDelayOrAbort(signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const minTime = 200
    const maxTime = 1200
    const timeout = setTimeout(
      () => {
        signal?.removeEventListener('abort', onAbort)
        resolve()
      },
      minTime + Math.random() * (maxTime - minTime),
    )

    const onAbort = () => {
      clearTimeout(timeout)
      signal?.removeEventListener('abort', onAbort)
      reject(createAbortError())
    }

    if (!signal) return
    if (signal.aborted) {
      clearTimeout(timeout)
      reject(createAbortError())
      return
    }
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

function createAbortError(): Error {
  const error = new Error('Aborted')
  error.name = 'AbortError'
  return error
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

function getFilteredUserList(list: User[], filters: UserParams['filters']): User[] {
  if (!filters) return list

  return list.filter((user) => {
    const isUserIncluded = true

    if (filters.name) {
      const searchTerm = filters.name.toLowerCase()
      const userName = user.name?.toLowerCase() ?? ''
      if (!userName.includes(searchTerm)) return false
    }
    if (filters.country?.length && !filters.country.includes(user.countryCode)) {
      return false
    }
    if (filters.sex?.length && !filters.sex.includes(user.sex)) {
      return false
    }

    return isUserIncluded
  })
}

function getSortedUserList(list: User[], sort: UserParams['sort']): User[] {
  if (!sort) return list

  const sortKey = sort.key as keyof User
  const sortOrder = sort.order as 'asc' | 'desc'
  const isAscending = sortOrder === 'asc'

  return [...list].sort((a, b) => {
    const comparison = a[sortKey].localeCompare(b[sortKey])
    return isAscending ? comparison : comparison * -1
  })
}

/**
 * Metadata for paginated collections
 */
export interface PaginationMetadata {
  currentPage: number
  pageSize: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

/**
 * Standard error format for validation or logic failures
 */
export interface ApiError {
  field?: string // e.g., "email"
  message: string // e.g., "Email is already taken"
  code?: string // e.g., "ERR_USER_EXISTS"
}

/**
 * Base properties shared by all responses
 */
interface BaseResponse {
  message: string
  timestamp: string // ISO 8601 format
}

/**
 * The generic ApiResponse using a Discriminated Union
 */
export type ApiResponse<T> =
  | (BaseResponse & {
      success: true
      data: T
      pagination?: PaginationMetadata
      error: null
    })
  | (BaseResponse & {
      success: false
      data: null
      pagination: null
      error: ApiError
    })
