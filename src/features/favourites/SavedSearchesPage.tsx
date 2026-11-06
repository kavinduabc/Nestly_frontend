import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Bell, BellOff, Trash2, Search, ExternalLink } from 'lucide-react'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { Skeleton } from '@/components/Skeleton'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useUIStore } from '@/app/uiStore'
import { useState } from 'react'
import frontendData from '@/lib/frontendData'
import type { SavedSearch } from '@/types'
import { formatDate } from '@/lib/formatters'

export function SavedSearchesPage() {
  const { addToast } = useUIStore()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['saved-searches'],
    queryFn: async () => {
      const res = await frontendData.get('/user/saved-searches')
      return res.data as SavedSearch[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await frontendData.delete(`/user/saved-searches/${id}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved-searches'] })
      addToast({ type: 'success', title: 'Search deleted' })
      setDeleteId(null)
    },
  })

  const buildSearchUrl = (filters: SavedSearch['filters']) => {
    const params = new URLSearchParams()
    if (filters.town) params.set('town', filters.town)
    if (filters.type) params.set('type', filters.type)
    if (filters.minPrice) params.set('minPrice', String(filters.minPrice))
    if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice))
    return `/search?${params.toString()}`
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Saved searches</h1>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-card" />)}
        </div>
      ) : data?.length === 0 ? (
        <EmptyState icon={Search} title="No saved searches"
          description="When you search for properties, you'll be able to save your searches here." />
      ) : (
        <div className="space-y-3">
          {data?.map((search) => (
            <div key={search.id} className="bg-white dark:bg-gray-900 rounded-card border border-gray-100 dark:border-gray-800 shadow-card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white">{search.name}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span>Saved {formatDate(search.createdAt)}</span>
                  {search.alertsEnabled && (
                    <span className="flex items-center gap-1 text-primary-600 dark:text-primary-400">
                      <Bell size={11} /> Alerts on
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" leftIcon={<ExternalLink size={13} />}
                  onClick={() => navigate(buildSearchUrl(search.filters))}>
                  View
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(search.id)}
                  aria-label="Delete search">
                  <Trash2 size={15} className="text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}
        title="Delete saved search" description="This cannot be undone."
        confirmLabel="Delete" onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending} />
    </div>
  )
}
