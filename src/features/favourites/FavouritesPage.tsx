import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Heart } from 'lucide-react'
import { PropertyCard } from '@/components/PropertyCard'
import { PropertyCardSkeleton } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { useUIStore } from '@/app/uiStore'
import frontendData from '@/lib/frontendData'
import type { Favourite } from '@/types'

export function FavouritesPage() {
  const { addToast } = useUIStore()
  const qc = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['favourites'],
    queryFn: async () => {
      const res = await frontendData.get('/user/favourites')
      return res.data as Favourite[]
    },
  })

  const removeMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      await frontendData.delete(`/user/favourites/${propertyId}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['favourites'] })
      addToast({ type: 'success', title: 'Removed from favourites' })
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Favourites</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {data ? `${data.length} saved propert${data.length !== 1 ? 'ies' : 'y'}` : 'Your saved properties'}
        </p>
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
        </div>
      ) : data?.length === 0 ? (
        <EmptyState icon={Heart} title="No favourites yet"
          description="Browse listings and click the heart icon to save properties you love." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.map((fav) => (
            <PropertyCard key={fav.id} property={fav.property} isFavourited
              onToggleFavourite={() => removeMutation.mutate(fav.propertyId)} />
          ))}
        </div>
      )}
    </div>
  )
}
