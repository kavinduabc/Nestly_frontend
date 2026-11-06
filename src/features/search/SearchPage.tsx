import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LayoutGrid, Map, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/Button'
import { PropertyCard } from '@/components/PropertyCard'
import { PropertyCardSkeleton, Skeleton } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { PropertyTypeIcon } from '@/components/PropertyTypeIcon'
import { Badge } from '@/components/Badge'
import { formatLKR } from '@/lib/formatters'
import frontendData from '@/lib/frontendData'
import type { Property, PropertyType } from '@/types'
import { cn } from '@/lib/utils'
import { sriLankaTowns } from '@/mocks/data/areas'

const PROPERTY_TYPES: PropertyType[] = ['house', 'land', 'apartment']
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
]

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [view, setView] = useState<'grid' | 'map'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const town = searchParams.get('town') || ''
  const type = (searchParams.get('type') || '') as PropertyType | ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const sort = searchParams.get('sort') || 'newest'
  const page = Number(searchParams.get('page') || '1')

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.set('page', '1')
    setSearchParams(next)
  }

  const activeFilterCount = [town, type, minPrice, maxPrice].filter(Boolean).length

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['properties', { town, type, minPrice, maxPrice, sort, page }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (town) params.set('town', town)
      if (type) params.set('type', type)
      if (minPrice) params.set('minPrice', minPrice)
      if (maxPrice) params.set('maxPrice', maxPrice)
      params.set('sort', sort)
      params.set('page', String(page))
      params.set('limit', '12')
      const res = await frontendData.get(`/properties?${params}`)
      return res.data as { data: Property[]; total: number; totalPages: number }
    },
    placeholderData: (prev) => prev,
  })

  const clearFilters = () => setSearchParams(new URLSearchParams())

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {town ? `Properties in ${town}` : 'All properties'}
          </h1>
          {data && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {data.total} listing{data.total !== 1 ? 's' : ''} found
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<SlidersHorizontal size={15} />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <div className="flex border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={cn('p-2', view === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800')}
              aria-label="Grid view" aria-pressed={view === 'grid'}
            ><LayoutGrid size={16} /></button>
            <button
              onClick={() => setView('map')}
              className={cn('p-2', view === 'map' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800')}
              aria-label="Map view" aria-pressed={view === 'map'}
            ><Map size={16} /></button>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-card p-4 mb-6 shadow-card">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Town</label>
              <select
                value={town}
                onChange={(e) => setParam('town', e.target.value)}
                className="w-full h-9 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Filter by town"
              >
                <option value="">All towns</option>
                {sriLankaTowns.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Min price</label>
              <input
                type="number" value={minPrice} onChange={(e) => setParam('minPrice', e.target.value)}
                placeholder="LKR 0"
                className="w-full h-9 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Max price</label>
              <input
                type="number" value={maxPrice} onChange={(e) => setParam('maxPrice', e.target.value)}
                placeholder="No limit"
                className="w-full h-9 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Sort</label>
              <select
                value={sort} onChange={(e) => setParam('sort', e.target.value)}
                className="w-full h-9 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Sort results"
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Type:</p>
            <div className="flex gap-2">
              {PROPERTY_TYPES.map((t) => (
                <button key={t} onClick={() => setParam('type', type === t ? '' : t)}
                  className={cn('flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-medium transition-all', type === t ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300')}
                  aria-pressed={type === t}
                >
                  <PropertyTypeIcon type={t} size={14} />
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="ml-auto flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                <X size={12} /> Clear all
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active filter badges */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {town && <Badge variant="primary">{town} <button onClick={() => setParam('town', '')} className="ml-1" aria-label="Remove town filter">×</button></Badge>}
          {type && <Badge variant="primary">{type} <button onClick={() => setParam('type', '')} className="ml-1" aria-label="Remove type filter">×</button></Badge>}
          {minPrice && <Badge variant="primary">Min: {formatLKR(Number(minPrice), true)} <button onClick={() => setParam('minPrice', '')} className="ml-1" aria-label="Remove min price">×</button></Badge>}
          {maxPrice && <Badge variant="primary">Max: {formatLKR(Number(maxPrice), true)} <button onClick={() => setParam('maxPrice', '')} className="ml-1" aria-label="Remove max price">×</button></Badge>}
          <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">Clear all</button>
        </div>
      )}

      {/* Results */}
      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <>
          {view === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoading
                ? Array.from({ length: 12 }).map((_, i) => <PropertyCardSkeleton key={i} />)
                : data?.data.length === 0
                  ? <div className="col-span-full"><EmptyState title="No properties found" description="Try adjusting your filters." /></div>
                  : data?.data.map((p) => <PropertyCard key={p.id} property={p} />)
              }
            </div>
          )}

          {/* Pagination */}
          {!isLoading && data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setParam('page', String(page - 1))}>Previous</Button>
              <span className="text-sm text-gray-500">Page {page} of {data.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setParam('page', String(page + 1))}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
