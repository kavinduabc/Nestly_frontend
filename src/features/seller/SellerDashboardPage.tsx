import { useQuery } from '@tanstack/react-query'
import { LayoutDashboard, Eye, MessageSquare, ListChecks, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatCard } from '@/components/StatCard'
import { Badge } from '@/components/Badge'
import { Skeleton } from '@/components/Skeleton'
import { useAuthStore } from '@/features/auth/authStore'
import { formatLKR, formatDate, formatRelativeTime } from '@/lib/formatters'
import frontendData from '@/lib/frontendData'
import type { Property, Inquiry } from '@/types'

const statusConfig = {
  pending: { label: 'Pending', variant: 'warning' as const, icon: Clock },
  approved: { label: 'Approved', variant: 'success' as const, icon: CheckCircle },
  rejected: { label: 'Rejected', variant: 'danger' as const, icon: XCircle },
  unpublished: { label: 'Unpublished', variant: 'default' as const, icon: Clock },
}

export function SellerDashboardPage() {
  const { user } = useAuthStore()

  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ['seller-listings', user?.id],
    queryFn: async () => {
      const res = await frontendData.get(`/seller/listings?sellerId=${user?.id}`)
      return res.data.data as Property[]
    },
    enabled: !!user,
  })

  const { data: inquiries, isLoading: inqLoading } = useQuery({
    queryKey: ['seller-inquiries'],
    queryFn: async () => {
      const res = await frontendData.get('/seller/inquiries')
      return res.data as Inquiry[]
    },
  })

  const active = listings?.filter(l => l.status === 'approved').length ?? 0
  const pending = listings?.filter(l => l.status === 'pending').length ?? 0
  const totalViews = listings?.reduce((sum, l) => sum + l.views, 0) ?? 0
  const unreadInq = inquiries?.filter(i => !i.isRead).length ?? 0

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's your seller overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active listings" value={active} icon={ListChecks} />
        <StatCard title="Pending review" value={pending} icon={Clock} iconColor="text-amber-500" />
        <StatCard title="Total views" value={totalViews.toLocaleString()} icon={Eye} />
        <StatCard title="Unread inquiries" value={unreadInq} icon={MessageSquare} iconColor="text-blue-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent listings */}
        <div className="bg-white dark:bg-gray-900 rounded-card border border-gray-100 dark:border-gray-800 shadow-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">My listings</h2>
            <Link to="/seller/listings" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {listingsLoading
              ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="px-5 py-3"><Skeleton className="h-12 w-full" /></div>)
              : listings?.slice(0, 5).map((l) => {
                const cfg = statusConfig[l.status]
                return (
                  <div key={l.id} className="px-5 py-3 flex items-center gap-3">
                    <img src={l.images[0]} alt={l.title} className="w-12 h-10 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{l.title}</p>
                      <p className="text-xs text-gray-400">{formatLKR(l.price, true)}</p>
                    </div>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </div>
                )
              })
            }
          </div>
          <div className="px-5 py-3 border-t border-gray-50 dark:border-gray-800">
            <Link to="/seller/listings/new">
              <button className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">+ Add new listing</button>
            </Link>
          </div>
        </div>

        {/* Recent inquiries */}
        <div className="bg-white dark:bg-gray-900 rounded-card border border-gray-100 dark:border-gray-800 shadow-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent inquiries</h2>
            <Link to="/seller/inquiries" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {inqLoading
              ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="px-5 py-3"><Skeleton className="h-12 w-full" /></div>)
              : inquiries?.slice(0, 5).map((inq) => (
                <div key={inq.id} className={`px-5 py-3 ${!inq.isRead ? 'bg-primary-50/50 dark:bg-primary-950/30' : ''}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{inq.buyerName}</p>
                    <span className="text-xs text-gray-400">{formatRelativeTime(inq.createdAt)}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{inq.message}</p>
                  {!inq.isRead && <span className="inline-block w-2 h-2 rounded-full bg-primary-500 mt-1" aria-label="Unread" />}
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}
