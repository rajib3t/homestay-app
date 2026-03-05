import type { ApiError } from '@/lib/api'
import { publicApi, apiClient, REFRESH_TOKEN, ACCESS_TOKEN, REFRESH_ENDPOINT } from '@/lib/api'
import { saveAuthToken } from '@/lib/auth'
import type { ApiResponse } from '@/types/common'
import type { UserData } from '@/types/user'
import { resetAppState } from '@/store/auth'
import { queryClient } from '@/lib/query-client'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: UserData
}

export interface RefreshTokenResponse {
  access_token: string
  refresh_token?: string
}

export const login = async (loginRequest: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  try {
    const response = await publicApi.post<LoginResponse>('/auth/login', loginRequest)
    console.log(response)
    // API client wraps backend response: { status, message, data: { access_token, refresh_token, user } }
    const tokens = (response.data as any)?.data as LoginResponse

    if (tokens?.access_token) {
      apiClient.setAuthToken(tokens.access_token)
      // Persist token to localStorage for isAuthenticated checks and page reloads
      saveAuthToken(tokens.access_token)
    }

    if (tokens?.refresh_token) {
      // Persist refresh token to localStorage
      try {
        localStorage.setItem(REFRESH_TOKEN, tokens.refresh_token)
      } catch (e) {
        console.warn('Failed to persist refresh token', e)
      }
    }

    return response
  } catch (error) {
    throw error as ApiError
  }
}

export const logout = () => {
  try {
    // 1. Clear API auth headers
    apiClient.clearAuthToken()

    // 2. Remove stored tokens
    localStorage.removeItem(REFRESH_TOKEN)
    localStorage.removeItem(ACCESS_TOKEN)

    // 3. Clear all local storage (if needed)
    localStorage.clear()

    // 4. Clear session storage
    sessionStorage.clear()

    // 5. Reset global state (atoms / stores)
    resetAppState()

    // 6. Clear TanStack Query cache
    queryClient.clear()

  } catch (error) {
    console.error('Logout failed:', error)
  }
}

export const refreshToken = async (): Promise<ApiResponse<RefreshTokenResponse>> => {
  try {
    // Get refresh token from localStorage
    const refresh_token = localStorage.getItem(REFRESH_TOKEN)
    if (!refresh_token) {
      throw new Error('No refresh token available')
    }

    const response = await publicApi.post<RefreshTokenResponse>(REFRESH_ENDPOINT, {
      refresh_token
    })
    // API client wraps backend response: { status, message, data: { access_token, refresh_token } }
    const tokens = (response.data as any)?.data as RefreshTokenResponse

    if (tokens?.access_token) {
      apiClient.setAuthToken(tokens.access_token)
      // Persist token to localStorage for isAuthenticated checks and page reloads
      saveAuthToken(tokens.access_token)
    }

    if (tokens?.refresh_token) {
      // Update refresh token if server returned a new one
      try {
        localStorage.setItem(REFRESH_TOKEN, tokens.refresh_token)
      } catch (e) {
        console.warn('Failed to persist refresh token', e)
      }
    }

    return response
  } catch (error) {
    throw error as ApiError
  }
}

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem(ACCESS_TOKEN)
    return !!token && token.length > 0
  } catch (e) {
    return false
  }
}