export interface User {
  id: string
  name: string
  countryCode: string
  sex: string
}

export interface UserParams {
  filters?: { name?: string; country?: string[]; sex?: string[] }
  pagination: {
    currentPage: number
    pageSize: number
  }
}

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
  if (options?.signal) {
    options.signal.addEventListener('abort', () => {
      throw new Error('Aborted')
    })
  }

  const { currentPage, pageSize } = params.pagination
  const totalPages = Math.ceil(userList.length / pageSize)

  const hasError = Math.random() < 0.1
  if (hasError) {
    return {
      message: hasError ? 'Error trying to retrieved successfully' : 'Data retrieved successfully',
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
      return cachedResponse
    }
  }

  await new Promise((resolve) => {
    const minTime = 200
    const maxTime = 1200

    setTimeout(resolve, minTime + Math.random() * (maxTime - minTime))
  })

  const filteredList = getFilteredUserList(userList, params.filters)

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

  return newResponse
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
