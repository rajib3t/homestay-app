import * as React from "react";
import { UploadCloudIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UploadImageProps {
  id: string;
  name: string;
  preview: string | null;
  onPreviewChange: (preview: string | null) => void;
  onValueChange: (value: string) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  accept?: string;
  alt?: string;
  buttonText?: string;
  emptyText?: string;
  disabled?: boolean;
  previewWrapperClassName?: string;
  previewImageClassName?: string;
}

const UploadImage: React.FC<UploadImageProps> = ({
  id,
  name,
  preview,
  onPreviewChange,
  onValueChange,
  onBlur,
  accept = "image/*",
  alt = "image preview",
  buttonText = "Upload Image",
  emptyText = "No image selected",
  disabled = false,
  previewWrapperClassName,
  previewImageClassName,
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 1. Create a lightning-fast URL for the UI preview
    const objectUrl = URL.createObjectURL(file);
    onPreviewChange(objectUrl);

    // 2. Process the Base64 for the Form/API value
    const reader = new FileReader();
    reader.onload = () => {
      onValueChange(reader.result as string);
      event.target.value = ""; // Reset to allow re-uploading same file
    };
    reader.readAsDataURL(file);
  };

  // 3. Clean up the object URL to prevent memory leaks
  React.useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="w-full">
      <div
        className={cn(
          "relative flex h-48 w-full items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:bg-gray-100/50",
          previewWrapperClassName
        )}
      >
        {preview ? (
          <img
            src={preview}
            alt={alt}
            className={cn("h-full w-full object-cover", previewImageClassName)}
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <span className="text-sm">{emptyText}</span>
          </div>
        )}
      </div>

      <div className="mt-3">
        <Label
          htmlFor={id}
          className={cn(
            "flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98]",
            disabled && "pointer-events-none opacity-50"
          )}
        >
          <UploadCloudIcon className="h-4 w-4 text-gray-500" />
          {buttonText}
          <Input
            id={id}
            name={name}
            type="file"
            accept={accept}
            className="hidden"
            disabled={disabled}
            onBlur={onBlur}
            onChange={handleFileChange}
          />
        </Label>
      </div>
    </div>
  );
};

export default UploadImage;