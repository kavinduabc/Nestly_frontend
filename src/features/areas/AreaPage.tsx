import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapPin, TrendingUp, TrendingDown, Minus, ArrowLeft } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Skeleton } from '@/components/Skeleton'
import { PropertyCard } from '@/components/PropertyCard'
import { formatLKR } from '@/lib/formatters'
import frontendData from '@/lib/frontendData'
import { mockAreas } from '@/mocks/data/areas'

export function AreaPage() {
  const { town } = useParams<{ town: string }>()
  const area = mockAreas.find(a => a.name.toLowerCase() === town?.toLowerCase())

  const { data: trend, isLoading } = useQuery({
    queryKey: ['area-trend', town],
    queryFn: async () => {
      const res = await frontendData.get(`/areas/${town}/trend`)
      return res.data as { month: string; avgPrice: number; listingCount: number }[]
    },
    enabled: !!town,
  })

  const { data: properties } = useQuery({
    queryKey: ['properties-by-area', town],
    queryFn: async () => {
      const res = await frontendData.get(`/properties?town=${town}&limit=6`)
      return res.data.data
    },
    enabled: !!town,
  })

  const trendIcon = area?.trend === 'rising' ? TrendingUp : area?.trend === 'falling' ? TrendingDown : Minus
  const trendColor = area?.trend === 'rising' ? 'text-emerald-600' : area?.trend === 'falling' ? 'text-red-500' : 'text-blue-500'
  const TrendIcon = trendIcon

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/search" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 mb-6">
        <ArrowLeft size={16} /> Back to search
      </Link>

      {area ? (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center">
              <MapPin size={22} className="text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{area.name}</h1>
              <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
                <TrendIcon size={14} /> {area.trend} market
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-card border border-gray-100 dark:border-gray-800 p-4 text-center shadow-card">
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg price / perch</p>
              <p className="text-xl font-bold text-primary-600 dark:text-primary-400 mt-1">{formatLKR(area.avgPricePerPerch, true)}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-card border border-gray-100 dark:border-gray-800 p-4 text-center shadow-card">
              <p className="text-xs text-gray-500 dark:text-gray-400">Active listings</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{area.listingCount}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-card border border-gray-100 dark:border-gray-800 p-4 text-center shadow-card">
              <p className="text-xs text-gray-500 dark:text-gray-400">Market trend</p>
              <p className={`text-xl font-bold mt-1 capitalize ${trendColor}`}>{area.trend}</p>
            </div>
          </div>

          {/* Price trend chart */}
          <div className="bg-white dark:bg-gray-900 rounded-card border border-gray-100 dark:border-gray-800 shadow-card p-5 mb-8">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Price trend (last 12 months)</h2>
            {isLoading ? <Skeleton className="h-48 w-full" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => formatLKR(v, true)} tick={{ fontSize: 11 }} width={70} />
                  <Tooltip formatter={(v) => formatLKR(Number(v ?? 0))} />
                  <Line type="monotone" dataKey="avgPrice" stroke="#0F6E56" strokeWidth={2} dot={false} name="Avg price/perch" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Listings */}
          {properties && properties.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Properties in {area.name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((p: import('@/types').Property) => <PropertyCard key={p.id} property={p} />)}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-gray-500">Area not found.</div>
      )}
    </div>
  )
}
