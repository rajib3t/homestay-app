import React from 'react'
import ConfirmDialog from '@/components/ui/confirm-dialog'
    
import type { Amenity } from '@/types/attribute/index.'

interface ConfirmAmenityModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  amenity?: Amenity | null
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
}

const ConfirmAmenityModal: React.FC<ConfirmAmenityModalProps> = ({ open, onOpenChange, amenity, onConfirm, isLoading = false }) => {
  const title = amenity ? `${amenity.status ? 'Disable' : 'Enable'} ${amenity.name}` : 'Change status'
  const description = amenity ? `Are you sure you want to ${amenity.status ? 'disable' : 'enable'} ${amenity.name}?` : undefined
  const confirmLabel = amenity && amenity.status ? 'Disable' : 'Enable'

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      destructive={amenity ? Boolean(amenity.status) : false}
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  )
}

export default ConfirmAmenityModal
