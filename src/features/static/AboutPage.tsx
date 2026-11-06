import { Logo } from '@/components/Logo'
import { MapPin, TrendingUp, Shield, Users } from 'lucide-react'

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <Logo variant="symbol" size={64} className="mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">About Nestly</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
          Sri Lanka's most intelligent property marketplace. We combine live listings with AI-powered area recommendations to help you find the right place for your budget.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {[
          { icon: MapPin, title: 'Nationwide coverage', desc: 'Listings across all provinces — from Colombo to Jaffna, coast to hills.' },
          { icon: TrendingUp, title: 'Smart recommendations', desc: 'Our AI ranks areas by affordability, growth outlook, amenities, and distance from your target town.' },
          { icon: Shield, title: 'Verified listings', desc: 'Every listing goes through our approval process to ensure quality and accuracy.' },
          { icon: Users, title: 'For buyers & sellers', desc: 'Buyers find their dream property. Sellers reach serious buyers faster.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white dark:bg-gray-900 rounded-card border border-gray-100 dark:border-gray-800 shadow-card p-6 flex gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center flex-shrink-0">
              <Icon size={20} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-primary-600 to-teal-700 rounded-2xl p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Ready to find your place?</h2>
        <p className="text-white/80 mb-4">Join thousands of Sri Lankans already using Nestly.</p>
        <a href="/register" className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
          Get started free
        </a>
      </div>
    </div>
  )
}
