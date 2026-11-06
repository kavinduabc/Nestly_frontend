import { useQuery } from '@tanstack/react-query'
import { Users, ListChecks, Clock, MessageSquare } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts'
import { StatCard } from '@/components/StatCard'
import { Skeleton } from '@/components/Skeleton'
import { Badge } from '@/components/Badge'
import { formatLKR, formatRelativeTime } from '@/lib/formatters'
import frontendData from '@/lib/frontendData'
import type { AdminStats } from '@/types'

export function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => { const r = await frontendData.get('/admin/stats'); return r.data as AdminStats },
  })
  const { data: charts, isLoading: chartsLoading } = useQuery({
    queryKey: ['admin-charts'],
    queryFn: async () => { const r = await frontendData.get('/admin/charts'); return r.data },
  })
  const { data: activity } = useQuery({
    queryKey: ['admin-activity'],
    queryFn: async () => { const r = await frontendData.get('/admin/activity'); return r.data },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-card" />) : (
          <>
            <StatCard title="Total users" value={stats?.totalUsers ?? 0} change={stats?.usersChange} icon={Users} />
            <StatCard title="Total listings" value={stats?.totalListings ?? 0} change={stats?.listingsChange} icon={ListChecks} />
            <StatCard title="Pending approvals" value={stats?.pendingApprovals ?? 0} change={stats?.approvalsChange} icon={Clock} iconColor="text-amber-500" />
            <StatCard title="Inquiries this month" value={stats?.inquiriesThisMonth ?? 0} change={stats?.inquiriesChange} icon={MessageSquare} iconColor="text-blue-500" />
          </>
        )}
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-card border border-gray-100 dark:border-gray-800 shadow-card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Listings per month</h2>
          {chartsLoading ? <Skeleton className="h-48 w-full" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={charts?.listingsPerMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#0F6E56" strokeWidth={2} dot={false} name="Listings" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-card border border-gray-100 dark:border-gray-800 shadow-card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Listings by type</h2>
          {chartsLoading ? <Skeleton className="h-48 w-full" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={charts?.byType} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                  {charts?.byType.map((entry: { fill: string }, i: number) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-card border border-gray-100 dark:border-gray-800 shadow-card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Top towns by listings</h2>
          {chartsLoading ? <Skeleton className="h-48 w-full" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={charts?.topTowns}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="town" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1D9E75" radius={[4, 4, 0, 0]} name="Listings" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-card border border-gray-100 dark:border-gray-800 shadow-card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Users by role</h2>
          {chartsLoading ? <Skeleton className="h-48 w-full" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={charts?.byRole}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="role" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0F6E56" radius={[4, 4, 0, 0]} name="Users" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Activity feed */}
      <div className="bg-white dark:bg-gray-900 rounded-card border border-gray-100 dark:border-gray-800 shadow-card p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Recent activity</h2>
        <div className="space-y-3">
          {(activity || []).map((item: { id: string; type: string; message: string; createdAt: string }) => (
            <div key={item.id} className="flex items-start gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-primary-400 mt-2 flex-shrink-0" aria-hidden />
              <div className="flex-1">
                <p className="text-gray-700 dark:text-gray-200">{item.message}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(item.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
