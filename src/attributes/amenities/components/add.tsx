import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type AnyFieldApi } from "@tanstack/react-form"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import UploadImage from "@/components/upload-image";
import {
  Field,
  FieldError,
} from "@/components/ui/field"
import type { ReactFormExtendedApi } from "@tanstack/react-form";

type AmenityFormValues = { name: string; icon: string };

interface AddAmenityProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  form: ReactFormExtendedApi<AmenityFormValues, any, any, any, any, any, any, any, any, any, any, any>;
  validationErrors?: Record<string, string[]>
}

const AddAmenity: React.FC<AddAmenityProps> = ({ open, onOpenChange, form, validationErrors }) => {
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) setImagePreview(null);
  }, [open]);

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
                Add Amenity
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
                        name="icon"
                        validators={{
                        onChange: ({ value }: { value: File | null }) =>
                            !value ? 'An icon is required' : undefined,
                        }}
                        children={(field: AnyFieldApi ) => {
                            const apiErrors = validationErrors?.[field.name] ?? [];
                            const isInvalid =
                              (field.state.meta.isTouched && !field.state.meta.isValid) ||
                              apiErrors.length > 0
                            return (
                            <React.Fragment>
                                <Field data-invalid={isInvalid}>
                                <Label className="text-sm font-medium">Icon</Label>
                                <UploadImage
                                    id={field.name}
                                    name={field.name}
                                    preview={imagePreview}
                                    onPreviewChange={setImagePreview}
                                    onValueChange={(value) => field.handleChange(value)}
                                    onBlur={field.handleBlur}
                                    alt="icon preview"
                                    emptyText="20x20"
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
                                        setImagePreview(null)
                                        e.preventDefault()
                                        form.reset()
                                    }}
                                >
                                    Reset
                                </Button>
                                <Button type="submit" disabled={!canSubmit}>
                                    {isSubmitting ? '...' : 'Add Amenity'}
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

export default AddAmenity;