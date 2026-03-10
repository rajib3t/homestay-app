// API utility that uses environment configuration with axios
import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { env } from './env'
import { jwtDecode } from 'jwt-decode'
import type { ApiResponse } from '@/types/common'

/* -------------------------------------------------------------------------- */
/*                                   CONSTANTS                                */
/* -------------------------------------------------------------------------- */

export const ACCESS_TOKEN = 'access_token'
export const REFRESH_TOKEN = 'refresh_token'
export const REFRESH_ENDPOINT = '/auth/refresh'

export interface ApiError {
  message: string
  status: number
  code?: string
  details?: any
}

export interface RefreshTokenResponse {
  access_token: string
  refresh_token?: string
}

interface ErrorResponse {
  message?: string
  code?: string
  error?: { message?: string }
  details?: any
  errors?: any
}

/* -------------------------------------------------------------------------- */
/*                                  API CLIENT                                */
/* -------------------------------------------------------------------------- */

class ApiClient {
  private publicApi: AxiosInstance
  private protectedApi: AxiosInstance
  private refreshPromise: Promise<string> | null = null
  private authToken: string | null = null
  private decodedUserId: string | null = null

  constructor() {
    const baseURL = env.getApiUrl()

    const config = {
      baseURL,
      timeout: 10000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }

    this.publicApi = axios.create(config)
    this.protectedApi = axios.create(config)

    this.setupInterceptors()
    this.restoreAuthFromStorage()
  }

  /* -------------------------------------------------------------------------- */
  /*                               INTERCEPTORS                                */
  /* -------------------------------------------------------------------------- */

  private setupInterceptors() {
    this.protectedApi.interceptors.request.use(this.handleProtectedRequest)
    this.publicApi.interceptors.request.use(this.handlePublicRequest)

    this.publicApi.interceptors.response.use(
      this.handleResponse,
      this.handleError
    )

    this.protectedApi.interceptors.response.use(
      this.handleResponse,
      this.handleError
    )
  }

  private handleProtectedRequest = (config: any) => {
    if (this.authToken) {
      config.headers.Authorization = `Bearer ${this.authToken}`
    }

    if (this.decodedUserId) {
      config.headers['x-student-id'] = this.decodedUserId
    }

    config.headers['X-Request-URL'] =
      `${config.baseURL || ''}${config.url || ''}`

    return config
  }

  private handlePublicRequest = (config: any) => {
    config.headers['X-Request-URL'] =
      `${config.baseURL || ''}${config.url || ''}`
    return config
  }

  private handleResponse = (response: AxiosResponse) => response

  /* -------------------------------------------------------------------------- */
  /*                                ERROR HANDLER                              */
  /* -------------------------------------------------------------------------- */

  private handleError = async (error: AxiosError): Promise<any> => {
    const status = error.response?.status || 0
    const data = error.response?.data as ErrorResponse

    const apiError: ApiError = {
      message:
        data?.message ||
        data?.error?.message ||
        error.message ||
        'Something went wrong',
      status,
      code: data?.code || error.code,
      details: data?.details ?? data?.details ?? data?.errors,
    }

    // Only handle 401 for protected API requests, not for refresh endpoint
    if (status === 401 && !error.config?.url?.includes(REFRESH_ENDPOINT)) {
      return this.handle401(error, apiError)
    }

    return Promise.reject(apiError)
  }

  /* -------------------------------------------------------------------------- */
  /*                             TOKEN REFRESH FLOW                            */
  /* -------------------------------------------------------------------------- */

  private async handle401(
    error: AxiosError,
    apiError: ApiError
  ): Promise<any> {
    const originalRequest: any = error.config

    // Don't retry if this is already a retry
    if (!originalRequest || originalRequest._retry) {
      this.clearAuth()
      return Promise.reject(apiError)
    }

    // Mark as retry to prevent infinite loops
    originalRequest._retry = true

    // Get refresh token from localStorage
    const refreshToken = localStorage.getItem(REFRESH_TOKEN)
    if (!refreshToken) {
      this.clearAuth()
      return Promise.reject({
        ...apiError,
        message: 'No refresh token available. Please login again.',
        code: 'NO_REFRESH_TOKEN',
      })
    }

    try {
      // Use a shared promise to prevent multiple simultaneous refresh calls
      if (!this.refreshPromise) {
        this.refreshPromise = this.refreshAccessToken(refreshToken)
      }

      const newToken = await this.refreshPromise

      // Update the failed request with new token
      if (!originalRequest.headers) {
        originalRequest.headers = {}
      }
      originalRequest.headers.Authorization = `Bearer ${newToken}`

      // Retry the original request with the new token
      return this.protectedApi(originalRequest)
    } catch (refreshError: any) {
      this.clearAuth()
      return Promise.reject({
        ...apiError,
        message: refreshError?.message || 'Session expired. Please login again.',
        code: 'SESSION_EXPIRED',
      })
    } finally {
      this.refreshPromise = null
    }
  }

  private async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      // Use publicApi to ensure correct baseURL, headers, and withCredentials
      const response = await this.publicApi.post<RefreshTokenResponse>(
        REFRESH_ENDPOINT,
        { refresh_token: refreshToken }
      )

