import * as React from "react";
import { ExternalLinkIcon, FileTextIcon, UploadCloudIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { env } from "@/lib/env";

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
  const resolvedPreview = React.useMemo(() => {
    if (!preview) return null;
    if (/^(blob:|data:|https?:\/\/)/i.test(preview)) return preview;

    const apiBaseUrl = env.getApiUrl().replace(/\/+$/, "");
    const normalizedPath = preview.startsWith("/") ? preview : `/${preview}`;
    return `${apiBaseUrl}${normalizedPath}`;
  }, [preview]);

  const isStoredPreview = React.useMemo(() => {
    if (!preview) return false;
    return !/^(blob:|data:)/i.test(preview);
  }, [preview]);

  const previewInfo = React.useMemo(() => {
    if (!resolvedPreview) {
      return { kind: "empty" as const, mime: "", isDocument: false, isPdf: false };
    }

    const raw = resolvedPreview.toLowerCase();
    const mime = raw.startsWith("data:") ? raw.slice(5, raw.indexOf(";") > -1 ? raw.indexOf(";") : raw.indexOf(",")) : "";
    const extension = raw.split("?")[0].split("#")[0].split(".").pop() ?? "";
    const isPdf = mime.includes("application/pdf") || extension === "pdf";
    const isWord =
      mime.includes("application/msword") ||
      mime.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
      extension === "doc" ||
      extension === "docx";
    const isImage =
      mime.startsWith("image/") ||
      ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(extension);

    return {
      kind: isImage ? ("image" as const) : isPdf ? ("pdf" as const) : isWord ? ("word" as const) : ("file" as const),
      mime,
      isDocument: isPdf || isWord,
      isPdf,
    };
  }, [resolvedPreview]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Use the Base64 data URL so previews can infer the MIME type for
    // images, PDFs, and Office documents without extra metadata props.
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onPreviewChange(result);
      onValueChange(result);
      event.target.value = ""; // Reset to allow re-uploading same file
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full">
      <div
          className={cn(
          "relative flex h-48 w-full items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:bg-gray-100/50",
          previewWrapperClassName
        )}
      >
        {resolvedPreview ? (
          previewInfo.kind === "image" ? (
            <img
              src={resolvedPreview}
              alt={alt}
              className={cn("h-full w-full object-cover", previewImageClassName)}
            />
          ) : previewInfo.kind === "pdf" && !isStoredPreview ? (
            <object
              data={resolvedPreview}
              type="application/pdf"
              className={cn("h-full w-full", previewImageClassName)}
            >
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-white px-4 text-center text-sm text-muted-foreground">
                <FileTextIcon className="h-10 w-10 text-gray-400" />
                <span>PDF preview is not available in this browser.</span>
              </div>
            </object>
          ) : previewInfo.kind === "word" && !isStoredPreview ? (
            <iframe
              src={resolvedPreview}
              title={alt}
              className={cn("h-full w-full border-0 bg-white", previewImageClassName)}
            >
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-white px-4 text-center text-sm text-muted-foreground">
                <FileTextIcon className="h-10 w-10 text-gray-400" />
                <span>Document preview is not available in this browser.</span>
              </div>
            </iframe>
          ) : previewInfo.isDocument ? (
            <a
              href={resolvedPreview}
              target="_blank"
              rel="noreferrer"
              className="flex h-full w-full flex-col items-center justify-center gap-3 bg-white px-4 text-center text-sm text-muted-foreground transition-colors hover:bg-gray-100"
            >
              <FileTextIcon className="h-10 w-10 text-gray-400" />
              <span>{alt}</span>
              <span className="inline-flex items-center gap-1 text-blue-600">
                Open in new tab
                <ExternalLinkIcon className="h-4 w-4" />
              </span>
            </a>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-white px-4 text-center text-sm text-muted-foreground">
              <FileTextIcon className="h-10 w-10 text-gray-400" />
              <span>{alt}</span>
              <span>Preview not supported for this file type.</span>
            </div>
          )
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
