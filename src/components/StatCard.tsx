import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon?: LucideIcon
  iconColor?: string
  className?: string
}

export function StatCard({ title, value, change, icon: Icon, iconColor = 'text-primary-600', className }: StatCardProps) {
  const isPositive = (change ?? 0) > 0
  const isNeutral = change === 0 || change === undefined

  return (
    <div className={cn('bg-white dark:bg-gray-900 rounded-card border border-gray-100 dark:border-gray-800 p-5 shadow-card', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {change !== undefined && (
            <div className={cn('flex items-center gap-1 mt-2 text-xs font-medium', isPositive ? 'text-emerald-600' : isNeutral ? 'text-gray-400' : 'text-red-500')}>
              {isNeutral ? <Minus size={12} aria-hidden /> : isPositive ? <TrendingUp size={12} aria-hidden /> : <TrendingDown size={12} aria-hidden />}
              <span>{Math.abs(change)}% vs last month</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center flex-shrink-0 ml-3">
            <Icon size={22} className={iconColor} aria-hidden />
          </div>
        )}
      </div>
    </div>
  )
}
