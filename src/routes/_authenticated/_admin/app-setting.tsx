import React, { useEffect, useState } from 'react'
import AdminHeader from '@/components/common/admin-header'
import { createFileRoute } from '@tanstack/react-router'
import { useForm, type AnyFieldApi } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CircleCheckIcon, OctagonXIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { FormFieldWrapper } from '@/components/form-field-wrapper'
import UploadImage from '@/components/upload-image'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { mergeSettingAfterSave, settingService } from '@/services/setting'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { env } from '@/lib/env'
import { GET_SETTING_KEY, useSetting } from '@/hooks/app-setting'
import { appLogo, favIcon, whiteLogo } from '@/store/setting'
import { useAtom } from 'jotai'
import { parseValidationErrors } from '@/lib/utils'
import type { AppSetting, AppSettingFormInput } from '@/types/setting/app-setting'

const getDetailsInitialValues = (): AppSettingFormInput => ({
  app_name: env.get('APP_NAME') as string,
  app_logo: '',
  white_logo: '',
  app_favicon: '',
  app_timezone: 'Asia/Kolkata',
  app_date_format: 'DD/MM/YYYY',
  app_time_format: '12h',
})

/** Text fields from API; image fields stay empty until the user uploads a new file. */
const mapSettingToFormValues = (data: AppSetting): AppSettingFormInput => ({
  app_name: data.app_name ?? '',
  app_logo: '',
  white_logo: '',
  app_favicon: '',
  app_timezone: data.app_timezone ?? 'Asia/Kolkata',
  app_date_format: data.app_date_format ?? 'DD/MM/YYYY',
  app_time_format: data.app_time_format ?? '12h',
})

const syncImagePreviewsFromSetting = (
  data: AppSetting,
  setters: {
    setMainLogo: (url: string) => void
    setWhiteLogo: (url: string) => void
    setFavIcon: (url: string) => void
  },
) => {
  setters.setMainLogo(data.app_logo ?? '')
  setters.setWhiteLogo(data.white_logo ?? '')
  setters.setFavIcon(data.app_favicon ?? '')
}

type SettingFormApi = {
  reset: (values: AppSettingFormInput) => void
}

const applySettingToForm = (
  setting: AppSetting,
  form: SettingFormApi,
  setters: {
    setMainLogo: (url: string) => void
    setWhiteLogo: (url: string) => void
    setFavIcon: (url: string) => void
  },
) => {
  form.reset(mapSettingToFormValues(setting))
  syncImagePreviewsFromSetting(setting, setters)
}

export const Route = createFileRoute('/_authenticated/_admin/app-setting')({
  head: () => ({
    title: 'Manage App Setting',
    meta: [
      {
        name: 'description',
        content:
          'Admin interface to manage app setting. Add, edit, or remove app setting from the system.',
      },
      {
        property: 'og:title',
        content: 'Manage App Setting',
      },
    ],
  }),

  component: RouteComponent,
})

