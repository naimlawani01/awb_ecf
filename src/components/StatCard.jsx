import { useState, useEffect, useRef } from 'react'
import clsx from 'clsx'
import { TrendingUp, TrendingDown } from 'lucide-react'

// Animated counter hook
function useAnimatedNumber(value, duration = 800) {
  const [displayValue, setDisplayValue] = useState(0)
  const prevValue = useRef(0)
  
  useEffect(() => {
    if (typeof value !== 'number') {
      setDisplayValue(value)
      return
    }
    
    const startTime = Date.now()
    const startValue = prevValue.current
    
    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = Math.floor(startValue + (value - startValue) * easeOut)
      
      setDisplayValue(current)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        prevValue.current = value
      }
    }
    
    requestAnimationFrame(animate)
  }, [value, duration])
  
  return displayValue
}

const colorVariants = {
  elite: {
    bg: 'bg-elite-600/15',
    bgHover: 'group-hover:bg-elite-600/25',
    text: 'text-elite-400',
    glow: 'group-hover:shadow-elite-600/20',
    gradient: 'from-elite-600/10 to-transparent',
  },
  accent: {
    bg: 'bg-cargo-accent/15',
    bgHover: 'group-hover:bg-cargo-accent/25',
    text: 'text-cargo-accent',
    glow: 'group-hover:shadow-cargo-accent/20',
    gradient: 'from-cargo-accent/10 to-transparent',
  },
  success: {
    bg: 'bg-cargo-success/15',
    bgHover: 'group-hover:bg-cargo-success/25',
    text: 'text-cargo-success',
    glow: 'group-hover:shadow-cargo-success/20',
    gradient: 'from-cargo-success/10 to-transparent',
  },
  warning: {
    bg: 'bg-cargo-warning/15',
    bgHover: 'group-hover:bg-cargo-warning/25',
    text: 'text-cargo-warning',
    glow: 'group-hover:shadow-cargo-warning/20',
    gradient: 'from-cargo-warning/10 to-transparent',
  },
  danger: {
    bg: 'bg-cargo-danger/15',
    bgHover: 'group-hover:bg-cargo-danger/25',
    text: 'text-cargo-danger',
    glow: 'group-hover:shadow-cargo-danger/20',
    gradient: 'from-cargo-danger/10 to-transparent',
  },
  gold: {
    bg: 'bg-cargo-gold/15',
    bgHover: 'group-hover:bg-cargo-gold/25',
    text: 'text-cargo-gold',
    glow: 'group-hover:shadow-cargo-gold/20',
    gradient: 'from-cargo-gold/10 to-transparent',
  },
  info: {
    bg: 'bg-cargo-info/15',
    bgHover: 'group-hover:bg-cargo-info/25',
    text: 'text-cargo-info',
    glow: 'group-hover:shadow-cargo-info/20',
    gradient: 'from-cargo-info/10 to-transparent',
  },
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'elite',
  className,
}) {
  const isPositiveTrend = trend === 'up'
  const animatedValue = useAnimatedNumber(typeof value === 'number' ? value : 0)
  const colors = colorVariants[color] || colorVariants.elite
  
  return (
    <div className={clsx(
      'stat-card group cursor-default transition-all duration-300',
      'hover:-translate-y-1 hover:shadow-xl',
      colors.glow,
      className
    )}>
      {/* Gradient overlay */}
      <div className={clsx(
        'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl',
        colors.gradient
      )} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={clsx(
            'p-3 rounded-xl transition-all duration-300',
            colors.bg,
            colors.bgHover,
            colors.text
          )}>
            <Icon className="w-6 h-6" />
          </div>
          
          {trendValue !== undefined && trendValue !== null && (
            <div
              className={clsx(
                'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold',
                isPositiveTrend
                  ? 'bg-cargo-success/15 text-cargo-success'
                  : 'bg-cargo-danger/15 text-cargo-danger'
              )}
            >
              {isPositiveTrend ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{Math.abs(trendValue).toFixed(1)}%</span>
            </div>
          )}
        </div>
        
        <div>
          <p className="text-3xl font-bold text-white mb-1 stat-number">
            {typeof value === 'number' ? animatedValue.toLocaleString() : value}
          </p>
          <p className="text-sm text-gray-400 font-medium">{title}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1.5">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}