      // The response is wrapped in { success, data } by this.wrap() or directly from axios if using publicApi
      // But wait, this.publicApi.post calls this.wrap() which returns { data: response.data, success: true }
      // The backend returns { status: "success", message: "...", data: { access_token: "...", refresh_token: "..." } }
      // So the structure is: response.data (from wrap) -> backend response -> .data (inner)
      const backendResponse = response.data as any
      const tokens = backendResponse?.data

      const newAccessToken = tokens?.access_token
      const newRefreshToken = tokens?.refresh_token

      if (!newAccessToken) {
        throw new Error('No access token returned from refresh endpoint')
      }

      // Update the auth token in memory and storage
      this.setAuthToken(newAccessToken)
      localStorage.setItem(ACCESS_TOKEN, newAccessToken)

      // Update refresh token if a new one was provided (Token Rotation)
      if (newRefreshToken) {
        localStorage.setItem(REFRESH_TOKEN, newRefreshToken)
      }

      return newAccessToken
    } catch (error: any) {
      // Clear tokens if refresh fails
      this.clearAuth()
      throw new Error(
        error.message || 'Failed to refresh token'
      )
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                             AUTH MANAGEMENT                               */
  /* -------------------------------------------------------------------------- */

  public setAuthToken(token: string) {
    this.authToken = token
    this.protectedApi.defaults.headers.Authorization = `Bearer ${token}`

    try {
      const decoded = jwtDecode<any>(token)
      // Support both 'sub' (standard JWT) and 'userId' (custom)
      this.decodedUserId = String(decoded.sub || decoded.userId || '')
    } catch {
      this.decodedUserId = null
    }
  }

  public restoreAuthFromStorage() {
    const token = localStorage.getItem(ACCESS_TOKEN)
    if (token) {
      this.setAuthToken(token)
    }
  }

  public clearAuth() {
    this.authToken = null
    this.decodedUserId = null
    delete this.protectedApi.defaults.headers.Authorization

    localStorage.removeItem(ACCESS_TOKEN)
    localStorage.removeItem(REFRESH_TOKEN)
  }

  /* -------------------------------------------------------------------------- */
  /*                              PUBLIC METHODS                               */
  /* -------------------------------------------------------------------------- */

  public get<T>(url: string, config?: AxiosRequestConfig) {
    return this.wrap(this.publicApi.get<T>(url, config))
  }

  public post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.wrap(this.publicApi.post<T>(url, data, config))
  }

  public put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.wrap(this.publicApi.put<T>(url, data, config))
  }

  public patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.wrap(this.publicApi.patch<T>(url, data, config))
  }

  public delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.wrap(this.publicApi.delete<T>(url, config))
  }

  /* --------------------------- Protected Methods ---------------------------- */

  public protectedGet<T>(url: string, config?: AxiosRequestConfig) {
    return this.wrap(this.protectedApi.get<T>(url, config))
  }

  public protectedPost<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ) {
    return this.wrap(this.protectedApi.post<T>(url, data, config))
  }

  public protectedPut<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ) {
    return this.wrap(this.protectedApi.put<T>(url, data, config))
  }

  public protectedPatch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ) {
    return this.wrap(this.protectedApi.patch<T>(url, data, config))
  }

  public protectedDelete<T>(url: string, config?: AxiosRequestConfig) {
    return this.wrap(this.protectedApi.delete<T>(url, config))
  }

  /* -------------------------------------------------------------------------- */
  /*                               WRAPPER                                     */
  /* -------------------------------------------------------------------------- */

  private async wrap<T>(
    request: Promise<AxiosResponse<T>>
  ): Promise<ApiResponse<T>> {
    const response = await request
    return {
      data: response.data,
      success: true,
    }
  }

  public clearAuthToken() {
    delete this.protectedApi.defaults.headers.Authorization
    this.authToken = null
    this.decodedUserId = null
    try {
      localStorage.removeItem(ACCESS_TOKEN)
      localStorage.removeItem(REFRESH_TOKEN)
    } catch (e) {

    }
  }

  // Method to get all cookies
  public getCookies(): Record<string, string> {
    const cookies: Record<string, string> = {}
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=')
      if (name && value) {
        cookies[name] = value
      }
    })
    return cookies
  }



  // Method to clear a cookie
  public clearCookie(name: string) {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }

  // Get the axios instances for advanced usage
  public getPublicInstance(): AxiosInstance {
    return this.publicApi
  }

  public getProtectedInstance(): AxiosInstance {
    return this.protectedApi
  }
}

/* -------------------------------------------------------------------------- */
/*                                EXPORTS                                     */
/* -------------------------------------------------------------------------- */

export const apiClient = new ApiClient()

export const publicApi = {
  get: apiClient.get.bind(apiClient),
  post: apiClient.post.bind(apiClient),
  put: apiClient.put.bind(apiClient),
  patch: apiClient.patch.bind(apiClient),
  delete: apiClient.delete.bind(apiClient),
}

export const protectedApi = {
  get: apiClient.protectedGet.bind(apiClient),
  post: apiClient.protectedPost.bind(apiClient),
  put: apiClient.protectedPut.bind(apiClient),
  patch: apiClient.protectedPatch.bind(apiClient),
  delete: apiClient.protectedDelete.bind(apiClient),
}