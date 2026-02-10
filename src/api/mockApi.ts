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
const CACHE_TTL_MS = 6000
const SIMULATED_DELAY_MS = { min: 200, max: 1200 }

export async function getUsers(
  params: UserParams,
  options?: { signal: AbortSignal },
): Promise<ApiResponse<User[]>> {
  const { addRequest, updateLatestRequest } = useRequestInspector()
  const requestId = addRequest('users-list')
  const signal = options?.signal

  const start = performance.now()
  let isSettled = false

  const settle = () => {
    isSettled = true
  }

  const markSuccess = (cacheHit: boolean) => {
    if (isSettled) return

    const end = performance.now()
    updateLatestRequest(requestId, {
      status: 'success',
      cacheHit,
      durationInMs: end - start,
    })
    settle()
  }

  const markError = (errorMessage: string) => {
    if (isSettled) return

    updateLatestRequest(requestId, { status: 'error', errorMessage })
    settle()
  }

  const markAborted = () => {
    if (isSettled) return

    const end = performance.now()
    updateLatestRequest(requestId, { status: 'aborted', durationInMs: end - start })
    settle()
  }

  const onAbort = () => {
    markAborted()
  }

  signal?.addEventListener('abort', onAbort, { once: true })

  try {
    assertNotAborted(signal)

    if (shouldSimulateError()) {
      markError('INTERNAL_SERVER_ERROR')
      return createInternalServerErrorResponse()
    }

    const cacheKey = JSON.stringify(params)
    const cachedResponse = getFreshCachedResponse(cacheKey)
    if (cachedResponse) {
      markSuccess(true)
      return cachedResponse
    }

    await waitForDelayOrAbort(signal)
    assertNotAborted(signal)

    const response = createUsersResponse(params)
    cache.set(cacheKey, response)
    markSuccess(false)
    return response
  } catch (error) {
    if (isAbortError(error)) {
      markAborted()
      throw error
    }
    throw error
  } finally {
    signal?.removeEventListener('abort', onAbort)
  }
}

function waitForDelayOrAbort(signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, getSimulatedDelayMs())

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

function assertNotAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw createAbortError()
  }
}

function shouldSimulateError(): boolean {
  return Math.random() < 0.1
}

function getSimulatedDelayMs(): number {
  return SIMULATED_DELAY_MS.min + Math.random() * (SIMULATED_DELAY_MS.max - SIMULATED_DELAY_MS.min)
}

function getFreshCachedResponse(cacheKey: string): ApiResponse<User[]> | undefined {
  const cachedResponse = cache.get(cacheKey)
  if (!cachedResponse) return undefined

  const ageInMs = Math.abs(new Date(cachedResponse.timestamp).getTime() - Date.now())
  if (ageInMs > CACHE_TTL_MS) return undefined

  return cachedResponse
}

function createInternalServerErrorResponse(): ApiResponse<User[]> {
  return {
    message: 'Error trying to retrieved successfully',
    timestamp: new Date().toISOString(),
    success: false,
    data: null,
    pagination: null,
    error: { message: 'Database connection timeout.', code: 'INTERNAL_SERVER_ERROR' },
  }
}

function createUsersResponse(params: UserParams): ApiResponse<User[]> {
  const { currentPage, pageSize } = params.pagination
  const sortedList = getSortedUserList(userList, params.sort)
  const filteredList = getFilteredUserList(sortedList, params.filters)
  const totalPages = Math.ceil(filteredList.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize

  return {
    message: 'Data retrieved successfully',
    timestamp: new Date().toISOString(),
    success: true,
    data: filteredList.slice(startIndex, startIndex + pageSize),
    pagination: {
      currentPage,
      pageSize,
      totalElements: filteredList.length,
      totalPages,
      hasPrevious: currentPage > 1,
      hasNext: currentPage < totalPages,
    },
    error: null,
  }
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
