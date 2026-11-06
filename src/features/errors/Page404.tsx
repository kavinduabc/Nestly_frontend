import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'
import { Button } from '@/components/Button'
import { Logo } from '@/components/Logo'

export function Page404() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-950 text-center">
      <Logo variant="symbol" size={56} className="mb-6" />
      <p className="text-8xl font-bold text-primary-600 dark:text-primary-400 mb-2">404</p>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page not found</h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" leftIcon={<Search size={16} />} onClick={() => window.history.back()}>
          Go back
        </Button>
        <Link to="/">
          <Button leftIcon={<Home size={16} />}>Go home</Button>
        </Link>
      </div>
    </div>
  )
}
