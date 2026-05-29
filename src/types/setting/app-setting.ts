export interface AppSetting {
  app_name: string
  app_logo: string
  white_logo: string
  app_favicon: string
  app_timezone: string
  app_date_format: string
  app_time_format: string
}

export type AppSettingFormInput = {
  app_name: string
  app_logo: string
  white_logo: string
  app_favicon: string
  app_timezone: string
  app_date_format: string
  app_time_format: string
}

export type AppSettingUpdatePayload = Pick<
  AppSetting,
  'app_name' | 'app_timezone' | 'app_date_format' | 'app_time_format'
> &
  Partial<Pick<AppSetting, 'app_logo' | 'white_logo' | 'app_favicon'>>