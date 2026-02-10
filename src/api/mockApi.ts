export interface User {
  id: string
  name: string
  job_title: string
  sex: string
}

export interface UserParams {
  filters?: { name?: string; job_title?: string[]; sex?: string[] }
  pagination: {
    currentPage: number
    pageSize: number
  }
}

import { faker } from '@faker-js/faker'

const userList: User[] = Array.from({ length: 10000 }).map(() => {
  const sex = faker.person.sexType()

  return {
    id: faker.string.uuid(),
    name: faker.person.fullName({ sex }),
    job_title: faker.person.jobTitle(),
    sex,
  }
})

export async function getUsers(params: UserParams): Promise<ApiResponse<User[]>> {
  const { currentPage, pageSize } = params.pagination
  const totalPages = Math.ceil(userList.length / pageSize)
  return {
    message: 'Data retrieved successfully',
    timestamp: new Date().toISOString(),
    success: true,
    data: getFilteredUserList(userList, params.filters).slice(
      currentPage * pageSize,
      currentPage * pageSize + pageSize,
    ),
    pagination: {
      currentPage,
      pageSize,
      totalElements: userList.length,
      totalPages: Math.ceil(userList.length / pageSize),
      hasPrevious: currentPage - 1 > 0,
      hasNext: currentPage - 1 !== totalPages,
    },
    errors: null,
  }
}

function getFilteredUserList(list: User[], filters: UserParams['filters']): User[] {
  if (!filters) return list

  return list.filter((user) => {
    let isUserIncluded = true
    if (filters.name && !user.name.toLowerCase().includes(filters.name.toLowerCase())) {
      isUserIncluded = false
    }
    if (
      filters.job_title &&
      filters.job_title.length > 0 &&
      !filters.job_title.includes(user.job_title)
    ) {
      isUserIncluded = false
    }
    if (filters.sex && filters.sex.length > 0 && !filters.sex.includes(user.sex)) {
      isUserIncluded = false
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
      errors: null
    })
  | (BaseResponse & {
      success: false
      data: null
      pagination: null
      errors: ApiError[]
    })
