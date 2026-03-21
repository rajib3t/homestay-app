import React from 'react'
import ConfirmDialog from '@/components/ui/confirm-dialog'
    
import type {  Facility } from '@/types/attribute/index.'

interface ConfirmFacilityModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  facility?: Facility | null
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
}

const ConfirmFacilityModal: React.FC<ConfirmFacilityModalProps> = ({ open, onOpenChange, facility, onConfirm, isLoading = false }) => {
  const title = facility ? `${facility.status ? 'Disable' : 'Enable'} ${facility.name}` : 'Change status'
  const description = facility ? `Are you sure you want to ${facility.status ? 'disable' : 'enable'} ${facility.name}?` : undefined
  const confirmLabel = facility && facility.status ? 'Disable' : 'Enable'

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      destructive={facility ? Boolean(facility.status) : false}
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  )
}

export default ConfirmFacilityModal
