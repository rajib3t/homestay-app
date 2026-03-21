import React from 'react'
import ConfirmDialog from '@/components/ui/confirm-dialog'
    
import type { BedType } from '@/types/attribute/index.'

interface ConfirmBedTypeModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  bedType?: BedType | null
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
}

const ConfirmBedTypeModal: React.FC<ConfirmBedTypeModalProps> = ({ open, onOpenChange, bedType, onConfirm, isLoading = false }) => {
  const title = bedType ? `${bedType.status ? 'Disable' : 'Enable'} ${bedType.name}` : 'Change status'
  const description = bedType ? `Are you sure you want to ${bedType.status ? 'disable' : 'enable'} ${bedType.name}?` : undefined
  const confirmLabel = bedType && bedType.status ? 'Disable' : 'Enable'

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      destructive={bedType ? Boolean(bedType.status) : false}
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  )
}

export default ConfirmBedTypeModal
