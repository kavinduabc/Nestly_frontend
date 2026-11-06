import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Edit, Eye } from 'lucide-react'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Skeleton } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { formatLKR, formatDate } from '@/lib/formatters'
import { useAuthStore } from '@/features/auth/authStore'
import frontendData from '@/lib/frontendData'
import type { Property } from '@/types'

const statusVariant = { pending: 'warning', approved: 'success', rejected: 'danger', unpublished: 'default' } as const

export function SellerListingsPage() {
  const { user } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['seller-listings', user?.id],
    queryFn: async () => {
      const res = await frontendData.get(`/seller/listings?sellerId=${user?.id}`)
      return res.data.data as Property[]
    },
    enabled: !!user,
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Listings</h1>
        <Link to="/seller/listings/new">
          <Button leftIcon={<Plus size={16} />}>New listing</Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-card border border-gray-100 dark:border-gray-800 shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Property</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Views</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Listed</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50">
                  {[1,2,3,4,5,6].map(j => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}
                </tr>
              ))
              : data?.length === 0
                ? <tr><td colSpan={6}><EmptyState title="No listings yet" description="Create your first listing to get started." /></td></tr>
                : data?.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images[0]} alt={p.title} className="w-10 h-8 rounded-lg object-cover" />
                        <span className="font-medium text-gray-900 dark:text-white truncate max-w-48">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{formatLKR(p.price, true)}</td>
                    <td className="px-4 py-3"><Badge variant={statusVariant[p.status] ?? 'default'}>{p.status}</Badge></td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{p.views}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{formatDate(p.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/properties/${p.id}`}>
                          <Button variant="ghost" size="icon" aria-label="View"><Eye size={15} /></Button>
                        </Link>
                        <Link to={`/seller/listings/${p.id}/edit`}>
                          <Button variant="ghost" size="icon" aria-label="Edit"><Edit size={15} /></Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
