import { mockAreas } from '@/mocks/data/areas'
import { mockInquiries } from '@/mocks/data/inquiries'
import { mockPasswords, mockUsers } from '@/mocks/data/users'
import { mockProperties } from '@/mocks/data/properties'
import type {
  AdminReport, AdminStats, Area, Inquiry, PlatformSettings, Property, PropertyFilters,
  RecommendArea, RecommendResponse, User,
} from '@/types'

type Response<T = any> = { data: T }
type RequestConfig = { params?: Record<string, string | number | boolean> }

const readStore = <T>(key: string, fallback: T): T => {
  const value = localStorage.getItem(key)
  return value ? JSON.parse(value) as T : fallback
}
const properties = readStore<Property[]>('nestly-properties', [...mockProperties])
const inquiries = readStore<Inquiry[]>('nestly-inquiries', [...mockInquiries])
const favourites: Record<string, string[]> = {
  'user-buyer-1': ['prop-001', 'prop-007', 'prop-010'],
  'user-buyer-2': ['prop-004', 'prop-012'],
}
const savedSearches: Record<string, Array<Record<string, unknown>>> = {
  'user-buyer-1': [
    { id: 'ss-1', name: 'Colombo houses under 50M', filters: { town: 'Colombo', type: 'house', maxPrice: 50000000 }, alertsEnabled: true, createdAt: '2024-09-01T00:00:00Z' },
    { id: 'ss-2', name: 'Negombo land', filters: { town: 'Negombo', type: 'land' }, alertsEnabled: false, createdAt: '2024-10-01T00:00:00Z' },
  ],
}
const persist = () => {
  localStorage.setItem('nestly-properties', JSON.stringify(properties))
  localStorage.setItem('nestly-inquiries', JSON.stringify(inquiries))
}

const settings: PlatformSettings = {
  siteName: 'Nestly',
  contactEmail: 'admin@nestly.lk',
  listingApprovalRequired: true,
  maxPhotosPerListing: 10,
  maxImageSizeMB: 5,
  belowMarketThreshold: -10,
  aboveMarketThreshold: 10,
  weights: { affordability: 40, amenities: 20, growth: 25, distance: 15 },
  modelInfo: { version: 'v2.1.0', lastTrained: '2024-10-15', mae: 125000, rmse: 198000 },
}

const response = <T>(data: T): Response<T> => ({ data })
const currentUserId = () => {
  const raw = sessionStorage.getItem('nestly-user')
  return raw ? (JSON.parse(raw) as User).id : 'user-buyer-1'
}
const token = (user: User) => ({ accessToken: `frontend-access-${user.id}`, refreshToken: `frontend-refresh-${user.id}` })
const distance = (a: Area, b: Area) => Math.hypot((a.lat - b.lat) * 111, (a.lng - b.lng) * 111)

function findProperties(params: Record<string, string | number | boolean> = {}) {
  let result = properties.filter((p) => p.status === 'approved')
  const town = String(params.town || '')
  if (town) result = result.filter((p) => p.town.toLowerCase().includes(town.toLowerCase()))
  if (params.type) result = result.filter((p) => p.type === params.type)
  if (params.minPrice) result = result.filter((p) => p.price >= Number(params.minPrice))
  if (params.maxPrice) result = result.filter((p) => p.price <= Number(params.maxPrice))
  if (params.sort === 'price_asc') result.sort((a, b) => a.price - b.price)
  else if (params.sort === 'price_desc') result.sort((a, b) => b.price - a.price)
  else result.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const page = Number(params.page || 1)
  const limit = Number(params.limit || 12)
  return { data: result.slice((page - 1) * limit, page * limit), total: result.length, page, limit, totalPages: Math.ceil(result.length / limit) }
}

