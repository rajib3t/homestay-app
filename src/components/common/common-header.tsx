import React from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export type CommonHeaderProps = {
  title: string
  description?: string
  addLabel?: string
  openAddModal: boolean
  setOpenAddModal: (open: boolean) => void
  AddModal: React.ComponentType<any> | null
  onAdd?: (payload: any) => Promise<any> | void
  validationErrors?: Record<string, string[]>
}

const CommonHeader: React.FC<CommonHeaderProps> = ({
  title,
  description,
  addLabel = 'Add New',
  openAddModal,
  setOpenAddModal,
  AddModal,
  onAdd,
  validationErrors,
}) => {
  return (
    <React.Fragment>
      <div className="flex flex-col gap-4 pb-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
              {title}
            </h1>

            {description && (
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                {description}
              </p>
            )}
          </div>

          <Button
            size="sm"
            className="gap-2 shadow-sm cursor-pointer"
            onClick={() => setOpenAddModal(true)}
          >
            <Plus className="w-4 h-4" />
            {addLabel}
          </Button>
        </div>
      </div>

      {openAddModal && AddModal && (
        <AddModal
          onOpenChange={(open: boolean) => setOpenAddModal(open)}
          onSave={async (payload: any) => {
            try {
              await onAdd?.(payload)
              setOpenAddModal(false)
            } catch (e) {
              // keep modal open to show validation errors
            }
          }}
          validationErrors={validationErrors}
        />
      )}
    </React.Fragment>
  )
}

export default CommonHeader
