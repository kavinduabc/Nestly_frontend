import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { MapPin, Bed, Bath, Maximize2, Eye, Heart, Share2, TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/Button'
import { PriceBadge } from '@/components/PriceBadge'
import { PropertyTypeIcon } from '@/components/PropertyTypeIcon'
import { Skeleton } from '@/components/Skeleton'
import { ErrorState } from '@/components/ErrorState'
import { Badge } from '@/components/Badge'
import { formatLKR, formatPerches, formatSqft, formatDate } from '@/lib/formatters'
import { useUIStore } from '@/app/uiStore'
import frontendData from '@/lib/frontendData'
import type { Property } from '@/types'
import { cn } from '@/lib/utils'

const inquirySchema = z.object({
  name: z.string().min(2, 'Name required'),
  phone: z.string().min(9, 'Valid phone required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})
type InquiryForm = z.infer<typeof inquirySchema>

const trendConfig = {
  rising: { icon: TrendingUp, label: 'Rising', cls: 'text-emerald-600' },
  stable: { icon: Minus, label: 'Stable', cls: 'text-blue-600' },
  falling: { icon: TrendingDown, label: 'Falling', cls: 'text-red-500' },
}

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { addToast } = useUIStore()
  const [imgIdx, setImgIdx] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [isFav, setIsFav] = useState(false)

  const { data: property, isLoading, isError, refetch } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const res = await frontendData.get(`/properties/${id}`)
      return res.data as Property
    },
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InquiryForm>({
    resolver: zodResolver(inquirySchema),
  })

  const inquiryMutation = useMutation({
    mutationFn: async (data: InquiryForm) => {
      await frontendData.post(`/properties/${id}/inquiries`, data)
    },
    onSuccess: () => {
      addToast({ type: 'success', title: 'Inquiry sent!', description: 'The seller will contact you soon.' })
      reset()
    },
    onError: () => addToast({ type: 'error', title: 'Failed to send inquiry' }),
  })

  if (isLoading) return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Skeleton className="h-96 w-full rounded-card mb-6" />
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-8 w-3/4" /><Skeleton className="h-6 w-1/4" /><Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full rounded-card" />
      </div>
    </div>
  )

  if (isError || !property) return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <ErrorState onRetry={refetch} />
    </div>
  )

  const sizeLabel = property.type === 'land' ? formatPerches(property.size) : formatSqft(property.size)
  const trend = trendConfig[property.priceBadge === 'below_market' ? 'falling' : property.priceBadge === 'above_market' ? 'rising' : 'stable']

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <Link to="/search" className="hover:text-primary-600">Search</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white truncate">{property.title}</span>
      </nav>

      {/* Image gallery */}
      <div className="relative rounded-card overflow-hidden bg-gray-100 dark:bg-gray-800 mb-8 group">
        <img
          src={property.images[imgIdx]}
          alt={`${property.title} - image ${imgIdx + 1}`}
          className="w-full h-80 md:h-[480px] object-cover cursor-pointer"
          onClick={() => setLightboxOpen(true)}
        />
        {property.images.length > 1 && (
          <>
            <button onClick={() => setImgIdx((i) => Math.max(0, i - 1))} disabled={imgIdx === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="Previous image">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setImgIdx((i) => Math.min(property.images.length - 1, i + 1))} disabled={imgIdx === property.images.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="Next image">
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {property.images.map((_, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={cn('w-2 h-2 rounded-full transition-colors', i === imgIdx ? 'bg-white' : 'bg-white/50')}
                  aria-label={`Image ${i + 1}`} />
              ))}
            </div>
          </>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <PriceBadge badge={property.priceBadge} fairMin={property.fairPriceMin} fairMax={property.fairPriceMax} />
          {property.featured && <Badge variant="warning">Featured</Badge>}
        </div>
        <div className="absolute bottom-3 right-3 text-xs text-white/80 bg-black/40 rounded px-2 py-1">
          {imgIdx + 1} / {property.images.length}
        </div>
      </div>

      {/* Thumbnail strip */}
      {property.images.length > 1 && (
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {property.images.map((src, i) => (
            <button key={i} onClick={() => setImgIdx(i)}
              className={cn('flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors', i === imgIdx ? 'border-primary-500' : 'border-transparent hover:border-gray-300')}
              aria-label={`Thumbnail ${i + 1}`}>
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <div className="flex items-start gap-3">
              <PropertyTypeIcon type={property.type} size={24} className="text-primary-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{property.title}</h1>
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mt-1">
                  <MapPin size={14} /><span>{property.address || property.town}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setIsFav(!isFav); addToast({ type: 'success', title: isFav ? 'Removed from favourites' : 'Added to favourites' }) }}
                  className={cn('w-10 h-10 rounded-xl flex items-center justify-center border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500', isFav ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800')}
                  aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}>
                  <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                </button>
                <button onClick={() => { navigator.clipboard?.writeText(window.location.href); addToast({ type: 'info', title: 'Link copied!' }) }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  aria-label="Share listing">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-4">{formatLKR(property.price)}</p>
          </div>

          {/* Key facts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Size', value: sizeLabel, Icon: Maximize2 },
              ...(property.bedrooms !== undefined ? [{ label: 'Bedrooms', value: String(property.bedrooms), Icon: Bed }] : []),
              ...(property.bathrooms !== undefined ? [{ label: 'Bathrooms', value: String(property.bathrooms), Icon: Bath }] : []),
              { label: 'Views', value: String(property.views), Icon: Eye },
            ].map(({ label, value, Icon }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                <Icon size={18} className="text-primary-600 dark:text-primary-400 mx-auto mb-1" />
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-2">About this property</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">{property.description}</p>
          </div>

          {/* Market analysis */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-card p-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Market analysis</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Price assessment</p>
                <PriceBadge badge={property.priceBadge} fairMin={property.fairPriceMin} fairMax={property.fairPriceMax} showTooltip />
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fair range estimate</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatLKR(property.fairPriceMin, true)} – {formatLKR(property.fairPriceMax, true)}
                </p>
              </div>
            </div>
          </div>

          {/* Listed date */}
          <p className="text-xs text-gray-400 dark:text-gray-500">Listed on {formatDate(property.createdAt)} · Seller: {property.sellerName}</p>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Inquiry form */}
          <div className="bg-white dark:bg-gray-900 rounded-card border border-gray-100 dark:border-gray-800 shadow-card p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Contact seller</h2>
            <form onSubmit={handleSubmit((d) => inquiryMutation.mutate(d))} className="space-y-3">
              <div>
                <label htmlFor="inq-name" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Your name</label>
                <input {...register('name')} id="inq-name" type="text" placeholder="Priya Fernando"
                  className="w-full h-9 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label htmlFor="inq-phone" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Phone</label>
                <input {...register('phone')} id="inq-phone" type="tel" placeholder="+94 77 123 4567"
                  className="w-full h-9 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <label htmlFor="inq-msg" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Message</label>
                <textarea {...register('message')} id="inq-msg" rows={3} placeholder="I am interested in this property..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
              </div>
              <Button type="submit" className="w-full" loading={inquiryMutation.isPending}>Send inquiry</Button>
            </form>
          </div>

          {/* Mini map placeholder */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-card h-40 flex items-center justify-center">
            <div className="text-center">
              <MapPin size={24} className="text-primary-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">{property.lat.toFixed(4)}, {property.lng.toFixed(4)}</p>
              <p className="text-xs text-gray-400 mt-1">{property.town}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10" aria-label="Close lightbox">
            <X size={24} />
          </button>
          <img src={property.images[imgIdx]} alt={property.title} className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
