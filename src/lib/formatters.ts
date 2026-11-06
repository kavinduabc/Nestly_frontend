// Format Sri Lankan Rupees
export function formatLKR(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 1_000_000) return `LKR ${(amount / 1_000_000).toFixed(1)}M`
    if (amount >= 1_000) return `LKR ${(amount / 1_000).toFixed(0)}K`
  }
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format perches (Sri Lankan land unit)
export function formatPerches(perches: number): string {
  if (perches >= 160) {
    const acres = (perches / 160).toFixed(2)
    return `${acres} acres`
  }
  return `${perches} ${perches === 1 ? 'perch' : 'perches'}`
}

// Format square feet
export function formatSqft(sqft: number): string {
  return `${sqft.toLocaleString()} sq ft`
}

// Format date
export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateStr))
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 30) return formatDate(dateStr)
  if (diffDays > 0) return `${diffDays}d ago`
  if (diffHours > 0) return `${diffHours}h ago`
  if (diffMins > 0) return `${diffMins}m ago`
  return 'just now'
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`
  return `${km.toFixed(1)} km`
}
