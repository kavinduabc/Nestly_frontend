import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { DataTable, type Column } from '@/components/DataTable'
import frontendData from '@/lib/frontendData'
import { formatRelativeTime } from '@/lib/formatters'
import type { Inquiry } from '@/types'

export function AdminInquiriesPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-inquiries'],
    queryFn: async () => (await frontendData.get('/admin/inquiries', { params: { limit: 100 } })).data as { data: Inquiry[]; total: number },
  })
  const markSpam = useMutation({
    mutationFn: (id: string) => frontendData.patch(`/admin/inquiries/${id}/spam`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-inquiries'] }),
  })
  const columns: Column<Inquiry>[] = [
    { key: 'buyer', header: 'Buyer', render: (row) => <span className="font-medium">{row.buyerName}</span> },
    { key: 'property', header: 'Property', render: (row) => row.propertyTitle },
    { key: 'message', header: 'Message', render: (row) => <span className="line-clamp-1 max-w-xs">{row.message}</span> },
    { key: 'createdAt', header: 'Received', render: (row) => formatRelativeTime(row.createdAt) },
    { key: 'status', header: 'Status', render: (row) => row.isSpam ? <Badge variant="danger">Spam</Badge> : <Badge variant="success">Normal</Badge> },
    { key: 'actions', header: '', render: (row) => !row.isSpam && <Button size="sm" variant="ghost" onClick={() => markSpam.mutate(row.id)}>Mark spam</Button> },
  ]
  return <div className="space-y-6"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inquiries</h1><DataTable columns={columns} data={data?.data ?? []} total={data?.total ?? 0} loading={isLoading} getRowId={(row) => row.id} emptyTitle="No inquiries found" /></div>
}
