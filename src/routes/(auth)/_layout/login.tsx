import { createFileRoute, useNavigate } from '@tanstack/react-router'
import React, { useEffect, useState } from 'react'
import { setMetaTitle } from '../../../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { login, type LoginRequest, type LoginResponse } from "@/services/auth"
import { useMutation } from "@tanstack/react-query"
import type { ApiError } from '@/lib/api'
import { toast } from "sonner"
import { Mail, Lock, Smartphone, ArrowRight, Shield } from "lucide-react"
import { useAtom } from 'jotai'
import { userType, userEmail, userFirstName, userLastName, userMobile } from '@/store/auth'

export const Route = createFileRoute('/(auth)/_layout/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [_utype, setUtype] = useAtom<string | null>(userType)
  const [_userMail, setUserMail] = useAtom<string | null>(userEmail)
  const [_firstName, setFirstName] = useAtom<string | null>(userFirstName)
  const [_lastName, setLastName] = useAtom<string | null>(userLastName)
  const [_mobile, setMobile] = useAtom<string | null>(userMobile)
  // Password login states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // OTP login states
  const [otpMethod, setOtpMethod] = useState<'email' | 'mobile'>('email')
  const [otpIdentifier, setOtpIdentifier] = useState('') // email or mobile number
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  
  useEffect(() => {
    setMetaTitle('Login', 'Manage appointments and patients')
  }, [])

  // Timer for OTP resend
  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer(prev => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [otpTimer])

  const {
    mutate: loginMutate,
    isPending: loginIsLoading,
    isError: loginIsError,
  } = useMutation({
    mutationFn: (loginRequest: LoginRequest) => login(loginRequest).then(res => (res.data as any)?.data),
    onMutate: () => {
      setError(null)
      toast.loading("Logging in...", { id: "login-toast", description: "Please wait while we log you in." })
    },
    onSuccess: async (data: LoginResponse) => {
      setUtype(data.user.user_type)
      setUserMail(data.user.email)
      setFirstName(data.user.first_name)
      setLastName(data.user.last_name)
      setMobile(data.user.mobile || '')
      toast.dismiss("login-toast")
      toast.success("Login successful!", {
        duration: 1000,
        richColors: true,
      })
      await navigate({ to: '/dashboard' })
    },
    onError: (error: ApiError) => {
      toast.dismiss("login-toast")
      toast.error(error.message || 'Login failed')
      setError(error.message)
    },
    onSettled: () => {
      toast.dismiss("login-toast")
    },
  })

  // Mock OTP send mutation (replace with your actual API call)
  const {
    mutate: sendOtpMutate,
    isPending: sendOtpLoading,
  } = useMutation({
    mutationFn: async (data: { identifier: string; method: 'email' | 'mobile' }) => {
      // Replace with your actual OTP API call
      // return sendOtp(data)
      console.log('Sending OTP with data:', data)
      return new Promise((resolve) => setTimeout(resolve, 1000))
    },
    onSuccess: () => {
      setOtpSent(true)
      setOtpTimer(60)
      toast.success(`OTP sent to your ${otpMethod}!`, { duration: 3000 })
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to send OTP')
    },
  })

  // Mock OTP verify mutation (replace with your actual API call)
  const {
    mutate: verifyOtpMutate,
    isPending: verifyOtpLoading,
  } = useMutation({
    mutationFn: async (data: { identifier: string; otp: string; method: 'email' | 'mobile' }) => {
      // Replace with your actual OTP verification API call
      //return verifyOtp(data)
      console.log('Verifying OTP with data:', data)
      return new Promise((resolve) => setTimeout(resolve, 1000))
    },
    onSuccess: () => {
      toast.success("Login successful!", { duration: 1000, richColors: true })
      navigate({ to: '/' })
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Invalid OTP')
      setError(error.message)
    },
  })
  
  const handlePasswordLogin = React.useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (loginIsLoading) return

    const loginRequest: LoginRequest = {
      email,
      password,
    }

    loginMutate(loginRequest)
  }, [email, password, loginIsLoading, loginMutate])

  const handleSendOtp = React.useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (sendOtpLoading || otpTimer > 0) return

    if (!otpIdentifier) {
      toast.error(`Please enter your ${otpMethod}`)
      return
    }

    sendOtpMutate({ identifier: otpIdentifier, method: otpMethod })
  }, [otpIdentifier, otpMethod, sendOtpLoading, otpTimer, sendOtpMutate])

  const handleVerifyOtp = React.useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (verifyOtpLoading) return

    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    verifyOtpMutate({ identifier: otpIdentifier, otp, method: otpMethod })
  }, [otp, otpIdentifier, otpMethod, verifyOtpLoading, verifyOtpMutate])

  const handleResendOtp = () => {
    setOtp('')
    setOtpSent(false)
    handleSendOtp()
  }

  return (
    <React.Fragment>
      <Card className="w-full max-w-md shadow-xl border-0 rounded-3xl overflow-hidden bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="space-y-3 text-center pb-6 pt-8 px-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in to access your account
          </p>
        </CardHeader>

        {(loginIsError || error) && (
          <div className="mx-8 mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <CardContent className="space-y-6 px-8 pb-8">
          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger 
                value="password" 
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Lock className="w-4 h-4 mr-2" />
                Password
              </TabsTrigger>
              <TabsTrigger 
                value="otp"
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Mail className="w-4 h-4 mr-2" />
                OTP
              </TabsTrigger>
            </TabsList>

            {/* Password Login */}
            <TabsContent value="password" className="space-y-4 mt-0">
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email"
                      placeholder="you@example.com" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      disabled={loginIsLoading}
                      className="pl-10 h-11 rounded-xl border-muted-foreground/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      disabled={loginIsLoading}
                      className="pl-10 h-11 rounded-xl border-muted-foreground/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded accent-primary cursor-pointer" 
                      disabled={loginIsLoading} 
                    />
                    <span className="text-muted-foreground">Remember me</span>
                  </label>

                  <a className="text-sm text-primary hover:underline cursor-pointer font-medium">
                    Forgot password?
                  </a>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all" 
                  disabled={loginIsLoading}
                >
                  {loginIsLoading ? (
                    'Signing in...'
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* OTP Login */}
            <TabsContent value="otp" className="space-y-4 mt-0">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Login Method</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={otpMethod === 'email' ? 'default' : 'outline'}
                        className={`h-11 rounded-xl ${otpMethod === 'email' ? 'shadow-lg shadow-primary/20' : ''}`}
                        onClick={() => {
                          setOtpMethod('email')
                          setOtpIdentifier('')
                        }}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                      <Button
                        type="button"
                        variant={otpMethod === 'mobile' ? 'default' : 'outline'}
                        className={`h-11 rounded-xl ${otpMethod === 'mobile' ? 'shadow-lg shadow-primary/20' : ''}`}
                        onClick={() => {
                          setOtpMethod('mobile')
                          setOtpIdentifier('')
                        }}
                      >
                        <Smartphone className="w-4 h-4 mr-2" />
                        Mobile
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otp-identifier" className="text-sm font-medium">
                      {otpMethod === 'email' ? 'Email Address' : 'Mobile Number'}
                    </Label>
                    <div className="relative">
                      {otpMethod === 'email' ? (
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      )}
                      <Input 
                        id="otp-identifier"
                        type={otpMethod === 'email' ? 'email' : 'tel'}
                        placeholder={otpMethod === 'email' ? 'you@example.com' : '+1 (555) 000-0000'}
                        value={otpIdentifier}
                        onChange={e => setOtpIdentifier(e.target.value)}
                        disabled={sendOtpLoading}
                        className="pl-10 h-11 rounded-xl border-muted-foreground/20 focus:border-primary"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all" 
                    disabled={sendOtpLoading || otpTimer > 0}
                  >
                    {sendOtpLoading ? 'Sending OTP...' : 'Send OTP'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="text-center space-y-2 py-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      We've sent a 6-digit code to
                    </p>
                    <p className="font-semibold text-sm">{otpIdentifier}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otp-code" className="text-sm font-medium">
                      Enter OTP
                    </Label>
                    <Input 
                      id="otp-code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="000000"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      disabled={verifyOtpLoading}
                      className="text-center text-2xl tracking-widest h-14 rounded-xl border-muted-foreground/20 focus:border-primary font-semibold"
                    />
                  </div>

                  <div className="text-center text-sm">
                    {otpTimer > 0 ? (
                      <p className="text-muted-foreground">
                        Resend OTP in <span className="font-semibold text-primary">{otpTimer}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-primary hover:underline font-medium"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all" 
                    disabled={verifyOtpLoading || otp.length !== 6}
                  >
                    {verifyOtpLoading ? (
                      'Verifying...'
                    ) : (
                      <>
                        Verify & Sign In
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setOtpSent(false)
                      setOtp('')
                      setOtpTimer(0)
                    }}
                  >
                    Change {otpMethod}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>

          {/* Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted-foreground/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground font-medium">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-11 rounded-xl border-muted-foreground/20 hover:bg-muted/50 transition-all" 
              disabled={loginIsLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button 
              variant="outline" 
              className="h-11 rounded-xl border-muted-foreground/20 hover:bg-muted/50 transition-all" 
              disabled={loginIsLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Apple
            </Button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground pt-2">
            Don't have an account?{" "}
            <a className="text-primary hover:underline cursor-pointer font-semibold">
              Sign Up
            </a>
          </p>
        </CardContent>
      </Card>
    </React.Fragment>
  )
}