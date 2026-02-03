import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff, Loader2, Shield, BarChart3, Globe2, Package } from 'lucide-react'

// Elite Cargo Logo Component
function EliteLogo({ className = "w-full h-full" }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 1092.53 789.15" 
      fill="currentColor"
    >
      <path d="M709.37,469.66c-8.09,2.09-11.67,8.48-9.86,18.78,15.97,129.51,96.25,280.45,213.16,244.54,34.86-10.23,73.61-35.76,82.06-83.79.64-3.73.05-5.55-2.87-6.47-5.25-1.5-10.88-.92-16.16-2.15-3.61-1-5.89-3.93-6.58-8.8-2.46-14.19-5.51-38.39,11.18-38.22,33.09-.25,66.17.16,99.26-.07,6.91-.05,11.87,2.77,12.62,13.1.63,2.44.2,5.17.3,7.75,0,.14,0,.28-.02.42-.68,5.56-.75,11.17-.97,16.77,0,.1-.01.21-.02.31-2.11,17.38-23.79,9.81-33.47,11.86-4.52.44-7.68,3.55-9.71,8.95-59.99,162.09-235.21,168.09-325.6,44.74-41.66-58.09-63.34-140.36-74.63-216.51-1.55-13.8-20.68-19.98-23.75-4.58-.03.17-.05.34-.06.51-4.19,97.15.23,195.14-1.35,292.55-1,24.39-28.39,19.28-41.91,19.46-.06,0-.13,0-.19,0-7.91-.48-17.85-6.23-18.25-17.7,0-97.03,1.58-194.11-.24-291.13-.48-6.42-3.37-9.6-8.44-10.03-7.61-.65-27.39-5.91-26.76,12.11,1.41,97.4-.35,194.86.09,292.27,0,.1,0,.2.02.29.58,5.51.02,7.46-4.21,9.18-15.79,6.4-35.09,6.39-51.05.71-.07-.03-.15-.06-.22-.09-4.8-2.19-5.14-2.95-5.1-9.41.51-96.22.35-192.56-.11-288.73,0-.12,0-.24-.02-.36-1.19-10.46-4.97-17.44-15.92-15.33-4.39.85-5.44,14.61-6.4,19.83-8.29,41.16-13.52,76.51-28.28,115-76.8,200.3-291.48,253.28-370.14,48.45-2.83-8.25-7.56-12.11-14.4-12.04-5.84.09-11.68.79-17.53,1.03-8.81.46-12.23-5.52-13.33-14.58-1.5-14.8-.55-34.21,13.47-34.63,7.01-.21,14.3.73,21.33.47,15.1-.55,25.81-.73,41.24-.4,18.02.38,45.86-7.68,44.66,25.66-.27,7.37,1.87,20.19-5.28,22.29-6.57,2.07-10.9,1.2-17.61,2.08-2.94.56-3.45,2.07-2.43,5.63,23.79,77.12,103.34,102.87,161.32,79.83,85.05-33.99,145.42-198.14,138.98-259.58-1.15-10.95-17,8.11-113.11-15.34-99.46-24.27-221.39-76.46-238.37-223.21C13.91-76,462.29-137.5,452.99,424.65c-.2,12.83,14.1,12.58,13.67-.15-.03-106.95,1.33-213.93-.48-320.86-.12-8.29,2.59-14.07,9.03-14.18,10-.17,19.1-.51,28.62-.55,10.33-.03,24.03-3.94,24.1,14.79.37,106.47-1.87,212.93.03,319.39.1,5.44,2.05,9.06,6.32,10.15,6.76,1.58,13.76,1.09,20.61.81,4.35-.04,7.37-3.63,7.38-9.16.16-107.39.47-214.78,1.17-322.17,0-9.91,8.23-15.15,16.35-15.29,10.04-.17,20.17-.07,30.16,1.32,11.88,1.66,9.25,17.38,9.92,27.59,0,.06,0,.13,0,.19-.99,102.06-.13,205.55-.16,307.73-.03,5.01,4.06,5.91,7.94,6.77,7.25,2.42,16.13-1.48,15.68-12.86-.14-21.13-.24-42.28-.02-63.41,0-.06,0-.12,0-.18,5.73-88.97,24.32-181.05,66.87-253.48,130.73-221.54,448.32-40.16,306.42,225.1-.04.07-.08.15-.13.22-63.92,100.07-179.13,132.93-274.81,139.89M991.83,203.05c-.01-53.56-9.26-66.35-25.46-92.13-.06-.1-.13-.2-.2-.28-59.82-73.29-167.09-61.78-215.28,24.71-37.35,68.26-50.91,152.43-56.51,234.01-.83,14.87-2.8,29.7-3.21,44.57,0,.08,0,.16,0,.23.19,7.77,3.48,12.65,9.51,13.66.12.02.24.03.36.03,101.28,1.85,280.92-29.72,290.79-224.63,0-.06,0-.12,0-.18ZM399.51,396.47c0-.07,0-.13,0-.2-2.07-31.67-3.17-65.57-8.12-97.56-8.7-51.16-19.74-102.97-42.75-146.98-.04-.08-.08-.17-.12-.26C296.7,16.12,93.97,35.82,101.52,206.7c4.83,147.08,185.43,219.52,282.22,221.67.08,0,.16,0,.23,0,3.73-.25,7.56-1.04,11.06-2.59,4.01-1.78,4.7-4.22,4.55-8.64-.24-6.88-.06-13.77-.06-20.66Z"/>
    </svg>
  )
}

