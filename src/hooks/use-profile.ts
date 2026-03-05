import { useQuery } from '@tanstack/react-query'
import { fetchUserProfile } from '@/services/profile'
import { useAtom } from 'jotai'
import { userFirstName, userLastName, userEmail, userMobile, userType } from '@/store/auth'
import { useEffect } from 'react'

export const GET_PROFILE_KEY = ['GET_PROFILE']

export function useProfile() {
    const [, setFirstName] = useAtom(userFirstName)
    const [, setLastName] = useAtom(userLastName)
    const [, setEmail] = useAtom(userEmail)
    const [, setPhone] = useAtom(userMobile)
    const [, setType] = useAtom(userType)

    const query = useQuery({
        queryKey: GET_PROFILE_KEY,
        queryFn: async () => {
            const resp = await fetchUserProfile()
            return resp.data
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false, // Don't refetch on window focus
        refetchOnMount: false, // Don't refetch on component mount if data exists
        refetchOnReconnect: false, // Don't refetch on reconnect
    })

    // Sync with Jotai atoms whenever data changes
    useEffect(() => {
        if (query.data) {
            const d = query.data
            setFirstName(d.first_name)
            setLastName(d.last_name)
            setEmail(d.email)
            setPhone(d.mobile ?? null)
            setType(d.user_type)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query.data])

    return query
}
