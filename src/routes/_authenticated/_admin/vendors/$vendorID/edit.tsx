import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, type AnyFieldApi } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowLeftIcon, CircleCheckIcon, OctagonXIcon, X } from 'lucide-react'
import { toast } from 'sonner'

import UploadImage from '@/components/upload-image'
import { FormFieldWrapper } from '@/components/form-field-wrapper'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { parseValidationErrors } from '@/lib/utils'
import { profileImageUpload, updateUser, updateUserPassword } from '@/services/user'
import type {  UserData } from '@/types/user'
import { getVendorQuery } from '@/vendors/queries'

type VendorEditFormValues = {
  image: string
  username: string
  firstName: string
  lastName: string
  contactEmail: string
  phoneNumber: string
  role: string
  password: string
  confirmPassword: string
  companyName: string
  companyEmail: string
  companyPhone: string
  companyStreet: string
  companyCity: string
  companyState: string
  companyZipCode: string
  companyCountry: string
  companyAddressType: 'work' | 'home' | 'other'
  companyIsPrimary: boolean
}

type VendorImageFormValues = {
  image?: string
}

type VendorPasswordFormValues = Pick<
  VendorEditFormValues,
  'password' | 'confirmPassword'
>

type VendorDetailsFormValues = Pick<
  VendorEditFormValues,
  'username' | 'firstName' | 'lastName' | 'contactEmail' | 'phoneNumber' | 'role' | 'companyName' | 'companyEmail' | 'companyPhone' | 'companyStreet' | 'companyCity' | 'companyState' | 'companyZipCode' | 'companyCountry' | 'companyAddressType' | 'companyIsPrimary'
>

type UpdateVendorPayload = {
  username?: string
  first_name?: string
  last_name?: string
  email?: string
  mobile?: string
  user_type?: string
  image?: string
  password?: string
  company?: {
    name?: string
    email?: string
    phone?: string
    address?: {
      street?: string
      city?: string
      state?: string
      zip_code?: string
      country?: string
      address_type?: 'work' | 'home' | 'other'
      is_primary?: boolean
    }
  }
}

const getImageInitialValues = (): VendorImageFormValues => ({
  image: undefined,
})

const getPasswordInitialValues = (): VendorPasswordFormValues => ({
  password: '',
  confirmPassword: '',
})

const getDetailsInitialValues = (userData: UserData): VendorDetailsFormValues => ({
  username: userData.username ?? '',
  firstName: userData.first_name ?? '',
  lastName: userData.last_name ?? '',
  contactEmail: userData.email ?? '',
  phoneNumber: userData.mobile ?? '',
  role: userData.user_type ?? 'vendor',
  companyName: userData.company?.name ?? '',
  companyEmail: userData.company?.email ?? '',
  companyPhone: userData.company?.phone ?? '',
  companyStreet: userData.company?.address?.street ?? '',
  companyCity: userData.company?.address?.city ?? '',
  companyState: userData.company?.address?.state ?? '',
  companyZipCode: userData.company?.address?.zip_code ?? '',
  companyCountry: userData.company?.address?.country ?? '',
  companyAddressType: userData.company?.address?.address_type ?? 'work',
  companyIsPrimary: userData.company?.address?.is_primary ?? true,
})

const getApiErrors = (
  field: AnyFieldApi,
  validationErrors: Record<string, string[]>,
) => validationErrors[field.name] ?? []

const getIsInvalid = (field: AnyFieldApi, apiErrors: string[]) =>
  (field.state.meta.isTouched && !field.state.meta.isValid) || apiErrors.length > 0

const mapFieldErrors = (field: AnyFieldApi, apiErrors: string[]) => [
  ...field.state.meta.errors.map((error) =>
    error ? { message: String(error) } : undefined,
  ),
  ...apiErrors.map((error) => ({ message: error })),
]

export const Route = createFileRoute('/_authenticated/_admin/vendors/$vendorID/edit')({
  loader: async ({ params, context }) => {
    const queryClient = context.queryClient

    return queryClient.ensureQueryData(getVendorQuery(params.vendorID)())
  },
  component: RouteComponent,
})

