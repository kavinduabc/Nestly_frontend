import type { PropertyType } from '@/types'

interface PropertyTypeIconProps {
  type: PropertyType
  size?: number
  className?: string
}

export function PropertyTypeIcon({ type, size = 24, className = '' }: PropertyTypeIconProps) {
  if (type === 'house') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-label="House" role="img">
        <path d="M3 10.5L12 3L21 10.5V21H15V15H9V21H3V10.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
        <rect x="9.5" y="15" width="5" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.15" />
      </svg>
    )
  }

  if (type === 'land') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-label="Land" role="img">
        {/* Ground line */}
        <line x1="2" y1="18" x2="22" y2="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        {/* Plot boundary */}
        <rect x="4" y="10" width="12" height="8" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1" />
        {/* Flag pole */}
        <line x1="18" y1="4" x2="18" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        {/* Flag */}
        <path d="M18 4L22 6.5L18 9" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.3" />
      </svg>
    )
  }

  // apartment
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-label="Apartment" role="img">
      {/* Building */}
      <rect x="4" y="3" width="16" height="20" rx="1" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.08" />
      {/* Windows row 1 */}
      <rect x="7" y="6" width="3" height="3" rx="0.5" fill="currentColor" fillOpacity="0.5" />
      <rect x="14" y="6" width="3" height="3" rx="0.5" fill="currentColor" fillOpacity="0.5" />
      {/* Windows row 2 */}
      <rect x="7" y="11" width="3" height="3" rx="0.5" fill="currentColor" fillOpacity="0.5" />
      <rect x="14" y="11" width="3" height="3" rx="0.5" fill="currentColor" fillOpacity="0.5" />
      {/* Door */}
      <rect x="9.5" y="17" width="5" height="6" rx="0.5" fill="currentColor" fillOpacity="0.4" />
    </svg>
  )
}
