import React from "react";
import type { ReactFormExtendedApi, AnyFieldApi } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type VendorFormValues = { 
  username: string;
  firstName: string; 
  lastName: string;
  contactEmail: string; 
  phoneNumber: string;
  password: string;
  confirmPassword: string;
 };
interface AddVendorProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  form: ReactFormExtendedApi<VendorFormValues, any, any, any, any, any, any, any, any, any, any, any>;
  validationErrors?: Record<string, string[]>
}

const validateConfirmPassword = ({
    value,
    fieldApi,
}: {
    value: string;
    fieldApi: AnyFieldApi;
}) => {
    if (!value) {
        return 'Confirm Password is required';
    }

    if (value.length < 3) {
        return 'Confirm Password must be at least 3 characters';
    }

    const password = fieldApi.form.state.values.password as string;
    if (password && value !== password) {
        return 'Passwords do not match';
    }

    return undefined;
};

const AddVendor: React.FC<AddVendorProps> = ({ open, onOpenChange, form, validationErrors }) => {
  if (!open) return null;
  return (
    <React.Fragment>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-6 relative">
          <Button
          variant={"ghost"}
            onClick={() => onOpenChange?.(false)}
            className="absolute right-4 top-4 text-gray-500 hover:text-black cursor-pointer"
          >
            <X size={18} />
          </Button>
              <h2 className="text-xl font-semibold mb-6">
                  Add Vendor
              </h2>

              <div className="space-y-4">
                <form
                    onSubmit={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    form.handleSubmit()
                    }}
                > 
                <div className="mt-2">
                    <form.Field 
                        name={"username"}
                        validators={{
                            onChange: ({ value }: { value: string }) =>
                                !value
                                ? 'Username is required'
                                : value.length < 3
                                    ? 'Username must be at least 3 characters'
                                    : undefined,
                            onChangeAsyncDebounceMs: 500,
                            onChangeAsync: async ({ value }: { value: string }) => {
                                await new Promise((resolve) => setTimeout(resolve, 1000))
                                return (
                                value.includes('error') && 'No "error" allowed in username'
                                )
                            },
                            }}
                        children={(field: AnyFieldApi ) => {
                          const apiErrors = validationErrors?.[field.name] ?? [];
                          const isInvalid =
                            (field.state.meta.isTouched && !field.state.meta.isValid) ||
                            apiErrors.length > 0
                          
                          return (
                              <React.Fragment>
                                  <Field data-invalid={isInvalid}>
                                  <Label className="text-sm font-medium">Username</Label>
                                  <Input
                                      id={field.name}
                                      name={field.name}
                                      value={field.state.value}
                                      onBlur={field.handleBlur}
                                      onChange={(e) => {
                                              field.handleChange(e.target.value)
                              }}
                                      
                                  />
                                  {isInvalid && (
                                      <FieldError errors={[
                                        ...field.state.meta.errors.map((e) => e ? { message: String(e) } : undefined),
                                        ...apiErrors.map((e) => ({ message: e })),
                                      ]} />
                                      )}
                                  </Field>
                              </React.Fragment>
                          )
                        }}
                    />
                
                </div>
                <div className="mt-2">
                    <form.Field 
                        name={"firstName"}
                        validators={{
                            onChange: ({ value }: { value: string }) =>
                                !value
                                ? 'First name is required'
                                : value.length < 3
                                    ? 'First name must be at least 3 characters'
                                    : undefined,
                            onChangeAsyncDebounceMs: 500,
                            onChangeAsync: async ({ value }: { value: string }) => {
                                await new Promise((resolve) => setTimeout(resolve, 1000))
                                return (
                                value.includes('error') && 'No "error" allowed in first name'
                                )
                            },
                            }}
                        children={(field: AnyFieldApi ) => {
                          const apiErrors = validationErrors?.[field.name] ?? [];
                          const isInvalid =
                            (field.state.meta.isTouched && !field.state.meta.isValid) ||
                            apiErrors.length > 0
                          
                          return (
                              <React.Fragment>
                                  <Field data-invalid={isInvalid}>
                                  <Label className="text-sm font-medium">First Name</Label>
                                  <Input
                                      id={field.name}
                                      name={field.name}
                                      type="text"
                                      value={field.state.value}
                                      onBlur={field.handleBlur}
                                      onChange={(e) => {
                                              field.handleChange(e.target.value)
                              }}
                                      
                                  />
                                  {isInvalid && (
                                      <FieldError errors={[
                                        ...field.state.meta.errors.map((e) => e ? { message: String(e) } : undefined),
                                        ...apiErrors.map((e) => ({ message: e })),
                                      ]} />
                                      )}
                                  </Field>
                              </React.Fragment>
                          )
                        }}
                    />
                
                </div>
                <div className="mt-2">
                    <form.Field 
                        name={"lastName"}
                        validators={{
                            onChange: ({ value }: { value: string }) =>
                                !value
                                ? 'Last name is required'
                                : value.length < 3
                                    ? 'Last name must be at least 3 characters'
                                    : undefined,
                            onChangeAsyncDebounceMs: 500,
                            onChangeAsync: async ({ value }: { value: string }) => {
                                await new Promise((resolve) => setTimeout(resolve, 1000))
                                return (
                                value.includes('error') && 'No "error" allowed in last name'
                                )
                            },
                            }}
                        children={(field: AnyFieldApi ) => {
                          const apiErrors = validationErrors?.[field.name] ?? [];
                          const isInvalid =
                            (field.state.meta.isTouched && !field.state.meta.isValid) ||
                            apiErrors.length > 0
                          
                          return (
                              <React.Fragment>
                                  <Field data-invalid={isInvalid}>
                                  <Label className="text-sm font-medium">Last Name</Label>
                                  <Input
                                      id={field.name}
                                      name={field.name}
                                      value={field.state.value}
                                      onBlur={field.handleBlur}
                                      onChange={(e) => {
                                              field.handleChange(e.target.value)
                              }}
                                      
                                  />
                                  {isInvalid && (
                                      <FieldError errors={[
                                        ...field.state.meta.errors.map((e) => e ? { message: String(e) } : undefined),
                                        ...apiErrors.map((e) => ({ message: e })),
                                      ]} />
                                      )}
                                  </Field>
                              </React.Fragment>
                          )
                        }}
                    />
                
                </div>
                <div className="mt-2">
                    <form.Field 
                        name={"contactEmail"}
                        validators={{
                            onChange: ({ value }: { value: string }) =>
                                !value
                                ? 'Email is required'
                                : value.length < 3
                                    ? 'Email must be at least 3 characters'
                                    : undefined,
                            onChangeAsyncDebounceMs: 500,
                            onChangeAsync: async ({ value }: { value: string }) => {
                                await new Promise((resolve) => setTimeout(resolve, 1000))
                                return (
                                value.includes('error') && 'No "error" allowed in email'
                                )
                            },
                            }}
                        children={(field: AnyFieldApi ) => {
                          const apiErrors = validationErrors?.[field.name] ?? [];
                          const isInvalid =
                            (field.state.meta.isTouched && !field.state.meta.isValid) ||
                            apiErrors.length > 0
                          
                          return (
                              <React.Fragment>
                                  <Field data-invalid={isInvalid}>
                                  <Label className="text-sm font-medium">Email</Label>
                                  <Input
                                      id={field.name}
                                      name={field.name}
                                      value={field.state.value}
                                      onBlur={field.handleBlur}
                                      onChange={(e) => {
                                              field.handleChange(e.target.value)
                              }}
                                      
                                  />
                                  {isInvalid && (
                                      <FieldError errors={[
                                        ...field.state.meta.errors.map((e) => e ? { message: String(e) } : undefined),
                                        ...apiErrors.map((e) => ({ message: e })),
                                      ]} />
                                      )}
                                  </Field>
                              </React.Fragment>
                          )
                        }}
                    />
                
                </div>
                <div className="mt-2">
                    <form.Field 
                        name={"phoneNumber"}
                        validators={{
                            onChange: ({ value }: { value: string }) =>
                                !value
                                ? 'Phone number is required'
                                : value.length < 3
                                    ? 'Phone number must be at least 3 characters'
                                    : undefined,
                            onChangeAsyncDebounceMs: 500,
                            onChangeAsync: async ({ value }: { value: string }) => {
                                await new Promise((resolve) => setTimeout(resolve, 1000))
                                return (
                                value.includes('error') && 'No "error" allowed in phone number'
                                )
                            },
                            }}
                        children={(field: AnyFieldApi ) => {
                          const apiErrors = validationErrors?.[field.name] ?? [];
                          const isInvalid =
                            (field.state.meta.isTouched && !field.state.meta.isValid) ||
                            apiErrors.length > 0
                          
                          return (
                              <React.Fragment>
                                  <Field data-invalid={isInvalid}>
                                  <Label className="text-sm font-medium">Phone Number</Label>
                                  <Input
                                      id={field.name}
                                      name={field.name}
                                      value={field.state.value}
                                      onBlur={field.handleBlur}
                                      onChange={(e) => {
                                              field.handleChange(e.target.value)
                                      }}
                                      
                                  />
                                  {isInvalid && (
                                      <FieldError errors={[
                                        ...field.state.meta.errors.map((e) => e ? { message: String(e) } : undefined),
                                        ...apiErrors.map((e) => ({ message: e })),
                                      ]} />
                                      )}
                                  </Field>
                              </React.Fragment>
                          )
                        }}
                    />
                
                </div>
                <div className="mt-2">
                    <form.Field 
                        name={"password"}
                        validators={{
                            onChange: ({ value }: { value: string }) =>
                                !value
                                ? 'Password is required'
                                : value.length < 3
                                    ? 'Password must be at least 3 characters'
                                    : undefined,
                            onChangeAsyncDebounceMs: 500,
                            onChangeAsync: async ({ value }: { value: string }) => {
                                await new Promise((resolve) => setTimeout(resolve, 1000))
                                return (
                                value.includes('error') && 'No "error" allowed in password'
                                )
                            },
                            }}
                        children={(field: AnyFieldApi ) => {
                          const apiErrors = validationErrors?.[field.name] ?? [];
                          const isInvalid =
                            (field.state.meta.isTouched && !field.state.meta.isValid) ||
                            apiErrors.length > 0
                          
                          return (
                              <React.Fragment>
                                  <Field data-invalid={isInvalid}>
                                  <Label className="text-sm font-medium">Password</Label>
                                  <Input
                                      id={field.name}
                                      name={field.name}
                                      value={field.state.value}
                                      type="password"
                                      onBlur={field.handleBlur}
                                      onChange={(e) => {
                                              field.handleChange(e.target.value)
                              }}
                                      
                                  />
                                  {isInvalid && (
                                      <FieldError errors={[
                                        ...field.state.meta.errors.map((e) => e ? { message: String(e) } : undefined),
                                        ...apiErrors.map((e) => ({ message: e })),
                                      ]} />
                                      )}
                                  </Field>
                              </React.Fragment>
                          )
                        }}
                    />
                
                </div>
                <div className="mt-2">
                    <form.Field 
                        name={"confirmPassword"}
                        validators={{
                            onChange: validateConfirmPassword,
                            onChangeListenTo: ['password'],
                            onBlur: validateConfirmPassword,
                            onBlurListenTo: ['password'],
                            onSubmit: validateConfirmPassword,
                                  
                            onChangeAsyncDebounceMs: 500,
                            onChangeAsync: async ({ value }: { value: string }) => {
                                await new Promise((resolve) => setTimeout(resolve, 1000))
                                return (
                                value.includes('error') && 'No "error" allowed in confirm password'
                                )
                            },
                            }}
                        children={(field: AnyFieldApi ) => {
                          const apiErrors = validationErrors?.[field.name] ?? [];
                          const isInvalid =
                            (field.state.meta.isTouched && !field.state.meta.isValid) ||
                            apiErrors.length > 0
                          
                          return (
                              <React.Fragment>
                                  <Field data-invalid={isInvalid}>
                                  <Label className="text-sm font-medium">Confirm Password</Label>
                                  <Input
                                      id={field.name}
                                      name={field.name}
                                      type="password"
                                      value={field.state.value}
                                      onBlur={field.handleBlur}
                                      onChange={(e) => {
                                              field.handleChange(e.target.value)
                              }}
                                      
                                  />
                                  {isInvalid && (
                                      <FieldError errors={[
                                        ...field.state.meta.errors.map((e) => e ? { message: String(e) } : undefined),
                                        ...apiErrors.map((e) => ({ message: e })),
                                      ]} />
                                      )}
                                  </Field>
                              </React.Fragment>
                          )
                        }}
                    />
                
                </div>
                </form>

              </div>
              
        </div>
      </div>
    </React.Fragment>
  )
}

export default AddVendor