const frontendData = {
  async get<T = any>(path: string, config: RequestConfig = {}): Promise<Response<T>> {
    const params = { ...config.params }
    if (path.startsWith('/properties?')) {
      const query = Object.fromEntries(new URLSearchParams(path.split('?')[1]))
      return response(findProperties({ ...query, ...params }) as T)
    }
    if (path === '/properties' || path === '/properties/') return response(findProperties(params) as T)
    if (path.startsWith('/properties/')) return response(properties.find((p) => p.id === path.split('/')[2]) as T)
    if (path === '/properties/featured') return response({ data: properties.filter((p) => p.featured && p.status === 'approved').slice(0, 6) } as T)
    if (path.startsWith('/areas/') && path.endsWith('/trend')) {
      const area = mockAreas.find((a) => a.name.toLowerCase() === path.split('/')[2].toLowerCase())
      return response((area?.priceHistory || []) as T)
    }
    if (path === '/user/favourites') {
      const ids = favourites[currentUserId()] || []
      return response(ids.map((id) => {
        const property = properties.find((p) => p.id === id)!
        return { id: `fav-${id}`, propertyId: id, userId: currentUserId(), property, createdAt: '2024-10-01T00:00:00Z' }
      }) as T)
    }
    if (path === '/user/saved-searches') return response((savedSearches[currentUserId()] || []) as T)
    if (path === '/seller/listings') {
      const rows = properties.filter((p) => p.sellerId === currentUserId())
      return response({ data: rows, total: rows.length } as T)
    }
    if (path === '/seller/inquiries') return response(inquiries.filter((i) => i.sellerId === currentUserId()) as T)
    if (path === '/admin/properties') {
      const rows = properties.filter((p) => !params.status || p.status === params.status)
      return response({ data: rows, total: rows.length } as T)
    }
    if (path === '/admin/users') return response({ data: mockUsers, total: mockUsers.length } as T)
    if (path === '/admin/inquiries') return response({ data: inquiries, total: inquiries.length } as T)
    if (path === '/admin/areas') return response({ data: mockAreas, total: mockAreas.length } as T)
    if (path === '/admin/settings') return response(settings as T)
    if (path === '/admin/stats') {
      const stats: AdminStats = { totalUsers: mockUsers.length, totalListings: properties.length, pendingApprovals: properties.filter((p) => p.status === 'pending').length, inquiriesThisMonth: inquiries.length, usersChange: 12, listingsChange: 8, approvalsChange: -3, inquiriesChange: 25 }
      return response(stats as T)
    }
    if (path === '/admin/charts') return response({ listingsPerMonth: [], byType: [], byRole: [], topTowns: [], avgPriceByTown: [] } as T)
    if (path === '/admin/activity') return response([] as T)
    if (path === '/admin/reports') return response({ newUsers: 18, newListings: 34, approvalRate: 78, popularTowns: [], recommendationUsage: 156, monthlyData: [] } as AdminReport as T)
    if (path === '/user/profile') return response(mockUsers.find((u) => u.id === currentUserId()) as T)
    throw new Error(`Frontend data not found: GET ${path}`)
  },
  async post<T = any>(path: string, body: Record<string, unknown>): Promise<Response<T>> {
    if (path === '/auth/login') {
      const user = mockUsers.find((u) => u.email === body.email)
      if (!user || mockPasswords[String(body.email)] !== body.password) throw new Error('Invalid email or password')
      sessionStorage.setItem('nestly-user', JSON.stringify(user))
      return response({ user, tokens: token(user) } as T)
    }
    if (path === '/auth/register') {
      const user = { id: `user-${Date.now()}`, name: String(body.name), email: String(body.email), role: body.role as 'buyer' | 'seller', status: 'active' as const, createdAt: new Date().toISOString() }
      mockUsers.push(user)
      mockPasswords[user.email] = String(body.password)
      sessionStorage.setItem('nestly-user', JSON.stringify(user))
      return response({ user, tokens: token(user) } as T)
    }
    if (path === '/properties') {
      const property = body as Partial<Property>
      const newProperty: Property = {
        id: `prop-${Date.now()}`, title: String(property.title || ''), description: String(property.description || ''),
        type: property.type || 'house', price: Number(property.price || 0), size: Number(property.size || 0),
        bedrooms: property.bedrooms, bathrooms: property.bathrooms, town: String(property.town || ''),
        address: property.address, lat: Number(property.lat || 0), lng: Number(property.lng || 0),
        images: property.images || [], status: 'pending', featured: false, reported: false, priceBadge: 'fair',
        fairPriceMin: Number(property.price || 0) * 0.9, fairPriceMax: Number(property.price || 0) * 1.1,
        sellerId: String(property.sellerId || currentUserId()), sellerName: String(property.sellerName || ''),
        views: 0, inquiryCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      }
      properties.unshift(newProperty)
      persist()
      return response(newProperty as T)
    }
    if (path === '/user/favourites') {
      const ids = favourites[currentUserId()] ||= []
      if (!ids.includes(String(body.propertyId))) ids.push(String(body.propertyId))
      return response({ success: true } as T)
    }
    if (path.includes('/inquiries')) return response({ success: true } as T)
    if (path === '/recommend') {
      const target = mockAreas.find((a) => a.name.toLowerCase() === String(body.town).toLowerCase()) || mockAreas[0]
      const areas: RecommendArea[] = mockAreas.map((area) => ({ rank: 0, areaName: area.name, town: area.name, lat: area.lat, lng: area.lng, score: Math.round(Math.max(0, 100 - distance(target, area))), explanation: `Local recommendation for ${body.town}.`, trend: area.trend, distance: Math.round(distance(target, area) * 10) / 10, listingCount: properties.filter((p) => p.town === area.name && p.status === 'approved').length, avgPrice: area.avgPricePerPerch, affordablePerches: Math.floor(Number(body.budget) / area.avgPricePerPerch), listings: properties.filter((p) => p.town === area.name && p.status === 'approved').slice(0, 4) }))
      areas.sort((a, b) => (b.score || 0) - (a.score || 0)).forEach((a, i) => { a.rank = i + 1 })
      return response({ targetTown: String(body.town), targetLat: target.lat, targetLng: target.lng, areas: areas.slice(0, 6), modelVersion: 'frontend-demo', degraded: false } as RecommendResponse as T)
    }
    return response({ success: true } as T)
  },
  async put<T = any>(path: string, body: Record<string, unknown>): Promise<Response<T>> {
    if (path === '/admin/settings') Object.assign(settings, body)
    if (path.startsWith('/properties/')) {
      const property = properties.find((item) => item.id === path.split('/')[2])
      if (property) Object.assign(property, body, { updatedAt: new Date().toISOString() })
      persist()
      return response(property as T)
    }
    if (path === '/user/profile') {
      const user = mockUsers.find((u) => u.id === currentUserId())
      if (user) Object.assign(user, body)
      return response(user as T)
    }
    return response({ success: true } as T)
  },
  async patch<T = any>(path: string, body: Record<string, unknown> = {}): Promise<Response<T>> {
    const parts = path.split('/')
    if (path.includes('/approve')) {
      const property = properties.find((p) => p.id === parts[3])
      if (property) property.status = body.action === 'approve' ? 'approved' : body.action === 'reject' ? 'rejected' : 'unpublished'
      persist()
      return response(property as T)
    }
    if (path.includes('/spam')) {
      const inquiry = inquiries.find((i) => i.id === parts[3])
      if (inquiry) inquiry.isSpam = true
      persist()
      return response(inquiry as T)
    }
    if (path.includes('/read')) {
      const inquiry = inquiries.find((item) => item.id === parts[3])
      if (inquiry) inquiry.isRead = true
      persist()
      return response(inquiry as T)
    }
    if (path.startsWith('/admin/users/')) {
      const user = mockUsers.find((item) => item.id === parts[3])
      if (user) Object.assign(user, body)
      return response(user as T)
    }
    return response({ success: true } as T)
  },
  async delete<T = any>(path: string): Promise<Response<T>> {
    if (path.startsWith('/admin/properties/')) {
      const index = properties.findIndex((item) => item.id === path.split('/')[3])
      if (index >= 0) properties.splice(index, 1)
      persist()
    }
    if (path.startsWith('/admin/users/')) {
      const index = mockUsers.findIndex((item) => item.id === path.split('/')[3])
      if (index >= 0) mockUsers.splice(index, 1)
    }
    if (path.includes('/favourites/')) {
      const ids = favourites[currentUserId()] || []
      favourites[currentUserId()] = ids.filter((id) => id !== path.split('/').pop())
    }
    if (path.includes('/saved-searches/')) {
      savedSearches[currentUserId()] = (savedSearches[currentUserId()] || []).filter((item) => item.id !== path.split('/').pop())
    }
    return response({ success: true } as T)
  },
}

export default frontendData
