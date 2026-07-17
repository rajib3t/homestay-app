import { protectedApi, publicApi } from '@/lib/api'
import type { ApiError } from '@/lib/api'
import type { ApiResponse } from '@/types/common'
import type {
  AppSetting,
  AppSettingFormInput,
  AppSettingUpdatePayload,
} from '@/types/setting/app-setting'

export type ComingSoonSetting = {
  video_url: string | null
  background_image_url: string | null
  launch_date: string | null
}

const isNewImageUpload = (value: string | undefined) =>
  Boolean(value?.startsWith('data:'))

export const buildSettingUpdatePayload = (
  value: AppSettingFormInput,
): AppSettingUpdatePayload => {
  const payload: AppSettingUpdatePayload = {
    app_name: value.app_name,
    app_timezone: value.app_timezone,
    app_date_format: value.app_date_format,
    app_time_format: value.app_time_format,
  }

  if (isNewImageUpload(value.app_logo)) {
    payload.app_logo = value.app_logo
  }
  if (isNewImageUpload(value.white_logo)) {
    payload.white_logo = value.white_logo
  }
  if (isNewImageUpload(value.app_favicon)) {
    payload.app_favicon = value.app_favicon
  }

  return payload
}

/** Merge PATCH response with cache + submitted values so the UI always has complete data. */
export const mergeSettingAfterSave = (
  previous: AppSetting | undefined,
  apiData: Partial<AppSetting> | undefined,
  submitted: AppSettingFormInput,
): AppSetting => {
  const resolveImage = (
    apiValue: string | undefined,
    previousValue: string | undefined,
    submittedValue: string,
  ) => {
    if (apiValue) return apiValue
    if (submittedValue.startsWith('data:')) return previousValue ?? ''
    return previousValue ?? ''
  }

  return {
    app_name: apiData?.app_name ?? submitted.app_name,
    app_timezone: apiData?.app_timezone ?? submitted.app_timezone,
    app_date_format: apiData?.app_date_format ?? submitted.app_date_format,
    app_time_format: apiData?.app_time_format ?? submitted.app_time_format,
    app_logo: resolveImage(apiData?.app_logo, previous?.app_logo, submitted.app_logo),
    white_logo: resolveImage(
      apiData?.white_logo,
      previous?.white_logo,
      submitted.white_logo,
    ),
    app_favicon: resolveImage(
      apiData?.app_favicon,
      previous?.app_favicon,
      submitted.app_favicon,
    ),
  }
}

class SettingService {
  constructor(
    private readonly readApi: typeof publicApi,
    private readonly writeApi: typeof protectedApi,
  ) {}

  async getSetting<T = AppSetting>(): Promise<ApiResponse<T>> {
    try {
      const response = await this.readApi.get<ApiResponse<T>>(`/setting`)
      return response.data
    } catch (error) {
      const apiError = error as ApiError
      throw new Error(apiError.message ?? 'Failed to fetch setting')
    }
  }

  async postSetting(
    value: AppSettingFormInput,
  ): Promise<ApiResponse<AppSetting>> {
    const payload = buildSettingUpdatePayload(value)
    try {
      const response = await this.writeApi.patch<ApiResponse<AppSetting>>(
        `/setting`,
        payload,
      )
      return response.data
    } catch (error) {
      const apiError = error as ApiError
      throw new Error(apiError.message ?? 'Failed to update setting')
    }
  }

  async getComingSoonSetting<T = ComingSoonSetting>(): Promise<ApiResponse<T>> {
    try {
      const response = await this.readApi.get<ApiResponse<T>>(`/setting/coming-soon`)
      return response.data
    } catch (error) {
      const apiError = error as ApiError
      throw new Error(apiError.message ?? 'Failed to fetch coming soon setting')
    }
  }

  async postComingSoonSetting(
    value: {
      background_image_url?: File | null
      video_url?: File | null
      launch_date: string
    },
  ): Promise<ApiResponse<ComingSoonSetting>> {
    const payload = new FormData()

    if (value.background_image_url instanceof File) {
      payload.append('background_image_url', value.background_image_url)
    }

    if (value.video_url instanceof File) {
      payload.append('video_url', value.video_url)
    }

    payload.append('launch_date', value.launch_date)

    try {
      const response = await this.writeApi.patch<ApiResponse<ComingSoonSetting>>(
        `/setting/coming-soon`,
        payload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
        },
      )
      return response.data
    } catch (error) {
      const apiError = error as ApiError
      throw new Error(apiError.message ?? 'Failed to update coming soon setting')
    }
  }
}

export const settingService = new SettingService(publicApi, protectedApi)
