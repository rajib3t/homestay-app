

import { createFileRoute } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'
import { appLogo, appName } from '@/store/setting'

import { MapPin, ShieldCheck, Sparkles } from 'lucide-react'
import { useComingSoonSetting } from '@/hooks/app-setting'
import { useEffect, useMemo, useState } from 'react'
export const Route = createFileRoute('/(public)/_layout/')({
  ssr: 'data-only',
  head: () => ({
    title: 'Home',
    meta: [
      {
        name: 'description',
        content: 'Welcome to our homestay platform. Find your perfect stay with us.',
      },
      {
        property: 'og:title',
        content: 'Home',
      },
    ],
  }),
  component: RouteComponent,
})
function formatLaunchDate(value: string | null | undefined) {
  if (!value) return null

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed)
}

function resolveMediaUrl(value: string | null | undefined) {
  if (!value) return null
  if (/^(blob:|data:|https?:\/\/)/i.test(value)) return value
  return value.startsWith('/') ? value : `/${value}`
}

function getCountdownTarget(value: string | null | undefined) {
  if (!value) return null

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatCountdown(target: Date | null) {
  if (!target) {
    return {
      days: '00',
      hours: '00',
      minutes: '00',
      seconds: '00',
      finished: false,
    }
  }

  const diff = Math.max(target.getTime() - Date.now(), 0)
  const totalSeconds = Math.floor(diff / 1000)

  return {
    days: String(Math.floor(totalSeconds / 86400)).padStart(2, '0'),
    hours: String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, '0'),
    minutes: String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0'),
    seconds: String(totalSeconds % 60).padStart(2, '0'),
    finished: diff === 0,
  }
}

function CountdownBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-20 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center backdrop-blur-md">
      <div className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-white/55">{label}</div>
    </div>
  )
}
function RouteComponent() {
    const name = useAtomValue(appName)
    const logo = useAtomValue(appLogo)
    const { data, isLoading } = useComingSoonSetting()
      const [now, setNow] = useState(Date.now())
    
      const media = useMemo(
        () => ({
          video: resolveMediaUrl(data?.video_url),
          image: resolveMediaUrl(data?.background_image_url),
          launchDate: formatLaunchDate(data?.launch_date),
          countdownTarget: getCountdownTarget(data?.launch_date),
        }),
        [data],
      )
    
      useEffect(() => {
        if (!media.countdownTarget) return
    
        const timer = window.setInterval(() => {
          setNow(Date.now())
        }, 1000)
    
        return () => window.clearInterval(timer)
      }, [media.countdownTarget])
    
      const countdown = useMemo(
        () => formatCountdown(media.countdownTarget),
        [media.countdownTarget, now],
      )
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
         {media.video ? (
           <video
             className="absolute inset-0 h-full w-full object-cover"
             autoPlay
             muted
             loop
             playsInline
             poster={media.image ?? '/home-bg.jpg'}
           >
             <source src={media.video} type="video/mp4" />
           </video>
         ) : media.image ? (
           <img
             src={media.image}
             alt="Coming soon background"
             className="absolute inset-0 h-full w-full object-cover"
           />
         ) : (
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_36%),linear-gradient(to_bottom,rgba(2,6,23,0.45),rgba(2,6,23,0.9))]" />
         )}
   
         <div className="absolute inset-0 bg-slate-950/55" />
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_36%),linear-gradient(to_bottom,rgba(2,6,23,0.25),rgba(2,6,23,0.8))]" />
   
         <div className="relative z-10 flex min-h-screen items-center px-6 py-12">
           <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
             <div className="flex flex-col justify-center">
               <div className="mb-6 flex items-center gap-3">
                 <img
                   src={`${logo ?? '/logo.png'}`}
                   alt="Homestay logo"
                   className="h-12 w-12 rounded-2xl border border-white/15 bg-white/10 p-2 shadow-lg backdrop-blur-md"
                 />
                 <div className="leading-tight">
                   <p className="font-glitten text-lg text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
                      {name ?? 'Homestay'}
                   </p>
                   <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
                     Coming soon
                   </p>
                 </div>
               </div>
   
               <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium uppercase tracking-[0.2em] text-white/80 backdrop-blur-md">
                 <Sparkles className="h-4 w-4" />
                 {isLoading ? 'Loading launch details' : 'Launching soon'}
               </div>
   
               <h1 className="font-glitten max-w-3xl text-5xl tracking-tight md:text-7xl">
                 Your next stay should feel unforgettable.
               </h1>
   
               <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78 md:text-xl">
                 We are building a calmer, faster way to discover beautiful homestays with
                 memorable views, thoughtful hosts, and easy booking.
               </p>
   
               <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/80">
                 <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md">
                   <MapPin className="h-4 w-4" />
                   Curated destinations
                 </span>
                 <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md">
                   <ShieldCheck className="h-4 w-4" />
                   Trusted hosts
                 </span>
                 {media.launchDate ? (
                   <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md">
                     <Sparkles className="h-4 w-4" />
                     Launches on {media.launchDate}
                   </span>
                 ) : null}
               </div>
   
               <div className="mt-10 max-w-2xl rounded-[2rem] border border-white/15 bg-slate-950/35 p-5 shadow-2xl backdrop-blur-2xl">
                 <div className="flex flex-wrap gap-3">
                   <CountdownBox label="Days" value={countdown.days} />
                   <CountdownBox label="Hours" value={countdown.hours} />
                   <CountdownBox label="Minutes" value={countdown.minutes} />
                   <CountdownBox label="Seconds" value={countdown.seconds} />
                 </div>
                 <p className="mt-4 text-sm text-white/70">
                   {countdown.finished
                     ? 'We are live now.'
                     : 'Counting down to the launch date from the backend.'}
                 </p>
               </div>
             </div>
   
             <div className="flex items-end lg:justify-end">
               <div className="w-full max-w-md rounded-[2rem] border border-white/15 bg-slate-950/35 p-6 shadow-2xl backdrop-blur-2xl md:p-8">
                 <p className="text-sm uppercase tracking-[0.24em] text-white/55">What to expect</p>
                 <div className="mt-6 space-y-4">
                   <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                     <p className="text-base font-medium">Stunning stays</p>
                     <p className="mt-1 text-sm leading-6 text-white/65">
                       Handpicked homes and stays that feel personal, peaceful, and premium.
                     </p>
                   </div>
                   <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                     <p className="text-base font-medium">Simple booking</p>
                     <p className="mt-1 text-sm leading-6 text-white/65">
                       Clear pricing, smooth checkout, and a booking flow that stays out of your way.
                     </p>
                   </div>
                   <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                     <p className="text-base font-medium">Early access</p>
                     <p className="mt-1 text-sm leading-6 text-white/65">
                       Join the waitlist to be first in line when we launch.
                     </p>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>
  )
}
