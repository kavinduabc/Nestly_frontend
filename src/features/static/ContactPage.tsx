import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/Button'
import { useUIStore } from '@/app/uiStore'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(5),
  message: z.string().min(20),
})
type Form = z.infer<typeof schema>

export function ContactPage() {
  const { addToast } = useUIStore()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: Form) => {
    await new Promise(r => setTimeout(r, 800))
    addToast({ type: 'success', title: 'Message sent!', description: "We'll get back to you within 24 hours." })
    reset()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Contact us</h1>
        <p className="text-gray-500 dark:text-gray-400">Have a question? We'd love to hear from you.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="space-y-4">
          {[
            { icon: Mail, label: 'Email', value: 'hello@nestly.lk' },
            { icon: Phone, label: 'Phone', value: '+94 11 234 5678' },
            { icon: MapPin, label: 'Address', value: '42 Bauddhaloka Mawatha, Colombo 7' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="md:col-span-2 bg-white dark:bg-gray-900 rounded-card border border-gray-100 dark:border-gray-800 shadow-card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="c-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input {...register('name')} id="c-name" type="text"
                  className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                {errors.name && <p className="text-xs text-red-500 mt-1">Name required</p>}
              </div>
              <div>
                <label htmlFor="c-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input {...register('email')} id="c-email" type="email"
                  className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                {errors.email && <p className="text-xs text-red-500 mt-1">Valid email required</p>}
              </div>
            </div>
            <div>
              <label htmlFor="c-subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
              <input {...register('subject')} id="c-subject" type="text"
                className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label htmlFor="c-msg" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
              <textarea {...register('message')} id="c-msg" rows={5}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
              {errors.message && <p className="text-xs text-red-500 mt-1">Message must be at least 20 characters</p>}
            </div>
            <Button type="submit" loading={isSubmitting}>Send message</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
