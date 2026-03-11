import { Suspense, lazy, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { PrototypeProvider, PrototypeHeader } from '@sandbox-components/prototype'
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
      <PrototypeProvider>
        <div className="sticky top-0 z-50 shrink-0">
          <PrototypeHeader name={proto.name} />
        </div>
        <div className="sandbox-prototype flex-1 w-full">
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
        </div>
      </PrototypeProvider>
    </div>
  )
}
