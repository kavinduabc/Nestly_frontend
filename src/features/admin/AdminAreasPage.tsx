import { useQuery } from '@tanstack/react-query'
import { DataTable, type Column } from '@/components/DataTable'
import frontendData from '@/lib/frontendData'
import { formatLKR } from '@/lib/formatters'
import type { Area } from '@/types'

export function AdminAreasPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-areas'],
    queryFn: async () => (await frontendData.get('/admin/areas')).data as { data: Area[]; total: number },
  })
  const columns: Column<Area>[] = [
    { key: 'name', header: 'Area', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'listings', header: 'Listings', render: (row) => row.listingCount },
    { key: 'price', header: 'Average price / perch', render: (row) => formatLKR(row.avgPricePerPerch, true) },
    { key: 'trend', header: 'Trend', render: (row) => row.trend },
  ]
  return <div className="space-y-6"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Areas</h1><DataTable columns={columns} data={data?.data ?? []} total={data?.total ?? 0} loading={isLoading} getRowId={(row) => row.id} emptyTitle="No areas found" /></div>
}
