// components/form-field-wrapper.tsx
import { Label } from '@/components/ui/label'
import { Field, FieldError } from '@/components/ui/field'
import type { AnyFieldApi } from '@tanstack/react-form'

interface FormFieldWrapperProps {
  field: AnyFieldApi
  label: React.ReactNode
  children: React.ReactNode
  apiErrors?: string[]
}

export function FormFieldWrapper({ field, label, children, apiErrors = [] }: FormFieldWrapperProps) {
  const isInvalid = (field.state.meta.isTouched && !field.state.meta.isValid) || apiErrors.length > 0
  
  const errors = [
    ...field.state.meta.errors.map((error) => (error ? { message: String(error) } : undefined)),
    ...apiErrors.map((error) => ({ message: error })),
  ].filter(Boolean) as { message: string }[]

  return (
    <Field data-invalid={isInvalid}>
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  )
}