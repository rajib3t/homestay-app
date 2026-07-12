// Environment configuration types and utilities
export interface EnvConfig {
  VITE_API_BASE_URL: string
  API_URL: string
  API_KEY: string
  APP_NAME: string
  APP_VERSION: string
  APP_ENV: 'development' | 'production' | 'test'
  DEV_MODE: boolean
  DEBUG: boolean
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error'
  AUTH_DOMAIN?: string
  AUTH_CLIENT_ID?: string
  VIDEO_BASE_URL?: string
  VITE_SUBTITLE_BASE_URL?: string
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  GOOGLE_MAPS_API_KEY?: string
}

class Environment {
  private static instance: Environment
  private config: EnvConfig

  private constructor() {
    this.config = this.loadConfig()
  }

  public static getInstance(): Environment {
    if (!Environment.instance) {
      Environment.instance = new Environment()
    }
    return Environment.instance
  }

  private loadConfig(): EnvConfig {
    return {
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
      API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
      API_KEY: import.meta.env.VITE_API_KEY || '',
      APP_NAME: import.meta.env.VITE_APP_NAME || 'TanStack App',
      APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
      APP_ENV: (import.meta.env.VITE_APP_ENV as EnvConfig['APP_ENV']) || 'development',
      DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true',
      DEBUG: import.meta.env.VITE_DEBUG === 'true',
      LOG_LEVEL: (import.meta.env.VITE_LOG_LEVEL as EnvConfig['LOG_LEVEL']) || 'info',
      AUTH_DOMAIN: import.meta.env.VITE_AUTH_DOMAIN,
      AUTH_CLIENT_ID: import.meta.env.VITE_AUTH_CLIENT_ID,
      VIDEO_BASE_URL: import.meta.env.VITE_VIDEO_BASE_URL || '',
      VITE_SUBTITLE_BASE_URL: import.meta.env.VITE_SUBTITLE_BASE_URL || '',
      GOOGLE_CLIENT_ID: import.meta.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: import.meta.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    }
  }

  public get(key: keyof EnvConfig): EnvConfig[keyof EnvConfig] {
    return this.config[key]
  }

  public getAll(): EnvConfig {
    return { ...this.config }
  }

  public isProduction(): boolean {
    return this.config.APP_ENV === 'production'
  }

  public isDevelopment(): boolean {
    return this.config.APP_ENV === 'development'
  }

  public isDebugEnabled(): boolean {
    return this.config.DEBUG
  }

  public getApiUrl(): string {
    if (isProduction()) {
      return this.config.VITE_API_BASE_URL
    }
    return this.config.API_URL
  }

  public getApiKey(): string {
    return this.config.API_KEY
  }

  public getVideoUrl(): string {
    return this.config.VIDEO_BASE_URL || ''
  }

  public getSubTitleUrl(): string {
    return this.config.VITE_SUBTITLE_BASE_URL || ''
  }

  public getGoogleClientId(): string | undefined {
    return this.config.GOOGLE_CLIENT_ID
  }

  public getGoogleClientSecret(): string | undefined {
    return this.config.GOOGLE_CLIENT_SECRET
  }
}

// Export singleton instance
export const env = Environment.getInstance()

// Export individual getters for convenience
export const isProduction = () => env.isProduction()
export const isDevelopment = () => env.isDevelopment()
export const isDebugEnabled = () => env.isDebugEnabled()
export const getApiUrl = () => env.getApiUrl()
export const getApiKey = () => env.getApiKey()
export const getVideoUrl = () => env.getVideoUrl()
export const getSubTitleUrl = () => env.getSubTitleUrl()

// Logger utility that respects debug settings
export const logger = {
  debug: (...args: unknown[]) => {
    if (env.isDebugEnabled()) {
      console.debug('[DEBUG]', ...args)
    }
  },
  info: (...args: unknown[]) => {
    if (env.get('LOG_LEVEL') === 'debug' || env.get('LOG_LEVEL') === 'info') {
      console.info('[INFO]', ...args)
    }
  },
  warn: (...args: unknown[]) => {
    if (env.get('LOG_LEVEL') !== 'error') {
      console.warn('[WARN]', ...args)
    }
  },
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args)
  },
}