function RouteComponent() {
  const vendorData = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  const userData = vendorData.data

  const [imageValidationErrors, setImageValidationErrors] = React.useState<
    Record<string, string[]>
  >({})
  const [passwordValidationErrors, setPasswordValidationErrors] = React.useState<
    Record<string, string[]>
  >({})
  const [detailsValidationErrors, setDetailsValidationErrors] = React.useState<
    Record<string, string[]>
  >({})
  const [imagePreview, setImagePreview] = React.useState<string | null>(userData.image ?? null)
  const [imageSelected, setImageSelected] = React.useState(false)

  const imageForm = useForm({
    defaultValues: getImageInitialValues(),
    validators: {
    onSubmit: ({ value }) => {
      if (!value.image) {
        return {
          image: 'Profile image is required',
        }
      }
      return undefined
    },
  },
    onSubmit: async ({ value }) => {
      if(!value.image) return;
      
      try {
        setImageValidationErrors({})

        await updateImageAsync({
          image: value.image || undefined,
        })
      } catch (error) {
        const map = parseValidationErrors(error)
        if (Object.keys(map).length) setImageValidationErrors(map)
        throw error
      }
    },
  })

  const passwordForm = useForm({
    defaultValues: getPasswordInitialValues(),
    onSubmit: async ({ value }) => {
      try {
        setPasswordValidationErrors({})

        await updatePasswordAsync({
          password: value.password,
        })
      } catch (error) {
        const map = parseValidationErrors(error)
        if (Object.keys(map).length) setPasswordValidationErrors(map)
        throw error
      }
    },
  })

  const detailsForm = useForm({
    defaultValues: getDetailsInitialValues(userData),
    onSubmit: async ({ value }) => {
      try {
        setDetailsValidationErrors({})

        await updateDetailsAsync({
          username: value.username,
          first_name: value.firstName,
          last_name: value.lastName,
          email: value.contactEmail,
          mobile: value.phoneNumber || undefined,
          user_type: value.role,
          company: {
            name: value.companyName || undefined,
            email: value.companyEmail || undefined,
            phone: value.companyPhone || undefined,
            address: {
              street: value.companyStreet || undefined,
              city: value.companyCity || undefined,
              state: value.companyState || undefined,
              zip_code: value.companyZipCode || undefined,
              country: value.companyCountry || undefined,
              address_type: value.companyAddressType,
              is_primary: value.companyIsPrimary,
            },
          },
        })
      } catch (error) {
        const map = parseValidationErrors(error)
        if (Object.keys(map).length) setDetailsValidationErrors(map)
        throw error
      }
    },
  })

  const syncForms = React.useCallback(
    (nextUserData: UserData) => {
      setImageValidationErrors({})
      setPasswordValidationErrors({})
      setDetailsValidationErrors({})
      setImagePreview(nextUserData.image ?? null)
      imageForm.reset({ image: undefined })
      setImageSelected(false)
      passwordForm.reset(getPasswordInitialValues())
      detailsForm.reset(getDetailsInitialValues(nextUserData))
    },
    [detailsForm, imageForm, passwordForm],
  )

  const handleSuccess = React.useCallback(
    (response: { data: UserData }, message: string) => {
      syncForms(response.data)
      queryClient.setQueryData(['GET_VENDOR', response.data.id], response)
      queryClient.setQueryData(['GET_VENDOR', userData.id], response)
      queryClient.invalidateQueries({ queryKey: ['GET_VENDORS'] })

      toast.success(message, {
        richColors: true,
        icon: <CircleCheckIcon />,
      })
    },
    [queryClient, syncForms, userData.id],
  )

  const handleError = React.useCallback(
    (
      error: any,
      setErrors: React.Dispatch<React.SetStateAction<Record<string, string[]>>>,
      fallbackMessage: string,
    ) => {
      const map = parseValidationErrors(error)
      if (Object.keys(map).length) setErrors(map)

      toast.error(error?.message || fallbackMessage, {
        richColors: true,
        icon: <OctagonXIcon />,
        style: {
          '--normal-bg': '#fff0f0',
        } as React.CSSProperties,
      })
    },
    [],
  )

  const { mutateAsync: updateImageAsync, isPending: isImagePending } = useMutation({
    mutationFn: (data: { image: string | undefined }) => profileImageUpload(userData.id, { image: data.image ?? '' }),
    onSuccess: (response) => handleSuccess(response.data, 'Profile photo updated successfully'),
    onError: (error: any) =>
      handleError(error, setImageValidationErrors, 'Failed to update profile photo'),
  })

  const { mutateAsync: updatePasswordAsync, isPending: isPasswordPending } = useMutation({
    mutationFn: (data: UpdateVendorPayload) => updateUserPassword(userData.id, data.password ?? ''),
    onSuccess: (response) => handleSuccess(response, 'Password updated successfully'),
    onError: (error: any) =>
      handleError(error, setPasswordValidationErrors, 'Failed to update password'),
  })

  const { mutateAsync: updateDetailsAsync, isPending: isDetailsPending } = useMutation({
    mutationFn: (data: UpdateVendorPayload) => updateUser(userData.id, data),
    onSuccess: (response) => handleSuccess(response, 'Vendor details updated successfully'),
    onError: (error: any) =>
      handleError(error, setDetailsValidationErrors, 'Failed to update vendor details'),
  })

  React.useEffect(() => {
    syncForms(userData)
  }, [syncForms, userData])

  const handleImageReset = () => {
    setImageValidationErrors({})
    setImagePreview(userData.image ?? null)
    imageForm.reset({ image: undefined })
    setImageSelected(false)
  }

  const handlePasswordReset = () => {
    setPasswordValidationErrors({})
    passwordForm.reset(getPasswordInitialValues())
  }

  const handleDetailsReset = () => {
    setDetailsValidationErrors({})
    detailsForm.reset(getDetailsInitialValues(userData))
  }

  return (
    <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
      <Card className="p-4">
        <CardContent className="space-y-5 p-0">
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              imageForm.handleSubmit()
            }}
          >
            <div>
              <h2 className="text-lg font-semibold">Profile Photo</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload or replace the vendor image separately from the other account changes.
              </p>
            </div>

            <imageForm.Field
              name="image"
              children={(field: AnyFieldApi) => {
                const apiErrors = getApiErrors(field, imageValidationErrors)

                return (
                  <FormFieldWrapper field={field} apiErrors={apiErrors} label={
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Profile Photo</span>
                      {imagePreview ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer"
                          onClick={() => {
                            setImagePreview(null)
                            field.handleChange('')
                            setImageSelected(false)
                          }}
                          disabled={isImagePending}
                        >
                          <X size={16} />
                        </Button>
                      ) : null}
                    </div>
                  }>
                    <UploadImage
                      id={field.name}
                      name={field.name}
                      preview={imagePreview}
                      onPreviewChange={setImagePreview}
                      onValueChange={(value) => {
                        field.handleChange(value)
                        setImageSelected(true)
                      }}
                      onBlur={field.handleBlur}
                      alt={`${userData.first_name} ${userData.last_name} profile photo`}
                      emptyText="Profile photo"
                      buttonText="Upload Photo"
                      disabled={isImagePending}
                      previewWrapperClassName="h-full w-full"
                      previewImageClassName="h-full w-full"
                    />
                  </FormFieldWrapper>
                )
              }}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={handleImageReset}
                disabled={isImagePending}
              >
                Reset
              </Button>
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={isImagePending || !imageSelected}
              >
                {isImagePending ? 'Saving...' : 'Update Photo'}
              </Button>
            </div>
          </form>

          <div className="border-t pt-5">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                passwordForm.handleSubmit()
              }}
            >
              <div>
                <h2 className="text-lg font-semibold">Password</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Change the vendor password without touching the profile details.
                </p>
              </div>

              <passwordForm.Field
                name="password"
                validators={{
                  onChange: ({ value, fieldApi }: { value: string; fieldApi: AnyFieldApi }) => {
                    const confirmPassword = fieldApi.form.state.values.confirmPassword as string

                    if (!value) {
                      return 'Password is required'
                    }

                    if (value.length < 6) {
                      return 'Password must be at least 6 characters'
                    }

                    if (confirmPassword && value !== confirmPassword) {
                      return 'Passwords do not match'
                    }

                    return undefined
                  },
                }}
                children={(field: AnyFieldApi) => {
                  const apiErrors = getApiErrors(field, passwordValidationErrors)
                  // const isInvalid = getIsInvalid(field, apiErrors)

                  return (
                    <FormFieldWrapper field={field} apiErrors={apiErrors} label="New Password">
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        placeholder="Enter a new password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      </FormFieldWrapper>
                    
                  )
                }}
              />

              <passwordForm.Field
                name="confirmPassword"
                validators={{
                  onChangeListenTo: ['password'],
                  onChange: ({ value, fieldApi }: { value: string; fieldApi: AnyFieldApi }) => {
                    const password = fieldApi.form.state.values.password as string

                    if (!password && !value) {
                      return undefined
                    }

                    if (!value) {
                      return 'Confirm password is required'
                    }

                    if (value !== password) {
                      return 'Passwords do not match'
                    }

                    return undefined
                  },
                }}
                children={(field: AnyFieldApi) => {
                  const apiErrors = getApiErrors(field, passwordValidationErrors)

                  return (
                    <FormFieldWrapper field={field} apiErrors={apiErrors} label="Confirm Password">
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        placeholder="Repeat the new password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </FormFieldWrapper>
                  )
                }}
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={handlePasswordReset}
                  disabled={isPasswordPending}
                >
                  Reset
                </Button>
                <Button type="submit" className="cursor-pointer" disabled={isPasswordPending || !passwordForm.state.isValid }>
                  {isPasswordPending ? 'Saving...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>

      <Card className="p-4 lg:col-span-2">
        <CardContent className="p-0">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              detailsForm.handleSubmit()
            }}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Vendor Details</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Edit the vendor profile and contact information independently of image and password updates.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() =>
                    navigate({
                      to: '/vendors',
                      search: {
                        page: 1,
                        limit: 5,
                        sort: undefined,
                        sort_order: undefined,
                        filter: undefined,
                      },
                    })
                  }
                >
                  <ArrowLeftIcon size={16} />
                  Back to Vendors
                </Button>
                <Button type="submit" className="cursor-pointer" disabled={isDetailsPending}>
                  {isDetailsPending ? 'Saving...' : 'Save Details'}
                </Button>
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-medium">Profile Information</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <detailsForm.Field
                  name="username"
                  validators={{
                    onChange: ({ value }: { value: string }) =>
                      !value
                        ? 'Username is required'
                        : value.length < 3
                          ? 'Username must be at least 3 characters'
                          : undefined,
                  }}
                  children={(field: AnyFieldApi) => {
                    const apiErrors = getApiErrors(field, detailsValidationErrors)
                    

                    return (
                      <FormFieldWrapper field={field} apiErrors={apiErrors} label="Username">
                         <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          disabled
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </FormFieldWrapper>
                    
                    )
                  }}
                />

                <detailsForm.Field
                  name="role"
                  validators={{
                    onChange: ({ value }: { value: string }) =>
                      !value ? 'Role is required' : undefined,
                  }}
                  children={(field: AnyFieldApi) => {
                    const apiErrors = getApiErrors(field, detailsValidationErrors)
                    const isInvalid = getIsInvalid(field, apiErrors)

                    return (
                      <Field data-invalid={isInvalid}>
                        <Label className="text-sm font-medium">Role</Label>
                        <Select
                          value={field.state.value}
                          onValueChange={(value) => field.handleChange(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vendor">Vendor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="subscriber">Subscriber</SelectItem>
                          </SelectContent>
                        </Select>
                        {isInvalid ? <FieldError errors={mapFieldErrors(field, apiErrors)} /> : null}
                      </Field>
                    )
                  }}
                />

                <detailsForm.Field
                  name="firstName"
                  validators={{
                    onChange: ({ value }: { value: string }) =>
                      !value
                        ? 'First name is required'
                        : value.length < 2
                          ? 'First name must be at least 2 characters'
                          : undefined,
                  }}
                  children={(field: AnyFieldApi) => {
                    const apiErrors = getApiErrors(field, detailsValidationErrors)
                    const isInvalid = getIsInvalid(field, apiErrors)

                    return (
                      <Field data-invalid={isInvalid}>
                        <Label className="text-sm font-medium">First Name</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        {isInvalid ? <FieldError errors={mapFieldErrors(field, apiErrors)} /> : null}
                      </Field>
                    )
                  }}
                />

                <detailsForm.Field
                  name="lastName"
                  validators={{
                    onChange: ({ value }: { value: string }) =>
                      !value
                        ? 'Last name is required'
                        : value.length < 2
                          ? 'Last name must be at least 2 characters'
                          : undefined,
                  }}
                  children={(field: AnyFieldApi) => {
                    const apiErrors = getApiErrors(field, detailsValidationErrors)
                    const isInvalid = getIsInvalid(field, apiErrors)

                    return (
                      <Field data-invalid={isInvalid}>
                        <Label className="text-sm font-medium">Last Name</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        {isInvalid ? <FieldError errors={mapFieldErrors(field, apiErrors)} /> : null}
                      </Field>
                    )
                  }}
                />
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-medium">Contact Info</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <detailsForm.Field
                  name="contactEmail"
                  validators={{
                    onChange: ({ value }: { value: string }) =>
                      !value
                        ? 'Email is required'
                        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                          ? 'Invalid email format'
                          : undefined,
                  }}
                  children={(field: AnyFieldApi) => {
                    const apiErrors = getApiErrors(field, detailsValidationErrors)
                    const isInvalid = getIsInvalid(field, apiErrors)

                    return (
                      <Field data-invalid={isInvalid}>
                        <Label className="text-sm font-medium">Email</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="email"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        {isInvalid ? <FieldError errors={mapFieldErrors(field, apiErrors)} /> : null}
                      </Field>
                    )
                  }}
                />

                <detailsForm.Field
                  name="phoneNumber"
                  validators={{
                    onChange: ({ value }: { value: string }) =>
                      value && value.length < 6
                        ? 'Phone number must be at least 6 characters'
                        : undefined,
                  }}
                  children={(field: AnyFieldApi) => {
                    const apiErrors = getApiErrors(field, detailsValidationErrors)
                    const isInvalid = getIsInvalid(field, apiErrors)

                    return (
                      <Field data-invalid={isInvalid}>
                        <Label className="text-sm font-medium">Phone Number</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        {isInvalid ? <FieldError errors={mapFieldErrors(field, apiErrors)} /> : null}
                      </Field>
                    )
                  }}
                />
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-medium">Company Information</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <detailsForm.Field
                  name="companyName"
                  validators={{
                    onChange: ({ value }: { value: string }) =>
                      value && value.length < 2
                        ? 'Company name must be at least 2 characters'
                        : undefined,
                  }}
                  children={(field: AnyFieldApi) => {
                    const apiErrors = getApiErrors(field, detailsValidationErrors)
                    const isInvalid = getIsInvalid(field, apiErrors)

                    return (
                      <Field data-invalid={isInvalid}>
                        <Label className="text-sm font-medium">Company Name</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Enter company name"
                        />
                        {isInvalid ? <FieldError errors={mapFieldErrors(field, apiErrors)} /> : null}
                      </Field>
                    )
                  }}
                />

                <detailsForm.Field
                  name="companyEmail"
                  validators={{
                    onChange: ({ value }: { value: string }) =>
                      value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                        ? 'Invalid email format'
                        : undefined,
                  }}
                  children={(field: AnyFieldApi) => {
                    const apiErrors = getApiErrors(field, detailsValidationErrors)
                    const isInvalid = getIsInvalid(field, apiErrors)

                    return (
                      <Field data-invalid={isInvalid}>
                        <Label className="text-sm font-medium">Company Email</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="email"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Enter company email"
                        />
                        {isInvalid ? <FieldError errors={mapFieldErrors(field, apiErrors)} /> : null}
                      </Field>
                    )
                  }}
                />

                <detailsForm.Field
                  name="companyPhone"
                  validators={{
                    onChange: ({ value }: { value: string }) =>
                      value && value.length < 6
                        ? 'Phone number must be at least 6 characters'
                        : undefined,
                  }}
                  children={(field: AnyFieldApi) => {
                    const apiErrors = getApiErrors(field, detailsValidationErrors)
                    const isInvalid = getIsInvalid(field, apiErrors)

                    return (
                      <Field data-invalid={isInvalid}>
                        <Label className="text-sm font-medium">Company Phone</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Enter company phone"
                        />
                        {isInvalid ? <FieldError errors={mapFieldErrors(field, apiErrors)} /> : null}
                      </Field>
                    )
                  }}
                />
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-medium">Company Address</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <detailsForm.Field
                  name="companyStreet"
                  validators={{
                    onChange: ({ value }: { value: string }) =>
                      value && value.length < 2
                        ? 'Street address must be at least 2 characters'
                        : undefined,
                  }}
                  children={(field: AnyFieldApi) => {
                    const apiErrors = getApiErrors(field, detailsValidationErrors)
                    const isInvalid = getIsInvalid(field, apiErrors)

                    return (
                      <Field data-invalid={isInvalid}>
                        <Label className="text-sm font-medium">Street Address</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Enter street address"
                        />
                        {isInvalid ? <FieldError errors={mapFieldErrors(field, apiErrors)} /> : null}
                      </Field>
                    )
                  }}
                />

                <detailsForm.Field
                  name="companyCity"
                  validators={{
                    onChange: ({ value }: { value: string }) =>
                      value && value.length < 2
                        ? 'City must be at least 2 characters'
                        : undefined,
                  }}
                  children={(field: AnyFieldApi) => {
                    const apiErrors = getApiErrors(field, detailsValidationErrors)
                    const isInvalid = getIsInvalid(field, apiErrors)

                    return (
                      <Field data-invalid={isInvalid}>
                        <Label className="text-sm font-medium">City</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Enter city"
                        />
                        {isInvalid ? <FieldError errors={mapFieldErrors(field, apiErrors)} /> : null}
                      </Field>
                    )
                  }}
                />

                <detailsForm.Field
                  name="companyState"
                  validators={{
                    onChange: ({ value }: { value: string }) =>
                      value && value.length < 2
                        ? 'State must be at least 2 characters'
                        : undefined,
                  }}
                  children={(field: AnyFieldApi) => {
                    const apiErrors = getApiErrors(field, detailsValidationErrors)
                    const isInvalid = getIsInvalid(field, apiErrors)

                    return (
                      <Field data-invalid={isInvalid}>
                        <Label className="text-sm font-medium">State</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Enter state"
                        />
                        {isInvalid ? <FieldError errors={mapFieldErrors(field, apiErrors)} /> : null}
                      </Field>
                    )
                  }}
                />

                <detailsForm.Field
                  name="companyZipCode"
                  validators={{
                    onChange: ({ value }: { value: string }) =>
                      value && value.length < 3
                        ? 'Zip code must be at least 3 characters'
                        : undefined,
                  }}
                  children={(field: AnyFieldApi) => {
                    const apiErrors = getApiErrors(field, detailsValidationErrors)
                    const isInvalid = getIsInvalid(field, apiErrors)

                    return (
                      <Field data-invalid={isInvalid}>
                        <Label className="text-sm font-medium">Zip Code</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Enter zip code"
                        />
                        {isInvalid ? <FieldError errors={mapFieldErrors(field, apiErrors)} /> : null}
                      </Field>
                    )
                  }}
                />

                <detailsForm.Field
                  name="companyCountry"
                  validators={{
                    onChange: ({ value }: { value: string }) =>
                      value && value.length < 2
                        ? 'Country must be at least 2 characters'
                        : undefined,
                  }}
                  children={(field: AnyFieldApi) => {
                    const apiErrors = getApiErrors(field, detailsValidationErrors)
                    const isInvalid = getIsInvalid(field, apiErrors)

                    return (
                      <Field data-invalid={isInvalid}>
                        <Label className="text-sm font-medium">Country</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Enter country"
                        />
                        {isInvalid ? <FieldError errors={mapFieldErrors(field, apiErrors)} /> : null}
                      </Field>
                    )
                  }}
                />

                <detailsForm.Field
                  name="companyAddressType"
                  validators={{
                    onChange: ({ value }: { value: string }) =>
                      !value ? 'Address type is required' : undefined,
                  }}
                  children={(field: AnyFieldApi) => {
                    const apiErrors = getApiErrors(field, detailsValidationErrors)
                    const isInvalid = getIsInvalid(field, apiErrors)

                    return (
                      <Field data-invalid={isInvalid}>
                        <Label className="text-sm font-medium">Address Type</Label>
                        <Select
                          value={field.state.value}
                          onValueChange={(value) => field.handleChange(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select address type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="work">Work</SelectItem>
                            <SelectItem value="home">Home</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {isInvalid ? <FieldError errors={mapFieldErrors(field, apiErrors)} /> : null}
                      </Field>
                    )
                  }}
                />
              </div>

              <div className="mt-4">
                <detailsForm.Field
                  name="companyIsPrimary"
                  children={(field: AnyFieldApi) => {
                    return (
                      <Field>
                        <div className="flex items-center space-x-2">
                          <input
                            id={field.name}
                            name={field.name}
                            type="checkbox"
                            checked={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <Label htmlFor={field.name} className="text-sm font-medium">
                            Mark as primary address
                          </Label>
                        </div>
                      </Field>
                    )
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={handleDetailsReset}
                disabled={isDetailsPending}
              >
                Reset
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={isDetailsPending}>
                {isDetailsPending ? 'Saving...' : 'Update Vendor'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
