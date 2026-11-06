import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import { formatRelativeTime } from '@/lib/formatters'
import { useUIStore } from '@/app/uiStore'
import frontendData from '@/lib/frontendData'
import type { Inquiry } from '@/types'
import { cn } from '@/lib/utils'

export function SellerInquiriesPage() {
  const { addToast } = useUIStore()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['seller-inquiries'],
    queryFn: async () => {
      const res = await frontendData.get('/seller/inquiries')
      return res.data as Inquiry[]
    },
  })

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await frontendData.patch(`/seller/inquiries/${id}/read`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seller-inquiries'] })
    },
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Inquiries</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-card" />)}
        </div>
      ) : data?.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No inquiries yet" description="When buyers contact you about your listings, they'll appear here." />
      ) : (
        <div className="space-y-3">
          {data?.map((inq) => (
            <div key={inq.id}
              className={cn('bg-white dark:bg-gray-900 rounded-card border shadow-card p-5 transition-colors',
                !inq.isRead ? 'border-primary-200 dark:border-primary-800' : 'border-gray-100 dark:border-gray-800')}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {!inq.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" aria-label="Unread" />}
                    <p className="font-semibold text-gray-900 dark:text-white">{inq.buyerName}</p>
                    <span className="text-xs text-gray-400">{inq.buyerPhone}</span>
                    <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
                    <span className="text-xs text-gray-400">{formatRelativeTime(inq.createdAt)}</span>
                  </div>
                  <p className="text-xs text-primary-600 dark:text-primary-400 mb-2">Re: {inq.propertyTitle}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{inq.message}</p>
                </div>
                {!inq.isRead && (
                  <Button variant="outline" size="sm" onClick={() => markReadMutation.mutate(inq.id)}>
                    Mark read
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
