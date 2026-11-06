import { Link } from 'react-router-dom'
import { ShieldOff, Home } from 'lucide-react'
import { Button } from '@/components/Button'

export function Page403() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-950 text-center">
      <div className="w-20 h-20 rounded-2xl bg-red-50 dark:bg-red-950 flex items-center justify-center mb-6">
        <ShieldOff size={36} className="text-red-500" aria-hidden />
      </div>
      <p className="text-8xl font-bold text-red-500 mb-2">403</p>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access denied</h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">
        You don't have permission to view this page. Please sign in with the correct account.
      </p>
      <Link to="/">
        <Button leftIcon={<Home size={16} />}>Go home</Button>
      </Link>
    </div>
  )
}
