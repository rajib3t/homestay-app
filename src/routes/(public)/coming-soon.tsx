import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Bell, ArrowRight, Instagram, Twitter, Facebook, Mail } from 'lucide-react'

export const Route = createFileRoute('/(public)/coming-soon')({
  component: ComingSoonPage,
  head: () => ({
    title: 'Coming Soon',
    meta: [
      { name: 'description', content: 'Our new homestay experience is coming soon. Sign up for updates!' }
    ]
  })
})

function ComingSoonPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setEmail('')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-12 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium text-slate-300 tracking-wide uppercase">We're brewing something special</span>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-6 tracking-tight">
          Redefining Your <br className="hidden md:block" /> 
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">Homestay Experience</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
          We are building the ultimate platform to find, book, and enjoy unique homestays around the world. Be the first to know when we launch and get exclusive early-bird perks.
        </p>

        {/* Newsletter Form */}
        <div className="w-full max-w-md mx-auto mb-16">
          {submitted ? (
            <div className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md animate-in fade-in zoom-in duration-500">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">You're on the list!</h3>
              <p className="text-slate-400">We'll notify you as soon as we launch.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl md:rounded-l-xl md:rounded-r-none text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all backdrop-blur-sm"
                />
              </div>
              <button
                type="submit"
                className="group flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl md:rounded-r-xl md:rounded-l-none hover:bg-slate-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Notify Me
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}
        </div>

        {/* Footer / Socials */}
        <div className="flex items-center gap-6 mt-auto">
          <a href="#" className="p-3 rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all hover:-translate-y-1">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="#" className="p-3 rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all hover:-translate-y-1">
            <Twitter className="w-5 h-5" />
          </a>
          <a href="#" className="p-3 rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all hover:-translate-y-1">
            <Facebook className="w-5 h-5" />
          </a>
        </div>
      </div>
      
      {/* Custom Keyframes for Animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
