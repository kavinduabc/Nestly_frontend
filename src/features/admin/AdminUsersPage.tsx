import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Badge } from '@/components/Badge'
import { DataTable, type Column } from '@/components/DataTable'
import frontendData from '@/lib/frontendData'
import { formatDate } from '@/lib/formatters'
import type { User } from '@/types'
import { Button } from '@/components/Button'

export function AdminUsersPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await frontendData.get('/admin/users', { params: { limit: 100 } })).data as { data: User[]; total: number },
  })
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: User['status'] }) => frontendData.patch(`/admin/users/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })
  const remove = useMutation({
    mutationFn: (id: string) => frontendData.delete(`/admin/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })
  const columns: Column<User>[] = [
    { key: 'name', header: 'User', render: (row) => <div><p className="font-medium">{row.name}</p><p className="text-xs text-gray-500">{row.email}</p></div> },
    { key: 'role', header: 'Role', render: (row) => <Badge variant="info">{row.role}</Badge> },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={row.status === 'active' ? 'success' : 'danger'}>{row.status}</Badge> },
    { key: 'createdAt', header: 'Joined', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', header: '', render: (row) => <div className="flex items-center justify-end gap-2"><Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: row.id, status: row.status === 'active' ? 'suspended' : 'active' })}>{row.status === 'active' ? 'Suspend' : 'Activate'}</Button>{row.role !== 'admin' && <Button variant="ghost" size="icon" aria-label={`Delete ${row.name}`} onClick={() => remove.mutate(row.id)}>×</Button>}</div> },
  ]
  return <div className="space-y-6"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1><DataTable columns={columns} data={data?.data ?? []} total={data?.total ?? 0} loading={isLoading} getRowId={(row) => row.id} emptyTitle="No users found" /></div>
}
