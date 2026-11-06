import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MapPin, Search, TrendingUp, CheckCircle, ArrowRight, ChevronLeft, ChevronRight, Calculator, Building2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/Button'
import { PropertyCard } from '@/components/PropertyCard'
import { PropertyTypeIcon } from '@/components/PropertyTypeIcon'
import { PropertyCardSkeleton } from '@/components/Skeleton'
import { formatLKR } from '@/lib/formatters'
import { sriLankaTowns } from '@/mocks/data/areas'
import frontendData from '@/lib/frontendData'
import type { Property, PropertyType } from '@/types'
import { cn } from '@/lib/utils'
import heroBanner from '@/assets/hero-banner.png'

const POPULAR_TOWNS = ['Colombo', 'Negombo', 'Kandy', 'Galle', 'Gampaha', 'Kurunegala', 'Matara', 'Jaffna']
const HERO_TOWNS = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Homagama', 'Maharagama', 'Nugegoda', 'Malabe']

const PROPERTY_TYPES: { type: PropertyType; label: string; desc: string; gradient: string }[] = [
  { type: 'house', label: 'Houses', desc: 'Family homes and villas', gradient: 'from-emerald-500 to-teal-600' },
  { type: 'land', label: 'Land', desc: 'Plots and estates', gradient: 'from-amber-400 to-orange-500' },
  { type: 'apartment', label: 'Apartments', desc: 'Modern urban living', gradient: 'from-blue-500 to-indigo-600' },
]

