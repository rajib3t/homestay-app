import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: React.ReactNode
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
  className?: string
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = 'Confirm',
  description = 'Are you sure you want to continue?',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  isLoading = false,
  className,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={cn('fixed inset-0 z-40 bg-black/40')} />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md bg-popover p-6 shadow-lg',
            className
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="mt-2 text-sm text-muted-foreground">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                aria-label="Close"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <Button variant="outline" disabled={isLoading}>
                {cancelLabel}
              </Button>
            </Dialog.Close>

            <Button
              onClick={onConfirm}
              className="bg-destructive text-destructive-foreground hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ConfirmDialog
