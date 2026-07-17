import { createFileRoute } from '@tanstack/react-router'
import { MapPin, ShieldCheck, Sparkles } from 'lucide-react'

export const Route = createFileRoute('/(public)/coming-soon')({
  component: ComingSoonPage,
  head: () => ({
    title: 'Coming Soon',
    meta: [
      {
        name: 'description',
        content: 'A new homestay experience is launching soon. Join the waitlist for early access.',
      },
    ],
  }),
})

function ComingSoonPage() {
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
        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-slate-950/55" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_36%),linear-gradient(to_bottom,rgba(2,6,23,0.25),rgba(2,6,23,0.8))]" />

      <div className="relative z-10 flex min-h-screen items-center px-6 py-12">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center">
            <div className="mb-6 flex items-center gap-3">
              <img
                src="/logo192.png"
                alt="Homestay logo"
                className="h-12 w-12 rounded-2xl border border-white/15 bg-white/10 p-2 shadow-lg backdrop-blur-md"
              />
              <div className="leading-tight">
                <p className="font-glitten text-lg text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
                  Homestay
                </p>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
                  Coming soon
                </p>
              </div>
            </div>

            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium uppercase tracking-[0.2em] text-white/80 backdrop-blur-md">
              <Sparkles className="h-4 w-4" />
              Coming soon
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
