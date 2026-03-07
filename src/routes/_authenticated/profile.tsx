import { createFileRoute } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { setMetaTitle } from '@/lib/utils'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { updateUserProfile } from '@/services/profile'
import { CircleCheckIcon, OctagonXIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import React from 'react'
import { useAtom } from 'jotai'
import { userFirstName, userLastName, userEmail, userMobile } from '@/store/auth'
import type { UserData } from '@/types/user'
import type { ApiResponse } from '@/types/common'
import { useProfile } from '@/hooks/use-profile'

export const Route = createFileRoute('/_authenticated/profile')({
  head: () => ({
    title: 'Profile',
    meta: [
      {
        name: 'description',
        content: 'View and update your profile information.',
      },
      {
        property: 'og:title',
        content: 'Profile',
      },
      {
        property: 'og:description',
        content: 'View and update your profile information.',
      },
      {
        name: 'twitter:title',
        content: 'Profile',
      },
      {
        name: 'twitter:description',
        content: 'View and update your profile information.',
      },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const queryClient = useQueryClient()
  const [first_name, setFirstName] = useAtom<string | null>(userFirstName)
  const [last_name, setLastName] = useAtom<string | null>(userLastName)
  const [email, setEmail] = useAtom<string | null>(userEmail)
  const [mobile, setPhone] = useAtom<string | null>(userMobile)

  const { isLoading, isError, error } = useProfile()



  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const { mutateAsync: updateProfileAsync, isPending: isUpdating } =
    useMutation({
    mutationFn: async (data: { first_name: string; last_name: string; email: string; mobile: string }) => 
        updateUserProfile(data as UserData),
    onSuccess: (data: ApiResponse<UserData>) => {
        console.log(data.data)
        setFirstName(data.data.first_name)
        setLastName(data.data.last_name)
        setEmail(data.data.email)
        setPhone(data.data.mobile ?? mobile)
        setFieldErrors({})
        // Update the cache directly instead of invalidating to avoid extra API call
        queryClient.setQueryData(['GET_PROFILE'], data.data)
      toast.success(  'Profile updated successfully', {
       
        richColors: true,
        icon: <CircleCheckIcon />  
      })    
    },
    onError: (err: any) => {
      // Try to extract field-level errors from common shapes
      const possibleFields = (err && (err.fields || err.errors || err.data?.errors)) ?? null
      if (possibleFields && typeof possibleFields === 'object') {
        const mapped: Record<string, string> = {}
        Object.entries(possibleFields).forEach(([k, v]) => {
          if (Array.isArray(v)) mapped[k] = String(v[0])
          else mapped[k] = String(v)
        })
        setFieldErrors(mapped)
      } else {
        setFieldErrors({})
      }

      toast.error(err?.message || 'Failed to update profile', {
       
        richColors: true,
        icon: <OctagonXIcon />,
        style:{
            "--normal-bg": "#fff0f0"
        } as React.CSSProperties
      })
    },
        
    
  })

  const handleSaveChanges = async () => {
    try {
      setFieldErrors({})
      await updateProfileAsync({ 
        first_name: first_name ?? '', 
        last_name: last_name ?? '', 
        email: email ?? '', 
        mobile: mobile ?? '' 
      })
      // onSuccess toast is handled by the mutation `onSuccess` callback
    } catch (err: any) {
      // If mutation throws, try to extract field errors here as well
      const possibleFields = (err && (err.fields || err.errors || err.data?.errors)) ?? null
      if (possibleFields && typeof possibleFields === 'object') {
        const mapped: Record<string, string> = {}
        Object.entries(possibleFields).forEach(([k, v]) => {
          if (Array.isArray(v)) mapped[k] = String(v[0])
          else mapped[k] = String(v)
        })
        setFieldErrors(mapped)
      }

     
    }
  }
  return (
     <React.Fragment>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Profile</CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading profile...</div>
          ) : isError ? (
            <div className="text-sm text-red-600">{(error as any)?.message || 'Unable to load profile.'}</div>
          ) : (
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">First Name</Label>
                <Input
                  id="first_name"
                  value={first_name ?? ''}
                  onChange={(e) => {
                    setFirstName(e.target.value)
                    setFieldErrors((s) => ({ ...s, name: '' }))
                  }}
                  disabled={isLoading}
                />
                {fieldErrors.first_name && (
                  <p className="text-destructive text-sm mt-1">{fieldErrors.first_name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={last_name ?? ''}
                  onChange={(e) => {
                    setLastName(e.target.value)
                    setFieldErrors((s) => ({ ...s, name: '' }))
                  }}
                  disabled={isLoading}
                />
                {fieldErrors.last_name && (
                  <p className="text-destructive text-sm mt-1">{fieldErrors.last_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email ?? ''}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setFieldErrors((s) => ({ ...s, email: '' }))
                  }}
                  disabled={isLoading}
                />
                {fieldErrors.email && (
                  <p className="text-destructive text-sm mt-1">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  id="mobile"
                  value={mobile ?? ''}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    setFieldErrors((s) => ({ ...s,  mobile: '' }))
                  }}
                  disabled={isLoading}
                />
                {fieldErrors.mobile && (
                  <p className="text-destructive text-sm mt-1">{fieldErrors.mobile}</p>
                )}
              </div>

              <div className="pt-2">
                <Button type="button" className="w-full cursor-pointer" disabled={isLoading || isUpdating} onClick={handleSaveChanges}>
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </React.Fragment>
  )
}