function RouteComponent() {
  const queryClient = useQueryClient()
  const [mainLogo, setMainLogo] = useAtom(appLogo)
  const [whiteLogoPreview, setWhiteLogoPreview] = useAtom(whiteLogo)
  const [favIconPreview, setFavIconPreview] = useAtom(favIcon)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})

  const { data, isLoading, isError, error } = useSetting()

  const imagePreviewSetters = {
    setMainLogo,
    setWhiteLogo: setWhiteLogoPreview,
    setFavIcon: setFavIconPreview,
  }

  const { mutateAsync: postSetting, isPending: isSaving } = useMutation({
    mutationFn: (values: AppSettingFormInput) =>
      settingService.postSetting(values),
    onSuccess: () => {
      setValidationErrors({})
      toast.success('App settings saved successfully', {
        richColors: true,
        icon: <CircleCheckIcon />,
      })
    },
    onError: (err: Error) => {
      const map = parseValidationErrors(err)
      if (Object.keys(map).length) setValidationErrors(map)
      toast.error(err?.message || 'Failed to save app settings', {
        richColors: true,
        icon: <OctagonXIcon />,
      })
    },
  })

  const settingForm = useForm({
    defaultValues: getDetailsInitialValues(),
    onSubmit: async ({ value }) => {
      setValidationErrors({})
      try {
        const response = await postSetting(value)
        const previous = queryClient.getQueryData<AppSetting>(GET_SETTING_KEY)
        let merged = mergeSettingAfterSave(previous, response?.data, value)
        queryClient.setQueryData(GET_SETTING_KEY, merged)

        try {
          const freshResponse = await settingService.getSetting()
          merged = freshResponse.data
          queryClient.setQueryData(GET_SETTING_KEY, merged)
        } catch {
          // Keep optimistic merge if refetch fails
        }

        applySettingToForm(merged, settingForm, imagePreviewSetters)
      } catch {
        // Errors handled in mutation onError
      }
    },
  })

  const syncFormFromCache = (setting: AppSetting) => {
    applySettingToForm(setting, settingForm, imagePreviewSetters)
  }

  useEffect(() => {
    if (data) {
      syncFormFromCache(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const handleReset = () => {
    if (data) {
      syncFormFromCache(data)
    } else {
      settingForm.reset()
    }
    setValidationErrors({})
  }

  const getApiErrors = (field: AnyFieldApi) => validationErrors[field.name] ?? []

  if (isLoading) {
    return (
      <React.Fragment>
        <AdminHeader
          title="Manage App Setting"
          description="Manage the app settings."
          addButton={false}
          setOpenAddModal={() => {}}
        />
        <div className="p-6 text-sm text-muted-foreground">Loading app settings...</div>
      </React.Fragment>
    )
  }

  if (isError) {
    return (
      <React.Fragment>
        <AdminHeader
          title="Manage App Setting"
          description="Manage the app settings."
          addButton={false}
          setOpenAddModal={() => {}}
        />
        <div className="p-6 text-sm text-destructive">
          {(error as Error)?.message || 'Unable to load app settings.'}
        </div>
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      <AdminHeader
        title="Manage App Setting"
        description="Manage the app settings."
        addButton={false}
        setOpenAddModal={() => {}}
      />

      <div className="p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            settingForm.handleSubmit()
          }}
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* LEFT */}
            <Card className="p-4">
              <CardContent className="space-y-6 p-0">
                <div>
                  <h2 className="text-lg font-semibold">Branding</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Upload your app logo and favicon.
                  </p>
                </div>

                {/* Main Logo */}
                <settingForm.Field
                  name="app_logo"
                  children={(field: AnyFieldApi) => (
                    <FormFieldWrapper
                      field={field}
                      apiErrors={getApiErrors(field)}
                      label="Main Logo"
                    >
                      <UploadImage
                        id={field.name}
                        name={field.name}
                        preview={mainLogo}
                        onPreviewChange={(preview) => setMainLogo(preview ?? '')}
                        onValueChange={(value: string) => {
                          field.handleChange(value)
                        }}
                        onBlur={field.handleBlur}
                        alt="App logo"
                        emptyText="App logo"
                        buttonText="Upload Logo"
                        previewWrapperClassName="h-full w-full"
                        previewImageClassName="h-full w-full"
                      />
                    </FormFieldWrapper>
                  )}
                />

                {/* White Logo */}
                <settingForm.Field
                  name="white_logo"
                  children={(field: AnyFieldApi) => (
                    <FormFieldWrapper
                      field={field}
                      apiErrors={getApiErrors(field)}
                      label="White Logo"
                    >
                      <UploadImage
                        id={field.name}
                        name={field.name}
                        preview={whiteLogoPreview}
                        onPreviewChange={(preview) => setWhiteLogoPreview(preview ?? '')}
                        onValueChange={(value: string) => {
                          field.handleChange(value)
                        }}
                        onBlur={field.handleBlur}
                        alt="White logo"
                        emptyText="White logo"
                        buttonText="Upload White Logo"
                        previewWrapperClassName="h-full w-full"
                        previewImageClassName="h-full w-full"
                      />
                    </FormFieldWrapper>
                  )}
                />

                {/* Favicon */}
                <settingForm.Field
                  name="app_favicon"
                  children={(field: AnyFieldApi) => (
                    <FormFieldWrapper
                      field={field}
                      apiErrors={getApiErrors(field)}
                      label="Fav Icon"
                    >
                      <UploadImage
                        id={field.name}
                        name={field.name}
                        preview={favIconPreview}
                        onPreviewChange={(preview) => setFavIconPreview(preview ?? '')}
                        onValueChange={(value: string) => {
                          field.handleChange(value)
                        }}
                        onBlur={field.handleBlur}
                        alt="Fav Icon"
                        emptyText="Fav Icon"
                        buttonText="Upload Fav Icon"
                        previewWrapperClassName="h-full w-full"
                        previewImageClassName="h-full w-full"
                      />
                    </FormFieldWrapper>
                  )}
                />
              </CardContent>
            </Card>

            {/* RIGHT */}
            <Card className="p-4 lg:col-span-2">
              <CardContent className="space-y-6 p-0">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">App Settings</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Update your application configuration and preferences.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      disabled={isSaving}
                    >
                      Reset
                    </Button>

                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Setting'}
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-medium">General</h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* App Name */}
                    <settingForm.Field
                      name="app_name"
                      validators={{
                        onChange: ({ value }: { value: string }) =>
                          !value
                            ? 'App name is required'
                            : value.length < 2
                              ? 'App name must be at least 2 characters'
                              : undefined,
                      }}
                      children={(field: AnyFieldApi) => (
                        <Field>
                          <Label className="text-sm font-medium">
                            App Name
                          </Label>

                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value ?? ''}
                            placeholder="Enter app name"
                            onBlur={field.handleBlur}
                            onChange={(e) =>
                              field.handleChange(e.target.value)
                            }
                          />
                        </Field>
                      )}
                    />

                    {/* Timezone */}
                    <settingForm.Field
                      name="app_timezone"
                      validators={{
                        onChange: ({ value }: { value: string }) =>
                          !value ? 'Timezone is required' : undefined,
                      }}
                      children={(field: AnyFieldApi) => (
                        <Field>
                          <Label className="text-sm font-medium">
                            Timezone
                          </Label>

                          <Select
                            value={field.state.value}
                            onValueChange={(value) =>
                              field.handleChange(value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectItem value="UTC">UTC</SelectItem>
                              <SelectItem value="Asia/Kolkata">
                                India (IST)
                              </SelectItem>
                              <SelectItem value="America/New_York">
                                Eastern Time
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      )}
                    />

                    {/* Date Format */}
                    <settingForm.Field
                      name="app_date_format"
                      validators={{
                        onChange: ({ value }: { value: string }) =>
                          !value ? 'Date format is required' : undefined,
                      }}
                      children={(field: AnyFieldApi) => (
                        <Field>
                          <Label className="text-sm font-medium">
                            Date Format
                          </Label>

                          <Select
                            value={field.state.value}
                            onValueChange={(value) =>
                              field.handleChange(value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select date format" />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectItem value="MM/DD/YYYY">
                                MM/DD/YYYY
                              </SelectItem>
                              <SelectItem value="DD/MM/YYYY">
                                DD/MM/YYYY
                              </SelectItem>
                              <SelectItem value="YYYY-MM-DD">
                                YYYY-MM-DD
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      )}
                    />

                    {/* Time Format */}
                    <settingForm.Field
                      name="app_time_format"
                      validators={{
                        onChange: ({ value }: { value: string }) =>
                          !value ? 'Time format is required' : undefined,
                      }}
                      children={(field: AnyFieldApi) => (
                        <Field>
                          <Label className="text-sm font-medium">
                            Time Format
                          </Label>

                          <Select
                            value={field.state.value}
                            onValueChange={(value) =>
                              field.handleChange(value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select time format" />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectItem value="12h">
                                12-hour (AM/PM)
                              </SelectItem>
                              <SelectItem value="24h">
                                24-hour
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </React.Fragment>
  )
}