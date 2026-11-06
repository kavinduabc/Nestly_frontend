import { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { MapPin, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, AlertTriangle, List, Map as MapIcon, Clock } from 'lucide-react'
import { Button } from '@/components/Button'
import { PropertyCard } from '@/components/PropertyCard'
import { Skeleton } from '@/components/Skeleton'
import { PropertyTypeIcon } from '@/components/PropertyTypeIcon'
import { formatLKR, formatDistance } from '@/lib/formatters'
import { sriLankaTowns } from '@/mocks/data/areas'
import frontendData from '@/lib/frontendData'
import type { RecommendResponse, RecommendArea, PropertyType } from '@/types'
import { cn } from '@/lib/utils'

const TYPES: { type: PropertyType; label: string }[] = [
  { type: 'house', label: 'House' }, { type: 'land', label: 'Land' }, { type: 'apartment', label: 'Apartment' }
]

const trendIcon = { rising: TrendingUp, stable: Minus, falling: TrendingDown }
const trendColor = { rising: 'text-emerald-600', stable: 'text-blue-500', falling: 'text-red-500' }

function CircularScore({ score }: { score: number }) {
  const r = 20, circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 70 ? '#0F6E56' : score >= 40 ? '#EF9F27' : '#EF4444'
  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48" aria-hidden>
        <circle cx="24" cy="24" r={r} stroke="#e5e7eb" strokeWidth="4" fill="none" />
        <circle cx="24" cy="24" r={r} stroke={color} strokeWidth="4" fill="none"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color }}>{score}</span>
    </div>
  )
}

