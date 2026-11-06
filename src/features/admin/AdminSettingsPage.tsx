import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button } from '@/components/Button'
import frontendData from '@/lib/frontendData'
import type { PlatformSettings } from '@/types'

export function AdminSettingsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-settings'], queryFn: async () => (await frontendData.get('/admin/settings')).data as PlatformSettings })
  const [settings, setSettings] = useState<Partial<PlatformSettings>>({})
  useEffect(() => { if (data) setSettings(data) }, [data])
  const save = useMutation({ mutationFn: () => frontendData.put('/admin/settings', settings) })
  const update = (field: keyof PlatformSettings, value: string | boolean | number) => setSettings((current) => ({ ...current, [field]: value }))
  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1><p className="mt-1 text-sm text-gray-500">Manage platform defaults.</p></div>
      <form className="bg-white dark:bg-gray-900 rounded-card border border-gray-100 dark:border-gray-800 shadow-card p-5 space-y-5" onSubmit={(event) => { event.preventDefault(); save.mutate() }}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Site name<input value={settings.siteName ?? ''} onChange={(event) => update('siteName', event.target.value)} disabled={isLoading} className="mt-1 w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" /></label>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Contact email<input type="email" value={settings.contactEmail ?? ''} onChange={(event) => update('contactEmail', event.target.value)} disabled={isLoading} className="mt-1 w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" /></label>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200"><input type="checkbox" checked={settings.listingApprovalRequired ?? false} onChange={(event) => update('listingApprovalRequired', event.target.checked)} /> Require listing approval</label>
        <Button type="submit" loading={save.isPending}>Save changes</Button>
      </form>
    </div>
  )
}
