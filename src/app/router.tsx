import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { PublicLayout } from './layouts/PublicLayout'
import { DashboardLayout } from './layouts/DashboardLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { Skeleton } from '@/components/Skeleton'

// Lazy load all pages
const Home = lazy(() => import('@/features/home/HomePage').then((m) => ({ default: m.HomePage })))
const SearchPage = lazy(() => import('@/features/search/SearchPage').then((m) => ({ default: m.SearchPage })))
const ListingDetail = lazy(() => import('@/features/listings/ListingDetailPage').then((m) => ({ default: m.ListingDetailPage })))
const RecommendPage = lazy(() => import('@/features/recommend/RecommendPage').then((m) => ({ default: m.RecommendPage })))
const AreaPage = lazy(() => import('@/features/areas/AreaPage').then((m) => ({ default: m.AreaPage })))
const LoginPage = lazy(() => import('@/features/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const AboutPage = lazy(() => import('@/features/static/AboutPage').then((m) => ({ default: m.AboutPage })))
const ContactPage = lazy(() => import('@/features/static/ContactPage').then((m) => ({ default: m.ContactPage })))

// Buyer pages
const FavouritesPage = lazy(() => import('@/features/favourites/FavouritesPage').then((m) => ({ default: m.FavouritesPage })))
const SavedSearchesPage = lazy(() => import('@/features/favourites/SavedSearchesPage').then((m) => ({ default: m.SavedSearchesPage })))
const ProfilePage = lazy(() => import('@/features/auth/ProfilePage').then((m) => ({ default: m.ProfilePage })))

// Seller pages
const SellerDashboard = lazy(() => import('@/features/seller/SellerDashboardPage').then((m) => ({ default: m.SellerDashboardPage })))
const SellerListings = lazy(() => import('@/features/seller/SellerListingsPage').then((m) => ({ default: m.SellerListingsPage })))
const NewListingPage = lazy(() => import('@/features/seller/NewListingPage').then((m) => ({ default: m.NewListingPage })))
const EditListingPage = lazy(() => import('@/features/seller/EditListingPage').then((m) => ({ default: m.EditListingPage })))
const SellerInquiries = lazy(() => import('@/features/seller/SellerInquiriesPage').then((m) => ({ default: m.SellerInquiriesPage })))

// Admin pages
const AdminDashboard = lazy(() => import('@/features/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })))
const AdminApprovals = lazy(() => import('@/features/admin/AdminApprovalsPage').then((m) => ({ default: m.AdminApprovalsPage })))
const AdminListings = lazy(() => import('@/features/admin/AdminListingsPage').then((m) => ({ default: m.AdminListingsPage })))
const AdminUsers = lazy(() => import('@/features/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })))
const AdminInquiries = lazy(() => import('@/features/admin/AdminInquiriesPage').then((m) => ({ default: m.AdminInquiriesPage })))
const AdminAreas = lazy(() => import('@/features/admin/AdminAreasPage').then((m) => ({ default: m.AdminAreasPage })))
const AdminReports = lazy(() => import('@/features/admin/AdminReportsPage').then((m) => ({ default: m.AdminReportsPage })))
const AdminSettings = lazy(() => import('@/features/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })))

// Error pages
const Page404 = lazy(() => import('@/features/errors/Page404').then((m) => ({ default: m.Page404 })))
const Page403 = lazy(() => import('@/features/errors/Page403').then((m) => ({ default: m.Page403 })))

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-64">
    <div className="space-y-3 w-full max-w-sm">
      <Skeleton className="h-4 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-1/2 mx-auto" />
      <Skeleton className="h-4 w-2/3 mx-auto" />
    </div>
  </div>
)

const wrap = (element: React.ReactNode) => <Suspense fallback={<PageLoader />}>{element}</Suspense>

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: wrap(<Home />) },
      { path: 'search', element: wrap(<SearchPage />) },
      { path: 'properties/:id', element: wrap(<ListingDetail />) },
      { path: 'recommend', element: wrap(<RecommendPage />) },
      { path: 'areas/:town', element: wrap(<AreaPage />) },
      { path: 'login', element: wrap(<LoginPage />) },
      { path: 'register', element: wrap(<RegisterPage />) },
      { path: 'about', element: wrap(<AboutPage />) },
      { path: 'contact', element: wrap(<ContactPage />) },

      // Buyer-protected
      {
        path: 'favourites',
        element: <ProtectedRoute roles={['buyer']}>{wrap(<FavouritesPage />)}</ProtectedRoute>,
      },
      {
        path: 'saved-searches',
        element: <ProtectedRoute roles={['buyer']}>{wrap(<SavedSearchesPage />)}</ProtectedRoute>,
      },
      {
        path: 'profile',
        element: <ProtectedRoute roles={['buyer', 'seller', 'admin']}>{wrap(<ProfilePage />)}</ProtectedRoute>,
      },
    ],
  },

  // Seller dashboard
  {
    path: '/seller',
    element: (
      <ProtectedRoute roles={['seller', 'admin']}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: wrap(<SellerDashboard />) },
      { path: 'listings', element: wrap(<SellerListings />) },
      { path: 'listings/new', element: wrap(<NewListingPage />) },
      { path: 'listings/:id/edit', element: wrap(<EditListingPage />) },
      { path: 'inquiries', element: wrap(<SellerInquiries />) },
    ],
  },

  // Admin panel
  {
    path: '/admin',
    element: (
      <ProtectedRoute roles={['admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: wrap(<AdminDashboard />) },
      { path: 'approvals', element: wrap(<AdminApprovals />) },
      { path: 'listings', element: wrap(<AdminListings />) },
      { path: 'users', element: wrap(<AdminUsers />) },
      { path: 'inquiries', element: wrap(<AdminInquiries />) },
      { path: 'areas', element: wrap(<AdminAreas />) },
      { path: 'reports', element: wrap(<AdminReports />) },
      { path: 'settings', element: wrap(<AdminSettings />) },
    ],
  },

  { path: '/403', element: wrap(<Page403 />) },
  { path: '*', element: wrap(<Page404 />) },
])