export function RecommendPage() {
  const [searchParams] = useSearchParams()
  const [town, setTown] = useState(searchParams.get('town') || '')
  const [budget, setBudget] = useState(Number(searchParams.get('budget') || 15000000))
  const [budgetInput, setBudgetInput] = useState(String(searchParams.get('budget') || '15000000'))
  const [selectedType, setSelectedType] = useState<PropertyType | ''>(searchParams.get('type') as PropertyType || '')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSugg, setShowSugg] = useState(false)
  const [expandedArea, setExpandedArea] = useState<string | null>(null)
  const [hoveredArea, setHoveredArea] = useState<string | null>(null)
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list')
  const [rateLimited, setRateLimited] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await frontendData.post('/recommend', { town, budget, type: selectedType || undefined })
      return res.data as RecommendResponse
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status: number } })?.response?.status
      if (status === 429) {
        setRateLimited(true)
        let s = 30
        setCooldown(s)
        const t = setInterval(() => { s--; setCooldown(s); if (s <= 0) { clearInterval(t); setRateLimited(false) } }, 1000)
      }
    }
  })

  useEffect(() => {
    if (town.length > 1) {
      setSuggestions(sriLankaTowns.filter(t => t.toLowerCase().startsWith(town.toLowerCase())).slice(0, 6))
      setShowSugg(true)
    } else setShowSugg(false)
  }, [town])

  // Auto-submit if URL params present
  useEffect(() => {
    if (searchParams.get('town') && searchParams.get('budget')) mutation.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!town || rateLimited) return
    mutation.mutate()
  }

  const scrollToCard = useCallback((areaName: string) => {
    const el = cardRefs.current[areaName]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  const data = mutation.data
  const isDegraded = data?.degraded

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Smart area recommendations</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Enter your budget and target town to get AI-ranked area suggestions with live listings.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-card border border-gray-100 dark:border-gray-800 shadow-card p-5 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Town */}
          <div className="relative">
            <label htmlFor="rec-town" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Target town</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input id="rec-town" type="text" value={town} onChange={e => setTown(e.target.value)}
                onFocus={() => town.length > 1 && setShowSugg(true)} onBlur={() => setTimeout(() => setShowSugg(false), 150)}
                placeholder="e.g. Negombo" required
                className="w-full pl-9 pr-3 h-10 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            {showSugg && suggestions.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-20 py-1">
                {suggestions.map(s => (
                  <button key={s} type="button" onMouseDown={() => { setTown(s); setShowSugg(false) }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-950">{s}</button>
                ))}
              </div>
            )}
          </div>

          {/* Budget */}
          <div>
            <label htmlFor="rec-budget" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Budget</label>
            <input id="rec-budget" type="number" value={budgetInput}
              onChange={e => { setBudgetInput(e.target.value); setBudget(Number(e.target.value)) }}
              min={1000000} step={500000} placeholder="15000000"
              className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {budget > 0 && <p className="text-xs text-gray-400 mt-1">{formatLKR(budget)}</p>}
            <input type="range" min={1000000} max={200000000} step={500000} value={budget}
              onChange={e => { setBudget(Number(e.target.value)); setBudgetInput(String(e.target.value)) }}
              className="w-full mt-1 accent-primary-600" aria-label="Budget slider" />
          </div>

          {/* Type + Submit */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Property type (optional)</p>
            <div className="flex gap-1.5 mb-2">
              {TYPES.map(({ type, label }) => (
                <button key={type} type="button" onClick={() => setSelectedType(selectedType === type ? '' : type)}
                  className={cn('flex-1 flex flex-col items-center py-1 rounded-lg border text-xs font-medium transition-all',
                    selectedType === type ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400')}
                  aria-pressed={selectedType === type}>
                  <PropertyTypeIcon type={type} size={14} />{label}
                </button>
              ))}
            </div>
            <Button type="submit" className="w-full" size="md"
              loading={mutation.isPending} disabled={!town || rateLimited}>
              {rateLimited ? <><Clock size={14} /> Wait {cooldown}s</> : 'Find places'}
            </Button>
          </div>
        </div>
      </form>

      {/* Degraded banner */}
      {isDegraded && (
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-card p-3 mb-6 text-sm text-amber-800 dark:text-amber-200">
          <AlertTriangle size={16} className="flex-shrink-0" />
          Smart ranking is temporarily unavailable. Showing standard results.
        </div>
      )}

      {/* Error */}
      {mutation.isError && !rateLimited && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 rounded-card p-4 mb-6 text-sm text-red-700 dark:text-red-300">
          Failed to get recommendations. Please try again.
        </div>
      )}

      {/* Results */}
      {(mutation.isPending || mutation.data) && (
        <>
          {/* Mobile toggle */}
          <div className="flex md:hidden gap-2 mb-4">
            <Button variant={mobileView === 'list' ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => setMobileView('list')} leftIcon={<List size={14} />}>List</Button>
            <Button variant={mobileView === 'map' ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => setMobileView('map')} leftIcon={<MapIcon size={14} />}>Map</Button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Results list */}
            <div className={cn('flex-1 space-y-4', mobileView === 'map' ? 'hidden md:block' : '')}>
              {/* Model version */}
              {data?.modelVersion && (
                <p className="text-xs text-gray-400 dark:text-gray-500">Model: {data.modelVersion} · Estimates are guidance, not financial advice.</p>
              )}

              {mutation.isPending
                ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 rounded-card border border-gray-100 dark:border-gray-800 p-5">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-14 h-14 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    </div>
                  </div>
                ))
                : data?.areas.map((area) => <AreaCard key={area.areaName} area={area} isDegraded={isDegraded}
                    expanded={expandedArea === area.areaName} onToggle={() => setExpandedArea(expandedArea === area.areaName ? null : area.areaName)}
                    hovered={hoveredArea === area.areaName} onHover={setHoveredArea}
                    ref={(el) => { cardRefs.current[area.areaName] = el }} />)
              }
            </div>

            {/* Map placeholder */}
            <div className={cn('md:w-96 h-[480px] bg-gray-100 dark:bg-gray-800 rounded-card border border-gray-200 dark:border-gray-700 flex items-center justify-center sticky top-20 self-start', mobileView === 'list' ? 'hidden md:flex' : '')}>
              <div className="text-center p-4">
                <MapPin size={32} className="text-primary-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Interactive map</p>
                {data && (
                  <div className="mt-3 text-xs text-gray-500 space-y-1">
                    <p className="font-semibold text-gray-700 dark:text-gray-200">📍 {data.targetTown}</p>
                    {data.areas.slice(0, 4).map((a) => (
                      <button key={a.areaName} onClick={() => scrollToCard(a.areaName)}
                        className={cn('block w-full text-left px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors', hoveredArea === a.areaName && 'bg-primary-50 dark:bg-primary-950 text-primary-700')}>
                        {a.rank}. {a.areaName} {a.score !== null ? `(${a.score})` : ''}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface AreaCardProps {
  area: RecommendArea
  isDegraded?: boolean
  expanded: boolean
  onToggle: () => void
  hovered: boolean
  onHover: (name: string | null) => void
}

const AreaCard = ({ area, isDegraded, expanded, onToggle, hovered, onHover }: AreaCardProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const TrendIcon = area.trend ? trendIcon[area.trend] : Minus
  return (
    <div
      className={cn('bg-white dark:bg-gray-900 rounded-card border shadow-card transition-all', hovered ? 'border-primary-400 shadow-card-hover' : 'border-gray-100 dark:border-gray-800')}
      onMouseEnter={() => onHover(area.areaName)} onMouseLeave={() => onHover(null)}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Rank badge */}
          <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-primary-700 dark:text-primary-300">#{area.rank}</span>
          </div>

          {/* Score circle */}
          {!isDegraded && area.score !== null && <CircularScore score={area.score} />}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-900 dark:text-white">{area.areaName}</h3>
              {!isDegraded && area.trend && (
                <span className={cn('flex items-center gap-1 text-xs font-medium', trendColor[area.trend])}>
                  <TrendIcon size={13} />{area.trend}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{area.explanation}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1"><MapPin size={11} />{area.distance} km away</span>
              <span>{area.listingCount} listing{area.listingCount !== 1 ? 's' : ''}</span>
              <span>{formatLKR(area.avgPrice, true)}/perch avg</span>
            </div>
          </div>

          {/* Toggle button */}
          {area.listingCount > 0 && (
            <button onClick={onToggle}
              className="flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded flex-shrink-0"
              aria-expanded={expanded}>
              {expanded ? <><ChevronUp size={14} /> Hide</> : <><ChevronDown size={14} /> View {area.listingCount}</>}
            </button>
          )}
        </div>
      </div>

      {/* Expanded listings */}
      {expanded && area.listings.length > 0 && (
        <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-800 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {area.listings.slice(0, 4).map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}
