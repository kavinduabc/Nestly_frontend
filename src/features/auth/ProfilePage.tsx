import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { User } from 'lucide-react'
import { Button } from '@/components/Button'
import { useAuthStore } from './authStore'
import { useUIStore } from '@/app/uiStore'
import frontendData from '@/lib/frontendData'
import { getInitials } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  phone: z.string().optional(),
  town: z.string().optional(),
})
type Form = z.infer<typeof schema>

export function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const { addToast } = useUIStore()

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name || '', phone: user?.phone || '', town: user?.town || '' },
  })

  const mutation = useMutation({
    mutationFn: async (data: Form) => {
      const res = await frontendData.put('/user/profile', data)
      return res.data
    },
    onSuccess: (data) => {
      updateUser(data)
      addToast({ type: 'success', title: 'Profile updated' })
    },
    onError: () => addToast({ type: 'error', title: 'Failed to update profile' }),
  })

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My profile</h1>

      <div className="bg-white dark:bg-gray-900 rounded-card border border-gray-100 dark:border-gray-800 shadow-card p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-xl font-bold">
            {user ? getInitials(user.name) : <User size={24} />}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div>
            <label htmlFor="p-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full name</label>
            <input {...register('name')} id="p-name" type="text"
              className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="p-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
            <input {...register('phone')} id="p-phone" type="tel"
              className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label htmlFor="p-town" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Town</label>
            <input {...register('town')} id="p-town" type="text"
              className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="pt-2">
            <Button type="submit" loading={mutation.isPending}>Save changes</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
