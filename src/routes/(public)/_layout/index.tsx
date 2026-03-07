import SearchBar from '@/public/home/search'
import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import PropertyCard from '@/public/home/property-card'

export const Route = createFileRoute('/(public)/_layout/')({
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
  return (
    <React.Fragment>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute top-40 left-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 z-10">
              <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                Trusted by 10,000+ travelers
              </div>
              
              <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Find your next
                </span>
                <br />
                <span className="text-gray-900">perfect stay</span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                Discover handpicked homestays with authentic local character, 
                verified hosts, and completely transparent pricing.
              </p>

              {/* Search Bar */}
              <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 p-6 border border-gray-100">
                <SearchBar />
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Verified Homes</div>
                </div>
                <div className="w-px h-12 bg-gray-200" />
                <div>
                  <div className="text-3xl font-bold text-gray-900">4.9★</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="w-px h-12 bg-gray-200" />
                <div>
                  <div className="text-3xl font-bold text-gray-900">24/7</div>
                  <div className="text-sm text-gray-600">Support</div>
                </div>
              </div>
            </div>

            {/* Right Content - Image Grid */}
            <div className="relative z-10">
              <div className="grid grid-cols-2 gap-4">
                {/* Large featured image */}
                <div className="col-span-2 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-200/50 group">
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src="modern-villa.jpg"
                      alt="Modern villa"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm mb-2">
                        <span>⭐</span> Featured
                      </div>
                      <div className="text-2xl font-bold">Seaside Villa</div>
                      <div className="text-lg opacity-90">From ₹3,200 / night</div>
                    </div>
                  </div>
                </div>

                {/* Two smaller images */}
                <div className="rounded-2xl overflow-hidden shadow-lg group">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src="cozy-cottage.jpg"
                      alt="Cozy cottage"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 text-white text-sm font-medium">
                      Mountain Retreat
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden shadow-lg group">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src="beach-house.jpg"
                      alt="Beach house"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 text-white text-sm font-medium">
                      Beach Bungalow
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6 max-w-xs border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    ✓
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Instant Booking</div>
                    <div className="text-sm text-gray-600">Confirm in seconds</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section id="popular" className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Popular Homestays</h2>
            <p className="text-gray-600">Handpicked favorites from our community</p>
          </div>
          <a 
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium group" 
            href="/listings"
          >
            View all
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <PropertyCard />
          <PropertyCard />
          <PropertyCard />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gradient-to-br from-gray-50 to-indigo-50/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why choose us?</h2>
            <p className="text-gray-600 text-lg">Everything you need for the perfect stay</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">✓</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Verified Stays</h3>
              <p className="text-gray-600 leading-relaxed">
                Every property is personally inspected and verified for quality, safety, and comfort
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">₹</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Best Prices</h3>
              <p className="text-gray-600 leading-relaxed">
                100% transparent pricing with no hidden fees or surprise charges
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">24/7 Support</h3>
              <p className="text-gray-600 leading-relaxed">
                Our dedicated team is always available to help you before, during, and after your stay
              </p>
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  )
}