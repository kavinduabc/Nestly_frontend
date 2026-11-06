import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Trash2 } from 'lucide-react'
import { DataTable, type Column } from '@/components/DataTable'
import frontendData from '@/lib/frontendData'
import { formatLKR } from '@/lib/formatters'
import type { Property } from '@/types'

const statusVariant = (status: Property['status']) => status === 'approved' ? 'success' : status === 'pending' ? 'warning' : status === 'rejected' ? 'danger' : 'default'

export function AdminListingsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-properties', 'all'],
    queryFn: async () => (await frontendData.get('/admin/properties', { params: { limit: 100 } })).data as { data: Property[]; total: number },
  })
  const remove = useMutation({
    mutationFn: (id: string) => frontendData.delete(`/admin/properties/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-properties'] }),
  })
  const columns: Column<Property>[] = [
    { key: 'title', header: 'Listing', render: (row) => <span className="font-medium">{row.title}</span> },
    { key: 'seller', header: 'Seller', render: (row) => row.sellerName },
    { key: 'type', header: 'Type', render: (row) => row.type },
    { key: 'price', header: 'Price', render: (row) => formatLKR(row.price, true) },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={statusVariant(row.status)}>{row.status}</Badge> },
    { key: 'actions', header: '', render: (row) => <Button variant="ghost" size="icon" aria-label={`Delete ${row.title}`} onClick={() => remove.mutate(row.id)}><Trash2 size={15} className="text-red-500" /></Button> },
  ]
  return <div className="space-y-6"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Listings</h1><DataTable columns={columns} data={data?.data ?? []} total={data?.total ?? 0} loading={isLoading} getRowId={(row) => row.id} emptyTitle="No listings found" /></div>
}
