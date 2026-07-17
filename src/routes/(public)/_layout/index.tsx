

import { createFileRoute } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'
import { appLogo, appName } from '@/store/setting'

import { MapPin, ShieldCheck, Sparkles } from 'lucide-react'
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

function RouteComponent() {
    const name = useAtomValue(appName)
    const logo = useAtomValue(appLogo)
  return (
   <div className="relative min-h-[calc(100vh-0px)] overflow-hidden bg-slate-950 text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/home-bg.jpg"
      >
        <source src="https://tashihome.s3.ap-south-1.amazonaws.com/IMG_3760%20%281%29.MP4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAWOPMEE44LNCX4GRB%2F20260717%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260717T054252Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEI7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCmFwLXNvdXRoLTEiSDBGAiEA7zbRP4YfHEU%2BxvlLbq84CQET3vQE1svET5wneoYd33ECIQCI4huRpYvyMhQTfHcgM09zGX61m0vPvfhZ5DYQ3X6bliraAghXEAQaDDQ0MzQxMzcwMjQ1NiIMF8NmrTBpM01ubj74KrcCJ%2FIWPryYYWMr8BWvnAYSK2Gg22Z%2FloL7VUYiuMlouQaxcrWzdLFPIvGyajNTpv2oYg%2FfHfEQWMvHSNj5l6oD%2BJpza5%2FXFR%2Bkvq%2B2QL0%2FtheL5XVUqQiaJj%2FpzQrLlQZ%2B%2Fp4ON3G5kjTn76CFLsSXvXTU2fryN7P5hY7t3GdnuMOf2%2Fd8rUqinHLP8%2FitIdMFGIwnKKxf5KxxTMAcLdIIMqMHcdU6dmm1ZY8jCNoEBIhfZumbll127kHUIrcwKOww5nUvBm8l4PGInpWOoVJCL49GoWgu%2B2Qugx02FyhkcMG%2FAhoDYrpBeENhRLpZ8ljz89J7laAKiFcwq13rub0TjjouZk%2FXNHbUWy2tXYoAIyOFcSfz1V%2BVZBGudXuTSXtYnz3JZRAKcY8AWJOIJWsqUMwDOLpPNGUwtIDn0gY6rAKdqwaGD950%2BNhz8cd3LS6F8zFNN%2BETbICpDsUIFGldaGtqXPA7P%2B5ftkvbU3qk3%2BCl%2ByzEyoveNnip7FlENQ97n5eAGFnT3FmmOokBMO6aKkaTC3ZLQBps%2F45spwFPVigmJDWmrwdwjQq4d%2FbWkyeduW0eU3xnK6xkFsssCZts7sckrgfNfrl%2BetSrnycGcro%2BLAgjWUT6cKZ1n0Rzr5SqXAaZNOlW4FmS0nB0TnMMGVSCe6uJ%2B58H70Wo1lNytI3nPw0iaAdufUQDkjLKQGj0FzqcEiM%2F2o5pTAaFdbU%2BBSN90aqJa8Le45nZXm2fuZsOFqgEIQ1lmmLN92Umo%2FdoNgVEu9ym2hCk1hFcP4p6JR2EsYtB%2F18BdNfRCtNVv00%2B4Aera7QYXVxjKNE%3D&X-Amz-Signature=ee998405de834a59614aa2afb6f2b25241299e201d293401ff568583f35fe92d&X-Amz-SignedHeaders=host&response-content-disposition=inline" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-slate-950/55" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_36%),linear-gradient(to_bottom,rgba(2,6,23,0.25),rgba(2,6,23,0.8))]" />

      <div className="relative z-10 flex min-h-screen items-center px-6 py-12">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center">
            <div className="mb-6 flex items-center gap-3">
              <img
                src={logo || '/logo192.png'}
                alt={name + ' logo'}
                className="h-12 w-12 rounded-2xl border border-white/15 bg-white/10 p-2 shadow-lg backdrop-blur-md"
              />
              <div className="leading-tight">
                <p className="font-glitten text-sm font-semibold uppercase tracking-[0.24em] text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">{name}</p>
                {/* <p className="text-base text-white/85">Coming soon</p> */}
              </div>
            </div>
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium uppercase tracking-[0.2em] text-white/80 backdrop-blur-md">
              <Sparkles className="h-4 w-4" />
              Coming soon
            </div>

            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight md:text-7xl">
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