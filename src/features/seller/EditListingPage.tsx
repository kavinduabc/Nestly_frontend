import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/Button'
import frontendData from '@/lib/frontendData'
import { formatLKR } from '@/lib/formatters'
import type { Property } from '@/types'

export function EditListingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState<Property | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (id) frontendData.get<Property>(`/properties/${id}`).then((result) => setProperty(result.data))
  }, [id])

  const update = (field: keyof Property, value: string | number) => {
    setProperty((current) => current ? { ...current, [field]: value } : current)
  }

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!property) return
    setSaving(true)
    await frontendData.put(`/properties/${property.id}`, { ...property })
    setSaving(false)
    navigate('/seller/listings')
  }

  return (
    <div className="p-6">
      <Link to="/seller/listings" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeft size={16} /> Back to listings
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Listing</h1>
      {property ? (
        <form onSubmit={save} className="max-w-2xl bg-white dark:bg-gray-900 rounded-card border border-gray-100 dark:border-gray-800 shadow-card p-6 space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Title<input value={property.title} onChange={(event) => update('title', event.target.value)} className="mt-1 w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" /></label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Description<textarea value={property.description} onChange={(event) => update('description', event.target.value)} rows={5} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" /></label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Price ({formatLKR(property.price)})<input type="number" value={property.price} onChange={(event) => update('price', Number(event.target.value))} className="mt-1 w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" /></label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Town<input value={property.town} onChange={(event) => update('town', event.target.value)} className="mt-1 w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" /></label>
          <Button type="submit" loading={saving} leftIcon={<Save size={16} />}>Save changes</Button>
        </form>
      ) : <p className="text-gray-500">Listing not found.</p>}
    </div>
  )
}
