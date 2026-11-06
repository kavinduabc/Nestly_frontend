import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { ChevronRight, ChevronLeft, Sparkles, Upload, X } from 'lucide-react'
import { Button } from '@/components/Button'
import { PropertyTypeIcon } from '@/components/PropertyTypeIcon'
import { formatLKR } from '@/lib/formatters'
import { useAuthStore } from '@/features/auth/authStore'
import { useUIStore } from '@/app/uiStore'
import { sriLankaTowns } from '@/mocks/data/areas'
import frontendData from '@/lib/frontendData'
import type { PropertyType } from '@/types'
import { cn } from '@/lib/utils'

const schema = z.object({
  type: z.enum(['house', 'land', 'apartment']),
  title: z.string().min(10, 'Title must be at least 10 chars'),
  description: z.string().min(30, 'Description must be at least 30 chars'),
  price: z.number().min(100000, 'Min price 100,000 LKR'),
  size: z.number().min(1, 'Size required'),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  town: z.string().min(1, 'Town required'),
  address: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
})
type FormData = z.infer<typeof schema>

const STEPS = ['Details', 'Location', 'Photos', 'Review']

export function NewListingPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { addToast } = useUIStore()
  const [step, setStep] = useState(0)
  const [images, setImages] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null)

  const { register, handleSubmit, watch, control, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'house', lat: 6.9271, lng: 79.8612 },
  })

  const watchedType = watch('type')
  const watchedPrice = watch('price')
  const watchedTown = watch('town')
  const watchedSize = watch('size')

  const priceMutation = useMutation({
    mutationFn: async () => {
      const res = await frontendData.post('/predict/price', { type: watchedType, town: watchedTown, size: watchedSize })
      return res.data
    },
    onSuccess: (data) => {
      setPriceRange({ min: data.fairPriceMin, max: data.fairPriceMax })
    },
    onError: () => addToast({ type: 'error', title: 'Price suggestion unavailable' }),
  })

  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await frontendData.post('/properties', {
        ...data,
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'],
        sellerId: user?.id,
        sellerName: user?.name,
      })
      return res.data
    },
    onSuccess: () => {
      addToast({ type: 'success', title: 'Listing submitted for review!' })
      navigate('/seller/listings')
    },
    onError: () => addToast({ type: 'error', title: 'Failed to submit listing' }),
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      if (!file.type.startsWith('image/')) { addToast({ type: 'error', title: 'Only images allowed' }); return }
      if (file.size > 5 * 1024 * 1024) { addToast({ type: 'error', title: 'Max 5MB per image' }); return }
      const reader = new FileReader()
      reader.onload = (ev) => setImages(prev => [...prev, ev.target?.result as string].slice(0, 10))
      reader.readAsDataURL(file)
    })
  }

  const inputCls = "w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">New listing</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
              i < step ? 'bg-primary-600 text-white' : i === step ? 'bg-primary-600 text-white ring-4 ring-primary-100' : 'bg-gray-200 dark:bg-gray-700 text-gray-500')}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={cn('text-sm', i === step ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-400')}>{s}</span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-200 dark:bg-gray-700" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit((d) => submitMutation.mutate(d))}>
        {/* Step 1: Details */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Property type</label>
              <Controller name="type" control={control} render={({ field }) => (
                <div className="grid grid-cols-3 gap-3">
                  {(['house', 'land', 'apartment'] as PropertyType[]).map(t => (
                    <button key={t} type="button" onClick={() => field.onChange(t)}
                      className={cn('flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all', field.value === t ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' : 'border-gray-200 dark:border-gray-700')}>
                      <PropertyTypeIcon type={t} size={28} className={field.value === t ? 'text-primary-600' : 'text-gray-400'} />
                      <span className="text-sm font-medium capitalize">{t}</span>
                    </button>
                  ))}
                </div>
              )} />
            </div>
            <div>
              <label htmlFor="l-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input {...register('title')} id="l-title" placeholder="3BR House in Colombo 7" className={inputCls} />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label htmlFor="l-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea {...register('description')} id="l-desc" rows={4} placeholder="Describe the property..."
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="l-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (LKR)</label>
                <input {...register('price', { valueAsNumber: true })} id="l-price" type="number" min={0} className={inputCls} />
                {watchedPrice > 0 && <p className="text-xs text-gray-400 mt-1">{formatLKR(watchedPrice)}</p>}
                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
                {priceRange && (
                  <p className="text-xs text-emerald-600 mt-1">Suggested: {formatLKR(priceRange.min, true)} – {formatLKR(priceRange.max, true)}</p>
                )}
              </div>
              <div>
                <label htmlFor="l-size" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Size {watchedType === 'land' ? '(perches)' : '(sq ft)'}</label>
                <input {...register('size', { valueAsNumber: true })} id="l-size" type="number" min={0} className={inputCls} />
                {errors.size && <p className="text-xs text-red-500 mt-1">{errors.size.message}</p>}
              </div>
            </div>
            {watchedType !== 'land' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="l-bed" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bedrooms</label>
                  <input {...register('bedrooms', { valueAsNumber: true })} id="l-bed" type="number" min={0} max={20} className={inputCls} />
                </div>
                <div>
                  <label htmlFor="l-bath" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bathrooms</label>
                  <input {...register('bathrooms', { valueAsNumber: true })} id="l-bath" type="number" min={0} max={10} className={inputCls} />
                </div>
              </div>
            )}
            <Button type="button" variant="outline" leftIcon={<Sparkles size={15} />} loading={priceMutation.isPending}
              disabled={!watchedTown || !watchedSize}
              onClick={() => priceMutation.mutate()}>
              Suggest a price
            </Button>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="l-town" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Town</label>
              <select {...register('town')} id="l-town" className={inputCls}>
                <option value="">Select town</option>
                {sriLankaTowns.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.town && <p className="text-xs text-red-500 mt-1">{errors.town.message}</p>}
            </div>
            <div>
              <label htmlFor="l-addr" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address (optional)</label>
              <input {...register('address')} id="l-addr" placeholder="Street address" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="l-lat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Latitude</label>
                <input {...register('lat', { valueAsNumber: true })} id="l-lat" type="number" step="0.0001" className={inputCls} />
              </div>
              <div>
                <label htmlFor="l-lng" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Longitude</label>
                <input {...register('lng', { valueAsNumber: true })} id="l-lng" type="number" step="0.0001" className={inputCls} />
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl h-48 flex items-center justify-center text-gray-400 text-sm">
              Click map to set coordinates (map integration available with Leaflet)
            </div>
          </div>
        )}

        {/* Step 3: Photos */}
        {step === 2 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Photos (max 10, 5MB each)</label>
            <label className="flex flex-col items-center gap-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 cursor-pointer hover:border-primary-400 transition-colors">
              <Upload size={28} className="text-gray-400" />
              <span className="text-sm text-gray-500">Click to upload photos</span>
              <span className="text-xs text-gray-400">JPG, PNG, WebP accepted</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {images.map((src, i) => (
                  <div key={i} className="relative aspect-video rounded-xl overflow-hidden group">
                    <img src={src} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Remove photo ${i + 1}`}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Review & submit</h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Title</span><span className="font-medium">{watch('title')}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium capitalize">{watch('type')}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Price</span><span className="font-medium">{formatLKR(watch('price') || 0)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Town</span><span className="font-medium">{watch('town')}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Photos</span><span className="font-medium">{images.length} uploaded</span></div>
            </div>
            <p className="text-xs text-gray-400">Your listing will be reviewed by our team before going live. This usually takes less than 24 hours.</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button type="button" variant="outline" leftIcon={<ChevronLeft size={15} />}
            onClick={() => setStep(s => s - 1)} disabled={step === 0}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" rightIcon={<ChevronRight size={15} />} onClick={() => setStep(s => s + 1)}>
              Next
            </Button>
          ) : (
            <Button type="submit" loading={submitMutation.isPending}>Submit listing</Button>
          )}
        </div>
      </form>
    </div>
  )
}
