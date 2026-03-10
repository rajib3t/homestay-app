import React from 'react'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import type { Country } from '@/types/location'

interface ConfirmCountryModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  country?: Country | null
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
}

const ConfirmCountryModal: React.FC<ConfirmCountryModalProps> = ({ open, onOpenChange, country, onConfirm, isLoading = false }) => {
  const title = country ? `${country.status ? 'Disable' : 'Enable'} ${country.name}` : 'Change status'
  const description = country ? `Are you sure you want to ${country.status ? 'disable' : 'enable'} ${country.name}?` : undefined
  const confirmLabel = country && country.status ? 'Disable' : 'Enable'

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      destructive={country ? Boolean(country.status) : false}
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  )
}

export default ConfirmCountryModal
