import { useUIStore } from '@/app/uiStore'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const icons = {
  success: { Icon: CheckCircle2, cls: 'text-emerald-500' },
  error: { Icon: AlertCircle, cls: 'text-red-500' },
  info: { Icon: Info, cls: 'text-blue-500' },
  warning: { Icon: AlertTriangle, cls: 'text-amber-500' },
}

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore()

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full px-4"
      role="log"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => {
        const { Icon, cls } = icons[toast.type]
        return (
          <div
            key={toast.id}
            className={cn(
              'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 flex items-start gap-3 animate-in slide-in-from-right-5'
            )}
            role="alert"
          >
            <Icon size={18} className={cls} aria-hidden />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{toast.title}</p>
              {toast.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{toast.description}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="Dismiss notification"
            >
              <X size={14} aria-hidden />
            </button>
          </div>
        )
      })}
    </div>
  )
}
