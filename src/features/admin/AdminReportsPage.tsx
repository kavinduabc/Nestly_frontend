import { useQuery } from '@tanstack/react-query'
import { BarChart2, ListChecks, Users } from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import { Skeleton } from '@/components/Skeleton'
import frontendData from '@/lib/frontendData'
import type { AdminReport } from '@/types'

export function AdminReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => (await frontendData.get('/admin/reports')).data as AdminReport,
  })
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
      {isLoading ? <Skeleton className="h-28 w-full" /> : <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><StatCard title="New users" value={data?.newUsers ?? 0} icon={Users} /><StatCard title="New listings" value={data?.newListings ?? 0} icon={ListChecks} /><StatCard title="Approval rate" value={`${data?.approvalRate ?? 0}%`} icon={BarChart2} /></div>}
      <div className="bg-white dark:bg-gray-900 rounded-card border border-gray-100 dark:border-gray-800 shadow-card p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Popular towns</h2>
        <div className="space-y-3">{(data?.popularTowns ?? []).map((town) => <div key={town.town} className="flex justify-between text-sm"><span className="text-gray-700 dark:text-gray-200">{town.town}</span><span className="font-medium text-primary-600">{town.count} listings</span></div>)}</div>
      </div>
    </div>
  )
}
