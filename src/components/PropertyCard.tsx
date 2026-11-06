import { Link } from 'react-router-dom'
import { MapPin, Bed, Bath, Maximize2, Eye, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatLKR, formatPerches, formatSqft } from '@/lib/formatters'
import { PriceBadge } from './PriceBadge'
import { PropertyTypeIcon } from './PropertyTypeIcon'
import type { Property } from '@/types'

interface PropertyCardProps {
  property: Property
  isFavourited?: boolean
  onToggleFavourite?: (id: string) => void
  className?: string
}

export function PropertyCard({ property, isFavourited, onToggleFavourite, className }: PropertyCardProps) {
  const sizeLabel = property.type === 'land'
    ? formatPerches(property.size)
    : formatSqft(property.size)

  return (
    <article className={cn('group bg-white dark:bg-gray-900 rounded-card border border-gray-100 dark:border-gray-800 overflow-hidden shadow-card hover:shadow-card-hover transition-shadow', className)}>
      <div className="relative">
        <Link to={`/properties/${property.id}`} tabIndex={-1} aria-hidden>
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-48 object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        </Link>
        {property.featured && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            Featured
          </span>
        )}
        {onToggleFavourite && (
          <button
            onClick={() => onToggleFavourite(property.id)}
            className={cn(
              'absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              isFavourited
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-600 hover:bg-white'
            )}
            aria-label={isFavourited ? 'Remove from favourites' : 'Add to favourites'}
          >
            <Heart size={14} fill={isFavourited ? 'currentColor' : 'none'} aria-hidden />
          </button>
        )}
        <div className="absolute bottom-2 left-2">
          <PriceBadge badge={property.priceBadge} fairMin={property.fairPriceMin} fairMax={property.fairPriceMax} />
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link
            to={`/properties/${property.id}`}
            className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 line-clamp-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
          >
            {property.title}
          </Link>
          <PropertyTypeIcon type={property.type} size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
        </div>

        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">
          {formatLKR(property.price, true)}
        </p>

        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mt-2">
          <MapPin size={13} aria-hidden />
          <span className="truncate">{property.town}</span>
        </div>

        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Maximize2 size={12} aria-hidden />
            {sizeLabel}
          </span>
          {property.bedrooms !== undefined && (
            <span className="flex items-center gap-1">
              <Bed size={12} aria-hidden />
              {property.bedrooms} bed
            </span>
          )}
          {property.bathrooms !== undefined && (
            <span className="flex items-center gap-1">
              <Bath size={12} aria-hidden />
              {property.bathrooms} bath
            </span>
          )}
          <span className="flex items-center gap-1 ml-auto">
            <Eye size={12} aria-hidden />
            {property.views}
          </span>
        </div>
      </div>
    </article>
  )
}
