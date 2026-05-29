import { useQuery } from '@tanstack/react-query'
import { settingService } from '@/services/setting'

import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { appLogo, appName, dateFormat, favIcon, timeFormat, timeZone, whiteLogo } from '@/store/setting'
export const GET_SETTING_KEY = ['GET_SETTING_KEY']
export function useSetting(){
    const [,setAppName] = useAtom(appName)
    const [,setAppLogo] = useAtom(appLogo)
    const [,setWhiteLogo] = useAtom(whiteLogo)
    const [,setFavIcon] = useAtom(favIcon)
    const [,setTimeZone] = useAtom(timeZone)
    const [,setDateFormat] = useAtom(dateFormat)
    const [,setTimeFormat] = useAtom(timeFormat)

    const query = useQuery({
        queryKey: GET_SETTING_KEY,
        queryFn: async () => {
            const resp = await settingService.getSetting()
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
            setAppName(d.app_name)
            setAppLogo(d.app_logo)
            setWhiteLogo(d.white_logo)
            setFavIcon(d.app_favicon ?? '')
            setTimeZone(d.app_timezone)
            setDateFormat(d.app_date_format ?? '')
            setTimeFormat(d.app_time_format ?? '')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query.data])

    return query


}