import { Suspense, lazy, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { PrototypeProvider } from '@sandbox-components/prototype'
import type { PrototypeEntry } from '@/lib/prototype-discovery'
import '@/styles/sandbox-bridge.css'

interface PrototypeViewProps {
  prototypes: PrototypeEntry[]
}

export default function PrototypeView({ prototypes }: PrototypeViewProps) {
  const { name } = useParams<{ name: string }>()
  const proto = prototypes.find((p) => p.slug === name)

  const LazyComponent = useMemo(() => {
    if (!proto) return null
    return lazy(proto.component)
  }, [proto])

  if (!proto || !LazyComponent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-lg font-semibold text-surface-900">Prototype not found</h2>
        <p className="text-sm text-surface-500 mt-2">
          No prototype named "{name}" exists in your workspace.
        </p>
        <Link to="/prototypes" className="mt-4 text-sm text-brand-600 hover:text-brand-700">
          ← Back to prototypes
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="sticky top-0 z-50 flex items-center h-10 px-4 bg-surface-50 border-b border-surface-200 shrink-0">
        <Link
          to="/prototypes"
          className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to workspace
        </Link>
      </div>
      <div className="sandbox-prototype flex-1 w-full">
        <PrototypeProvider>
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
                <span className="ml-2 text-sm text-surface-500">Loading prototype...</span>
              </div>
            }
          >
            <LazyComponent />
          </Suspense>
        </PrototypeProvider>
      </div>
    </div>
  )
}
