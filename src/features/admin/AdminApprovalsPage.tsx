import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, X } from 'lucide-react'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import frontendData from '@/lib/frontendData'
import { formatDate, formatLKR } from '@/lib/formatters'
import type { Property } from '@/types'

export function AdminApprovalsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-properties', 'pending'],
    queryFn: async () => {
      const response = await frontendData.get('/admin/properties', { params: { status: 'pending', limit: 50 } })
      return response.data.data as Property[]
    },
  })
  const review = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'reject' }) =>
      frontendData.patch(`/admin/properties/${id}/approve`, { action }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-properties'] }),
  })

  const properties = data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Approvals</h1>
        <p className="mt-1 text-sm text-gray-500">Review listings waiting to be published.</p>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-card border border-gray-100 dark:border-gray-800 shadow-card overflow-hidden">
        {isLoading ? <div className="p-6 space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div> : properties.length === 0 ? (
          <EmptyState title="No pending approvals" description="New listing submissions will appear here." />
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {properties.map((property) => (
              <div key={property.id} className="p-5 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-56">
                  <h2 className="font-semibold text-gray-900 dark:text-white">{property.title}</h2>
                  <p className="text-sm text-gray-500">{property.town} · {property.sellerName} · {formatDate(property.createdAt)}</p>
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{formatLKR(property.price, true)}</div>
                <Badge variant="warning">Pending</Badge>
                <div className="flex gap-2">
                  <Button size="sm" leftIcon={<Check size={15} />} onClick={() => review.mutate({ id: property.id, action: 'approve' })} loading={review.isPending}>Approve</Button>
                  <Button size="sm" variant="destructive" leftIcon={<X size={15} />} onClick={() => review.mutate({ id: property.id, action: 'reject' })} disabled={review.isPending}>Reject</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
