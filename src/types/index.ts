// ─── Auth ────────────────────────────────────────────────────────────────────
export type UserRole = 'buyer' | 'seller' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  town?: string
  role: UserRole
  avatar?: string
  status: 'active' | 'suspended'
  createdAt: string
  listingCount?: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  phone?: string
  role: 'buyer' | 'seller'
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

// ─── Properties ──────────────────────────────────────────────────────────────
export type PropertyType = 'house' | 'land' | 'apartment'
export type PropertyStatus = 'pending' | 'approved' | 'rejected' | 'unpublished'
export type PriceBadge = 'below_market' | 'fair' | 'above_market'

export interface Property {
  id: string
  title: string
  description: string
  type: PropertyType
  price: number
  size: number // perches for land, sqft for house/apt
  bedrooms?: number
  bathrooms?: number
  town: string
  address?: string
  lat: number
  lng: number
  images: string[]
  status: PropertyStatus
  featured: boolean
  reported: boolean
  priceBadge: PriceBadge
  fairPriceMin: number
  fairPriceMax: number
  sellerId: string
  sellerName: string
  views: number
  inquiryCount: number
  createdAt: string
  updatedAt: string
}

export interface PropertyFilters {
  town?: string
  minPrice?: number
  maxPrice?: number
  type?: PropertyType
  minSize?: number
  maxSize?: number
  bedrooms?: number
  status?: PropertyStatus
  page?: number
  limit?: number
  sort?: string
}

export interface PaginatedProperties {
  data: Property[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── Recommendations ─────────────────────────────────────────────────────────
export type Trend = 'rising' | 'stable' | 'falling'

export interface RecommendRequest {
  town: string
  budget: number
  type?: PropertyType
}

export interface RecommendArea {
  rank: number
  areaName: string
  town: string
  lat: number
  lng: number
  score: number | null
  explanation: string
  trend: Trend | null
  distance: number // km from target town
  listingCount: number
  avgPrice: number
  affordablePerches: number | null
  listings: Property[]
}

export interface RecommendResponse {
  targetTown: string
  targetLat: number
  targetLng: number
  areas: RecommendArea[]
  modelVersion: string | null
  degraded: boolean
}

// ─── Areas ───────────────────────────────────────────────────────────────────
export interface AreaTrend {
  month: string
  avgPrice: number
  listingCount: number
}

export interface Area {
  id: string
  name: string
  lat: number
  lng: number
  avgPricePerPerch: number
  listingCount: number
  trend: Trend
  priceHistory: AreaTrend[]
}

// ─── Inquiries ────────────────────────────────────────────────────────────────
export interface Inquiry {
  id: string
  propertyId: string
  propertyTitle: string
  buyerId: string
  buyerName: string
  buyerPhone: string
  sellerId: string
  message: string
  isRead: boolean
  isSpam: boolean
  createdAt: string
}

// ─── Price Prediction ────────────────────────────────────────────────────────
export interface PricePredictRequest {
  type: PropertyType
  town: string
  size: number
  bedrooms?: number
}

export interface PricePredictResponse {
  fairPriceMin: number
  fairPriceMax: number
  badge: PriceBadge
  confidence: number
}

// ─── Favourites ───────────────────────────────────────────────────────────────
export interface Favourite {
  id: string
  propertyId: string
  userId: string
  property: Property
  createdAt: string
}

// ─── Saved Searches ───────────────────────────────────────────────────────────
export interface SavedSearch {
  id: string
  userId: string
  name: string
  filters: PropertyFilters
  alertsEnabled: boolean
  createdAt: string
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export interface AdminStats {
  totalUsers: number
  totalListings: number
  pendingApprovals: number
  inquiriesThisMonth: number
  usersChange: number
  listingsChange: number
  approvalsChange: number
  inquiriesChange: number
}

export interface AdminReport {
  newUsers: number
  newListings: number
  approvalRate: number
  popularTowns: { town: string; count: number }[]
  recommendationUsage: number
  monthlyData: { month: string; users: number; listings: number }[]
}

export interface PlatformSettings {
  siteName: string
  contactEmail: string
  listingApprovalRequired: boolean
  maxPhotosPerListing: number
  maxImageSizeMB: number
  belowMarketThreshold: number
  aboveMarketThreshold: number
  weights: {
    affordability: number
    amenities: number
    growth: number
    distance: number
  }
  modelInfo: {
    version: string
    lastTrained: string
    mae: number
    rmse: number
  }
}

export interface ActivityItem {
  id: string
  type: 'listing_submitted' | 'listing_approved' | 'listing_rejected' | 'user_registered' | 'inquiry_sent'
  message: string
  userId?: string
  propertyId?: string
  createdAt: string
}
