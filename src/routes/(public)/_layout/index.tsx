import { createFileRoute } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'
import { whiteLogo, appName } from '@/store/setting'

import { MapPin, ShieldCheck, Sparkles, Stamp } from 'lucide-react'
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
    <div className="stub-cell flex min-w-[4.2rem] flex-col items-center">
      <div className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-primary-foreground md:text-4xl">
        {value}
      </div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.32em] text-accent/90">
        {label}
      </div>
    </div>
  )
}
function RouteComponent() {
    const name = useAtomValue(appName)
    const logo = useAtomValue(whiteLogo)
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
    <div className="relative min-h-screen overflow-hidden bg-primary text-primary-foreground">
      {/* signature-element styles: boarding-pass ticket + postcard chips, built on theme tokens */}
      <style>{`
        .ticket-stub {
          position: relative;
          background: color-mix(in oklch, var(--color-primary) 88%, black 12%);
          border: 1px solid color-mix(in oklch, var(--color-primary-foreground) 18%, transparent);
        }
        .ticket-stub::before,
        .ticket-stub::after {
          content: "";
          position: absolute;
          width: 22px;
          height: 22px;
          border-radius: 9999px;
          background: rgba(0, 0, 0, 0.28);
          backdrop-filter: blur(6px);
          border: 1px solid color-mix(in oklch, var(--color-primary-foreground) 18%, transparent);
          top: 50%;
          transform: translateY(-50%);
        }
        .ticket-stub::before { left: -11px; }
        .ticket-stub::after { right: -11px; }
        .ticket-divider {
          border-left: 2px dashed color-mix(in oklch, var(--color-primary-foreground) 28%, transparent);
        }
        .stub-cell + .stub-cell {
          border-left: 1px dashed color-mix(in oklch, var(--color-primary-foreground) 18%, transparent);
          padding-left: 1rem;
          margin-left: 0.25rem;
        }
        .postcard-chip {
          position: relative;
          border: 1px dashed var(--color-border);
          transition: transform 200ms ease, border-color 200ms ease;
        }
        .postcard-chip:hover {
          transform: rotate(-0.6deg) translateY(-2px);
          border-color: color-mix(in oklch, var(--color-accent) 65%, transparent);
        }
        .stamp-badge {
          transform: rotate(-9deg);
        }
      `}</style>

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
           <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary to-secondary" />
         )}

         {/* brand-toned dusk overlay: primary teal deepening into secondary blue-teal */}
         <div className="absolute inset-0 bg-primary/55" />
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,color-mix(in_oklch,var(--color-accent)_18%,transparent),transparent_40%),linear-gradient(to_bottom,color-mix(in_oklch,var(--color-primary)_30%,transparent),color-mix(in_oklch,var(--color-secondary)_88%,transparent))]" />

         <div className="relative z-10 flex min-h-screen items-center px-6 py-12">
           <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
             <div className="flex flex-col justify-center">
               <div className="mb-8 flex items-center gap-4">
                 <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-accent/50 bg-primary-foreground/12 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
                   <img
                     src={`${logo ?? '/logo.png'}`}
                     alt="Homestay logo"
                     className="h-14 w-14 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
                   />
                 </div>
                 <div className="leading-tight">
                   <p className="font-glitten text-2xl text-primary-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
                      {name ?? 'Homestay'}
                   </p>
                   <p className="font-mono text-xs uppercase tracking-[0.34em] text-accent">
                     Coming soon
                   </p>
                 </div>
               </div>

               <div className="stamp-badge mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-primary/40 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.22em] text-accent">
                 <Stamp className="h-3.5 w-3.5" />
                 {isLoading ? 'Loading launch details' : 'Reserved for you'}
               </div>

               <h1 className="font-valleki max-w-3xl text-5xl leading-[1.05] tracking-tight text-primary-foreground md:text-7xl">
                 Your next stay should feel unforgettable.
               </h1>

               <p className="mt-6 max-w-2xl text-lg leading-8 text-primary-foreground/75 md:text-xl">
                 We are building a calmer, faster way to discover beautiful homestays with
                 memorable views, thoughtful hosts, and easy booking.
               </p>

               <div className="mt-8 flex flex-wrap gap-3 text-sm text-primary-foreground/85">
                 <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/5 px-4 py-2">
                   <MapPin className="h-4 w-4 text-accent" />
                   Curated destinations
                 </span>
                 <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/5 px-4 py-2">
                   <ShieldCheck className="h-4 w-4 text-accent" />
                   Trusted hosts
                 </span>
                 {media.launchDate ? (
                   <span className="inline-flex items-center gap-2 rounded-full border border-accent/50 bg-accent/20 px-4 py-2 text-primary-foreground">
                     <Sparkles className="h-4 w-4 text-accent" />
                     Launches on {media.launchDate}
                   </span>
                 ) : null}
               </div>

               {/* signature element: boarding-pass style countdown ticket */}
               <div className="ticket-stub mt-10 flex max-w-2xl items-stretch rounded-xl px-6 py-5 shadow-2xl">
                 <div className="flex flex-1 flex-wrap items-center gap-1">
                   <CountdownBox label="Days" value={countdown.days} />
                   <CountdownBox label="Hours" value={countdown.hours} />
                   <CountdownBox label="Minutes" value={countdown.minutes} />
                   <CountdownBox label="Seconds" value={countdown.seconds} />
                 </div>
                 <div className="ticket-divider ml-5 hidden flex-col justify-center pl-5 sm:flex">
                   <p className="max-w-[9rem] text-xs leading-5 text-primary-foreground/60">
                     {countdown.finished
                       ? 'We are live now.'
                       : 'Counting down to launch, straight from the backend.'}
                   </p>
                 </div>
               </div>
             </div>

             <div className="flex items-end lg:justify-end">
               <div className="w-full max-w-md rounded-xl border border-border bg-card/90 p-6 text-card-foreground shadow-2xl backdrop-blur-xl md:p-8">
                 <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent-foreground/70">
                   What to expect
                 </p>
                 <div className="mt-6 space-y-4">
                   <div className="postcard-chip rounded-lg bg-muted/40 p-4">
                     <p className="font-valleki text-lg text-card-foreground">Stunning stays</p>
                     <p className="mt-1 text-sm leading-6 text-muted-foreground">
                       Handpicked homes and stays that feel personal, peaceful, and premium.
                     </p>
                   </div>
                   <div className="postcard-chip rounded-lg bg-muted/40 p-4">
                     <p className="font-valleki text-lg text-card-foreground">Simple booking</p>
                     <p className="mt-1 text-sm leading-6 text-muted-foreground">
                       Clear pricing, smooth checkout, and a booking flow that stays out of your way.
                     </p>
                   </div>
                   <div className="postcard-chip rounded-lg bg-muted/40 p-4">
                     <p className="font-valleki text-lg text-card-foreground">Early access</p>
                     <p className="mt-1 text-sm leading-6 text-muted-foreground">
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