export function HomePage() {
  const navigate = useNavigate()
  const [town, setTown] = useState('')
  const [budget, setBudget] = useState('')
  const [selectedType, setSelectedType] = useState<PropertyType | ''>('')
  const [townSuggestions, setTownSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [budgetError, setBudgetError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [latestTab, setLatestTab] = useState<PropertyType>('house')
  const [latestIndex, setLatestIndex] = useState(0)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: async () => {
      const res = await frontendData.get('/properties?sort=newest&limit=8')
      return res.data.data as Property[]
    },
  })

  const { data: latestData, isLoading: latestLoading } = useQuery({
    queryKey: ['latest-by-type', latestTab],
    queryFn: async () => {
      const res = await frontendData.get(`/properties?sort=newest&type=${latestTab}&limit=6`)
      return res.data.data as Property[]
    },
  })

  // Reset slider position when tab changes
  useEffect(() => {
    setLatestIndex(0)
  }, [latestTab])

  const featured = featuredData?.filter((p) => p.featured) ?? []

  const LATEST_VISIBLE = 3
  const latestMaxIndex = Math.max(0, (latestData?.length ?? 0) - LATEST_VISIBLE)

  useEffect(() => {
    if (town.length > 1) {
      const matches = [...new Set([...HERO_TOWNS, ...sriLankaTowns])]
        .filter((t) => t.toLowerCase().startsWith(town.toLowerCase()))
      setTownSuggestions(matches.slice(0, 6))
      setShowSuggestions(matches.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }, [town])

  const handleBudgetChange = (value: string) => {
    const digits = value.replace(/[^\d]/g, '')
    setBudget(digits ? Number(digits).toLocaleString('en-US') : '')
    setBudgetError('')
  }

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const numericBudget = Number(budget.replace(/,/g, ''))
    if (!town.trim()) return
    if (!Number.isFinite(numericBudget) || numericBudget <= 0) {
      setBudgetError('Enter a budget greater than LKR 0.')
      return
    }

    setIsSubmitting(true)
    navigate(`/recommend?town=${encodeURIComponent(town)}&budget=${numericBudget}&type=${selectedType}`)
  }

  const visibleCards = 3
  const maxIndex = Math.max(0, (featured.length || 0) - visibleCards)

  return (
    <div>
      {/* Hero */}
      <section
        className="hero-banner relative min-h-[680px] overflow-hidden bg-cover bg-[center_35%] text-white md:min-h-[720px]"
        style={{ backgroundImage: `url(${heroBanner})` }}
      >
        <div className="hero-banner__overlay absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/45 to-slate-950/10" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950/20 to-transparent" />
        <div className="relative mx-auto max-w-[1510px] px-4 py-16 sm:px-6 md:py-20 lg:py-24">
         
          <div className="max-w-[1000px]">
            <span className="hero-banner__badge mb-7 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <MapPin size={14} className="text-amber-300" aria-hidden />
              Sri Lanka's trusted property marketplace
            </span>
            <div className="hero-banner__copy mb-9 max-w-3xl">
              <h1 className="mb-5 text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
                Find the right place<br />
                <span className="text-amber-300">for your dream life.</span>
              </h1>
              <p className="mb-9 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
                Discover houses, apartments and lands across Sri Lanka. Find your perfect property with the right location and budget.
              </p>
            </div>

            {/* Search form */}
            <form onSubmit={handleSearch} className="hero-banner__search rounded-3xl bg-white p-5 shadow-2xl md:p-6">
              <div className="mb-3 grid grid-cols-1 gap-4 md:grid-cols-[1.1fr_1.1fr_1fr]">
                {/* Town autocomplete */}
                <div className="relative">
                  <label htmlFor="hero-town" className="mb-2 flex items-center gap-1.5 px-1 text-xs font-semibold text-gray-700">
                    <MapPin size={15} className="text-primary-500" aria-hidden />
                    Location
                  </label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden />
                    <input
                      id="hero-town"
                      type="text"
                      value={town}
                      onChange={(e) => setTown(e.target.value)}
                      onFocus={() => town.length > 1 && setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      placeholder="Enter city or town"
                      required
                      autoComplete="off"
                      className="h-11 w-full rounded-xl border border-gray-200 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
                      aria-autocomplete="list"
                      aria-haspopup="listbox"
                      aria-controls="hero-town-suggestions"
                    />
                    {showSuggestions && (
                      <div id="hero-town-suggestions" ref={suggestionsRef} role="listbox" className="absolute left-0 top-full z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                        {townSuggestions.map((t) => (
                          <button key={t} type="button" role="option" aria-selected={town === t} onMouseDown={() => { setTown(t); setShowSuggestions(false) }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label htmlFor="hero-budget" className="mb-2 flex items-center gap-1.5 px-1 text-xs font-semibold text-gray-700">
                    <Calculator size={15} className="text-primary-500" aria-hidden />
                    Budget (LKR)
                  </label>
                  <input
                    id="hero-budget"
                    type="text"
                    inputMode="numeric"
                    value={budget}
                    onChange={(e) => handleBudgetChange(e.target.value)}
                    placeholder="Enter your budget"
                    aria-invalid={Boolean(budgetError)}
                    aria-describedby={budgetError ? 'hero-budget-error' : 'hero-budget-help'}
                    className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {budgetError ? (
                    <p id="hero-budget-error" role="alert" className="mt-1 px-1 text-xs text-red-600">{budgetError}</p>
                  ) : budget ? (
                    <p id="hero-budget-help" className="mt-1 px-1 text-xs text-gray-400">{formatLKR(Number(budget.replace(/,/g, '')))}</p>
                  ) : null}
                </div>

                {/* Property type */}
                <div>
                  <p className="mb-2 flex items-center gap-1.5 px-1 text-xs font-semibold text-gray-700">
                    <Building2 size={15} className="text-primary-500" aria-hidden />
                    Property type
                  </p>
                  <div className="flex gap-1.5">
                    {PROPERTY_TYPES.map(({ type, label }) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedType(selectedType === type ? '' : type)}
                        className={cn(
                          'flex-1 flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl border-2 text-xs font-medium transition-all duration-200',
                          selectedType === type
                            ? 'border-primary-700 bg-primary-50 text-primary-800'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-primary-200 hover:bg-primary-50'
                        )}
                        aria-pressed={selectedType === type}
                      >
                        <PropertyTypeIcon type={type} size={16} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                loading={isSubmitting}
                className="h-12 w-full rounded-2xl bg-[#075B49] text-base shadow-none hover:bg-[#064c3d]"
                size="lg"
                leftIcon={<Search size={22} />}
                disabled={!town.trim() || !budget || Boolean(budgetError)}
              >
                Find My Property
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Latest listings carousel by type */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header + tabs */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Latest listings</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Freshest properties, updated daily</p>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              {PROPERTY_TYPES.map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => setLatestTab(type)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                    latestTab === type
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  )}
                  aria-pressed={latestTab === type}
                >
                  <PropertyTypeIcon type={type} size={15} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Slider */}
          <div className="relative">
            {latestLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => <PropertyCardSkeleton key={i} />)}
              </div>
            ) : latestData && latestData.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
                  {latestData.slice(latestIndex, latestIndex + LATEST_VISIBLE).map((p) => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>

                {/* Nav arrows */}
                {latestData.length > LATEST_VISIBLE && (
                  <div className="flex items-center justify-center gap-3 mt-8">
                    <button
                      onClick={() => setLatestIndex(Math.max(0, latestIndex - 1))}
                      disabled={latestIndex === 0}
                      className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                      aria-label="Previous listings"
                    >
                      <ChevronLeft size={16} aria-hidden />
                    </button>

                    {/* Dot indicators */}
                    <div className="flex gap-1.5">
                      {Array.from({ length: latestMaxIndex + 1 }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setLatestIndex(i)}
                          className={cn(
                            'rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                            latestIndex === i
                              ? 'w-5 h-2 bg-primary-600'
                              : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                          )}
                          aria-label={`Go to slide ${i + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => setLatestIndex(Math.min(latestMaxIndex, latestIndex + 1))}
                      disabled={latestIndex >= latestMaxIndex}
                      className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                      aria-label="Next listings"
                    >
                      <ChevronRight size={16} aria-hidden />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 text-gray-400 dark:text-gray-600">
                <PropertyTypeIcon type={latestTab} size={40} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No {PROPERTY_TYPES.find(t => t.type === latestTab)?.label.toLowerCase()} listings yet.</p>
              </div>
            )}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => navigate(`/search?type=${latestTab}`)} rightIcon={<ArrowRight size={16} />}>
              View all {PROPERTY_TYPES.find(t => t.type === latestTab)?.label.toLowerCase()}
            </Button>
          </div>
        </div>
      </section>

      {/* Featured carousel */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured listings</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Hand-picked properties across Sri Lanka</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
                disabled={carouselIndex === 0}
                className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="Previous"
              >
                <ChevronLeft size={16} aria-hidden />
              </button>
              <button
                onClick={() => setCarouselIndex(Math.min(maxIndex, carouselIndex + 1))}
                disabled={carouselIndex >= maxIndex}
                className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="Next"
              >
                <ChevronRight size={16} aria-hidden />
              </button>
            </div>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <PropertyCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(featured.length > 0 ? featured : featuredData ?? [])
                .slice(carouselIndex, carouselIndex + visibleCards)
                .map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => navigate('/search')} rightIcon={<ArrowRight size={16} />}>
              View all listings
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">How Nestly works</h2>
            <p className="text-gray-500 dark:text-gray-400">Three simple steps to find your ideal property</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              { step: 1, icon: MapPin, title: 'Enter town & budget', desc: 'Tell us your target area and how much you can spend. Select house, land, or apartment.' },
              { step: 2, icon: TrendingUp, title: 'Get ranked places', desc: 'Our AI scores nearby areas by affordability, growth outlook, amenities, and distance.' },
              { step: 3, icon: CheckCircle, title: 'Buy with confidence', desc: 'Explore live listings, view price trend charts, and contact sellers directly.' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-primary-600 dark:text-primary-400" aria-hidden />
                </div>
                <div className="absolute top-5 left-[calc(50%+28px)] hidden md:block w-[calc(100%-56px)] h-px bg-gray-200 dark:bg-gray-700 last:hidden" />
                <span className="inline-block w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold mb-3 flex items-center justify-center">{step}</span>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button onClick={() => navigate('/recommend')} size="lg">
              Try recommendations now
            </Button>
          </div>
        </div>
      </section>

      {/* Popular towns */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Popular towns</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {POPULAR_TOWNS.map((townName) => (
              <Link
                key={townName}
                to={`/search?town=${encodeURIComponent(townName)}`}
                className="group bg-white dark:bg-gray-900 rounded-card border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-card-hover transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} className="text-primary-600 dark:text-primary-400" aria-hidden />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">{townName}</p>
                  <p className="text-xs text-gray-400">View listings</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
