import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type AnyFieldApi } from "@tanstack/react-form"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
} from "@/components/ui/field"
import type { ReactFormExtendedApi } from "@tanstack/react-form";
import type { BedType } from "@/types/attribute/index.";

type BedTypeFormValues = { id: string; name: string; capacity: number | null };

interface EditBedTypeProps {
data: BedType;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  form: ReactFormExtendedApi<BedTypeFormValues, any, any, any, any, any, any, any, any, any, any, any>;
  validationErrors?: Record<string, string[]>
}

const EditBedType: React.FC<EditBedTypeProps> = ({ open, onOpenChange, form, validationErrors }) => {
  



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
                Add Bed Type
            </h2>
            <form
                onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
                }}
            >
                <div>
                    <form.Field 
                            name="name"
                            validators={{
                    onChange: ({ value }: { value: string }) =>
                        !value
                        ? 'Name is required'
                        : value.length < 3
                            ? 'Name must be at least 3 characters'
                            : undefined,
                    onChangeAsyncDebounceMs: 500,
                    onChangeAsync: async ({ value }: { value: string }) => {
                        await new Promise((resolve) => setTimeout(resolve, 1000))
                        return (
                        value.includes('error') && 'No "error" allowed in name'
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
                                <Label className="text-sm font-medium">Name</Label>
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
                <div>
                    <form.Field 
                            name="capacity"
                            validators={{
                    onChange: ({ value }: { value: number }) =>
                        !value
                        ? 'Capacity is required'
                        : value < 1
                            ? 'Capacity must be at least 1'
                            : undefined,
                    onChangeAsyncDebounceMs: 500,
                    onChangeAsync: async ({ value }: { value: number }) => {
                        await new Promise((resolve) => setTimeout(resolve, 1000))
                        return (
                        value < 1 && 'Capacity must be at least 1'
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
                                <Label className="text-sm font-medium">Capacity</Label>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    type="number"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => {
                                            field.handleChange(Number(e.target.value))
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
                
                <div className="flex justify-end gap-3 pt-4">
                    <form.Subscribe
                        selector={(state: { canSubmit: boolean; isSubmitting: boolean }): [boolean, boolean] => [state.canSubmit, state.isSubmitting]}
                        children={([canSubmit, isSubmitting]: [boolean, boolean]) => (
                            <React.Fragment>
                                <Button
                                    variant={"outline"}
                                    type="reset"
                                    onClick={(e) => {
                                       
                                        e.preventDefault()
                                        form.reset()
                                    }}
                                >
                                    Reset
                                </Button>
                                <Button type="submit" disabled={!canSubmit}>
                                    {isSubmitting ? '...' : 'Edit Bed Type'}
                                </Button>
                            </React.Fragment>
                        )}
                    />
                </div>

            </form>
        </div>
      </div>
    </React.Fragment>
  );
};

export default EditBedType;