export default function LoginPage() {
  const { user, login, isLoading } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!username || !password) {
      setError('Please enter username and password')
      return
    }
    
    try {
      await login(username, password)
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    }
  }

  const features = [
    { icon: Package, text: 'Complete AWB management', delay: '0.3s' },
    { icon: Globe2, text: 'Global shipment tracking', delay: '0.4s' },
    { icon: BarChart3, text: 'Advanced analytics & reports', delay: '0.5s' },
    { icon: Shield, text: 'Secure data management', delay: '0.6s' },
  ]
  
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-cargo-dark overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-elite-900/80 via-cargo-dark to-cargo-darker" />
          
          {/* Floating geometric shapes */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute border border-elite-600/10 rounded-2xl animate-float"
                style={{
                  width: `${Math.random() * 150 + 100}px`,
                  height: `${Math.random() * 150 + 100}px`,
                  top: `${Math.random() * 80 + 10}%`,
                  left: `${Math.random() * 80 + 10}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${3 + i * 0.5}s`,
                }}
              />
            ))}
          </div>

          {/* Glowing orbs - Elite Cargo teal */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-elite-600/15 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-elite-700/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        {/* Content */}
        <div className={`relative z-10 flex flex-col justify-center px-16 transition-all duration-700 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
          {/* Elite Cargo Logo */}
          <div className="mb-10">
            <div className="w-48 text-elite-500 animate-pulse-glow rounded-2xl p-2">
              <EliteLogo />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            Air Waybill
            <span className="block text-gradient mt-1">Management Platform</span>
          </h1>
          
          <p className="text-lg text-gray-400 mb-10 max-w-md leading-relaxed">
            Professional cargo documentation system for efficient air freight operations worldwide.
          </p>
          
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`flex items-center gap-4 text-gray-300 transition-all duration-500 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'}`}
                style={{ transitionDelay: feature.delay }}
              >
                <div className="w-10 h-10 rounded-xl bg-elite-600/15 border border-elite-600/30 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-elite-400" />
                </div>
                <span className="text-base">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Stats preview */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { value: '50K+', label: 'AWB Processed' },
              { value: '120+', label: 'Airlines' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, index) => (
              <div 
                key={index} 
                className={`text-center transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                style={{ transitionDelay: `${0.7 + index * 0.1}s` }}
              >
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-cargo-darker relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-elite-900/40 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-elite-800/20 rounded-full blur-[80px]" />
        </div>

        <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-4 mb-8 animate-fade-in-down">
            <div className="w-16 text-elite-500">
              <EliteLogo />
            </div>
            <div>
              <h1 className="font-bold text-xl text-white">Elite Cargo</h1>
              <p className="text-sm text-gray-500">AWB Management</p>
            </div>
          </div>
          
          <div className="glass-card p-8 hover:border-elite-700/30 transition-all duration-500">
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome back
            </h2>
            <p className="text-gray-400 mb-8">
              Sign in to access your dashboard
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-cargo-danger/10 border border-cargo-danger/20 rounded-lg animate-scale-in">
                  <p className="text-sm text-cargo-danger">{error}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field transition-all duration-300 focus:shadow-lg focus:shadow-elite-600/10"
                  placeholder="Enter your username"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-12 transition-all duration-300 focus:shadow-lg focus:shadow-elite-600/10"
                    placeholder="Enter your password"
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1 rounded hover:bg-white/5"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base font-semibold hover:shadow-lg hover:shadow-elite-600/20 transition-all duration-300 hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </form>
            
            <div className="mt-6 p-4 bg-elite-900/30 border border-elite-800/30 rounded-xl">
              <p className="text-xs text-gray-400 text-center font-mono">
                <span className="text-gray-500">Demo:</span> admin / admin123!
              </p>
            </div>
          </div>
          
          <p className="mt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Elite Cargo. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
