import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, User, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/Button'
import { useAuthStore } from './authStore'
import { useUIStore } from '@/app/uiStore'
import frontendData from '@/lib/frontendData'
import { cn } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Must be at least 8 characters').regex(/[A-Z]/, 'Include at least one uppercase letter').regex(/[0-9]/, 'Include at least one number'),
  role: z.enum(['buyer', 'seller']),
})
type FormData = z.infer<typeof schema>

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const strength = checks.filter(Boolean).length
  const labels = ['Weak', 'Fair', 'Good', 'Strong']
  const colors = ['bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-emerald-500']

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={cn('h-1 flex-1 rounded-full transition-colors', i < strength ? colors[strength - 1] : 'bg-gray-200 dark:bg-gray-700')} />
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-1">{labels[strength - 1] || 'Too weak'}</p>
    </div>
  )
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { addToast } = useUIStore()
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, watch, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'buyer' },
  })

  const password = watch('password', '')

  const registerMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await frontendData.post('/auth/register', data)
      return res.data
    },
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken)
      addToast({ type: 'success', title: 'Account created!', description: `Welcome to Nestly, ${data.user.name}` })
      navigate(data.user.role === 'seller' ? '/seller/dashboard' : '/')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed'
      addToast({ type: 'error', title: msg })
    },
  })

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo variant="symbol" size={56} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Join thousands of Sri Lankan property seekers</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-card border border-gray-100 dark:border-gray-800 shadow-card p-6">
          <form onSubmit={handleSubmit((d) => registerMutation.mutate(d))} noValidate className="space-y-4">
            {/* Role picker */}
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I am a…</label>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { value: 'buyer', label: 'Buyer', desc: 'Looking for property', Icon: User },
                      { value: 'seller', label: 'Seller', desc: 'Listing property', Icon: ShoppingBag },
                    ] as const).map(({ value, label, desc, Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => field.onChange(value)}
                        className={cn(
                          'p-3 rounded-xl border-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                          field.value === value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        )}
                        aria-pressed={field.value === value}
                      >
                        <Icon size={20} className={field.value === value ? 'text-primary-600' : 'text-gray-400'} aria-hidden />
                        <p className="font-semibold text-sm mt-1 text-gray-900 dark:text-white">{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            />

            <div>
              <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full name</label>
              <input {...register('name')} id="reg-name" type="text" autoComplete="name" placeholder="Priya Wickramasinghe"
                className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input {...register('email')} id="reg-email" type="email" autoComplete="email" placeholder="you@example.com"
                className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone <span className="text-gray-400">(optional)</span></label>
              <input {...register('phone')} id="reg-phone" type="tel" autoComplete="tel" placeholder="+94 77 123 4567"
                className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <input {...register('password')} id="reg-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="••••••••"
                  className="w-full h-10 pl-3 pr-10 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
                </button>
              </div>
              <PasswordStrength password={password} />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" size="lg" loading={registerMutation.isPending}>
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
