import { TrendingDown, Minus, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatLKR } from '@/lib/formatters'
import type { PriceBadge as PriceBadgeType } from '@/types'

interface PriceBadgeProps {
  badge: PriceBadgeType
  fairMin?: number
  fairMax?: number
  className?: string
  showTooltip?: boolean
}

const badgeConfig = {
  below_market: {
    label: 'Below market',
    icon: TrendingDown,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  },
  fair: {
    label: 'Fair price',
    icon: Minus,
    className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  },
  above_market: {
    label: 'Above market',
    icon: TrendingUp,
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  },
}

export function PriceBadge({ badge, fairMin, fairMax, className, showTooltip = true }: PriceBadgeProps) {
  const config = badgeConfig[badge]
  const Icon = config.icon

  const content = (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      <Icon size={11} aria-hidden />
      <span>{config.label}</span>
    </span>
  )

  if (!showTooltip || !fairMin || !fairMax) return content

  return (
    <span className="group relative inline-block">
      {content}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity z-50 text-center shadow-lg">
        Estimated fair range: {formatLKR(fairMin)} – {formatLKR(fairMax)}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </span>
    </span>
  )
}
