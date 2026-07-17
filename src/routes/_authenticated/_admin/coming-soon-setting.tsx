import AdminHeader from '@/components/common/admin-header'
import { Button } from '@/components/ui/button'
import { Field, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createFileRoute } from '@tanstack/react-router'
import { type AnyFieldApi, useForm } from '@tanstack/react-form'
import { UploadCloudIcon, VideoIcon, XIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { settingService } from '@/services/setting'
import { toast } from 'sonner'
import { CircleCheckIcon, OctagonXIcon } from 'lucide-react'
import { useComingSoonSetting } from '@/hooks/app-setting'
type ComingSoonSettingFormValues = {
  video_url: string
  background_image_url: string
  launch_date: string
}

export const Route = createFileRoute('/_authenticated/_admin/coming-soon-setting')({
  component: RouteComponent,
})

function toPreviewUrl(value: string | null | undefined) {
  if (!value) return null
  if (/^(blob:|data:|https?:\/\/)/i.test(value)) return value
  return value.startsWith('/') ? value : `/${value}`
}

function FileUploadField({
  field,
  label,
  accept,
  previewType,
  preview,
  onFileChange,
  onClear,
}: {
  field: AnyFieldApi
  label: string
  accept: string
  previewType: 'video' | 'image'
  preview: string | null
  onFileChange: (file: File | null) => void
  onClear: () => void
}) {
  const isInvalid =
    (field.state.meta.isTouched && !field.state.meta.isValid) || field.state.meta.errors.length > 0

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    if (!file) return
    onFileChange(file)

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      field.handleChange(result)
      event.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  return (
    <Field data-invalid={isInvalid} className="space-y-2">
      <Label htmlFor={field.name} className="text-sm font-medium">
        {label}
      </Label>

      <div className="space-y-3 rounded-2xl border border-border bg-muted/30 p-4">
        {preview ? (
          <div className="overflow-hidden rounded-xl border border-border bg-black">
            {previewType === 'video' ? (
              <video src={preview} controls className="h-56 w-full object-cover" />
            ) : (
              <img src={preview} alt={label} className="h-56 w-full object-cover" />
            )}
          </div>
        ) : (
          <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-border bg-background text-sm text-muted-foreground">
            No file selected
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Label
            htmlFor={`${field.name}-file`}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-muted"
          >
            <UploadCloudIcon className="h-4 w-4" />
            Upload file
            <Input
              id={`${field.name}-file`}
              type="file"
              accept={accept}
              className="hidden"
              onChange={handleFileChange}
            />
          </Label>

          {preview ? (
            <button
              type="button"
              onClick={() => {
                onClear()
                field.handleChange('')
              }}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <XIcon className="h-4 w-4" />
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {isInvalid && (
        <FieldError
          errors={field.state.meta.errors.map((error) =>
            error ? { message: String(error) } : undefined,
          )}
        />
      )}
    </Field>
  )
}

function RouteComponent() {
  const { data: comingSoonSettingData } = useComingSoonSetting()
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const appComingSoonSettingForm = useForm({
    defaultValues: {
      video_url: '',
      background_image_url: '',
      launch_date: '',
    } satisfies ComingSoonSettingFormValues,
    onSubmit: async ({ value }) => {
      try {
        await settingService.postComingSoonSetting({
          video_url: videoFile,
          background_image_url: imageFile,
          launch_date: value.launch_date,
        })

        toast.success('Coming soon settings saved successfully', {
          richColors: true,
          icon: <CircleCheckIcon />,
        })
      } catch (error) {
        toast.error((error as Error)?.message || 'Failed to save coming soon settings', {
          richColors: true,
          icon: <OctagonXIcon />,
        })
      }
    },
  })

  useEffect(() => {
    if (!comingSoonSettingData) return

    setVideoFile(null)
    setImageFile(null)
    setVideoPreview(toPreviewUrl(comingSoonSettingData.video_url))
    setImagePreview(toPreviewUrl(comingSoonSettingData.background_image_url))
    const nextValues = {
      video_url: '',
      background_image_url: '',
      launch_date: comingSoonSettingData.launch_date ?? '',
    }

    appComingSoonSettingForm.reset(nextValues)
    appComingSoonSettingForm.setFieldValue('launch_date', nextValues.launch_date)
  }, [comingSoonSettingData, appComingSoonSettingForm])

  return (
    <React.Fragment>
      <AdminHeader
        title="Manage Coming Soon Setting"
        description="Manage the coming soon settings."
        addButton={false}
        setOpenAddModal={() => {}}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              appComingSoonSettingForm.handleSubmit()
            }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Coming Soon Content</h2>
              <p className="text-sm text-muted-foreground">
                Configure the media and launch date for the public coming soon page.
              </p>
            </div>

            <appComingSoonSettingForm.Field
              name="video_url"
              validators={{
                onChange: ({ value }: { value: string }) =>
                  value && !/^https?:\/\/|^\/|^data:|^blob:/i.test(value)
                    ? 'Enter a valid video URL or upload a file'
                    : undefined,
              }}
              children={(field: AnyFieldApi) => (
                <FileUploadField
                  field={field}
                  label="Background Video"
                  accept="video/*"
                  previewType="video"
                  preview={videoPreview}
                  onFileChange={(file) => {
                    setVideoFile(file)
                    setVideoPreview(file ? URL.createObjectURL(file) : null)
                  }}
                  onClear={() => {
                    setVideoFile(null)
                    setVideoPreview(null)
                  }}
                />
              )}
            />

            <appComingSoonSettingForm.Field
              name="background_image_url"
              validators={{
                onChange: ({ value }: { value: string }) =>
                  value && !/^https?:\/\/|^\/|^data:|^blob:/i.test(value)
                    ? 'Enter a valid image URL or upload a file'
                    : undefined,
              }}
              children={(field: AnyFieldApi) => (
                <FileUploadField
                  field={field}
                  label="Background Image"
                  accept="image/*"
                  previewType="image"
                  preview={imagePreview}
                  onFileChange={(file) => {
                    setImageFile(file)
                    setImagePreview(file ? URL.createObjectURL(file) : null)
                  }}
                  onClear={() => {
                    setImageFile(null)
                    setImagePreview(null)
                  }}
                />
              )}
            />

            <appComingSoonSettingForm.Field
              name="launch_date"
              validators={{
                onChange: ({ value }: { value: string }) =>
                  value ? undefined : 'Launch date is required',
              }}
              children={(field: AnyFieldApi) => {
                const isInvalid =
                  (field.state.meta.isTouched && !field.state.meta.isValid) ||
                  field.state.meta.errors.length > 0

                return (
                  <Field data-invalid={isInvalid} className="space-y-2">
                    <Label htmlFor={field.name} className="text-sm font-medium">
                      Ready To Launch Date
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="date"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {isInvalid && (
                      <FieldError
                        errors={field.state.meta.errors.map((error) =>
                          error ? { message: String(error) } : undefined,
                        )}
                      />
                    )}
                  </Field>
                )
              }}
            />

            <div className="flex justify-end">
              <Button type="submit" className="inline-flex items-center gap-2">
                <VideoIcon className="h-4 w-4" />
                Save Settings
              </Button>
            </div>
          </form>
        </div>
      </div>
    </React.Fragment>
  )
}
