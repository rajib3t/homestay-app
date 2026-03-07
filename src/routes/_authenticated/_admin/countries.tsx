import React, { useCallback, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { setMetaTitle } from '@/lib/utils'
import { CountryHeader } from '@/locations/countries/components/header'
import {CountryList} from '@/locations/countries/components/list'
import type {CreateCountryDTO} from '@/types/location'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCountry as createCountryService} from '@/services/location'
export const Route = createFileRoute('/_authenticated/_admin/countries')({
  head: () => ({
    title: 'Manage Countries',
    meta: [
      {
        name: 'description',
        content: 'Admin interface to manage countries. Add, edit, or remove countries from the system.',
      },
      {
        property: 'og:title',
        content: 'Manage Countries',
      },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const queryClient = useQueryClient()

 
  const { mutate: createCountry } = useMutation({
    mutationFn: (payload: CreateCountryDTO) => createCountryService(payload),
    onSuccess() {
      // Invalidate or refetch country list (dummy key)
      queryClient.invalidateQueries({ queryKey: ['GET_COUNTRIES'] })
    },
    onError(error) {
      console.error('Failed to create country', error)
    },
  })
 
  const handleAddNewCountry = useCallback((payload: CreateCountryDTO) => {
    createCountry(payload)
  }, [createCountry])
  return (
    <React.Fragment>
      <CountryHeader onAddNewCountry={handleAddNewCountry} />
      <CountryList />
    </React.Fragment>
  )
}
