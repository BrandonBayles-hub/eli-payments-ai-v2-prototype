import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Box, GitBranch, Info, Terminal, Search, Copy, Check } from 'lucide-react'
import type { PrototypeEntry } from '@/lib/prototype-discovery'
import { getPrototypeIcon, getPrototypeColor } from '@/lib/metadata'
import { cn } from '@/lib/cn'

interface PrototypesPageProps {
  prototypes: PrototypeEntry[]
  branch: string
}

function PromptButton({ prompt, label, icon }: { prompt: string; label: string; icon: React.ReactNode }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-2 rounded-xl bg-white border border-surface-200 px-3.5 py-2.5 text-left group hover:border-brand-300 hover:shadow-md hover:shadow-brand-500/5 transition-all"
    >
      <span className="text-brand-400 shrink-0">{icon}</span>
      <span className="text-xs font-medium text-surface-600">{label}</span>
      {copied ? (
        <Check className="h-3 w-3 text-green-500 shrink-0" />
      ) : (
        <Copy className="h-3 w-3 text-surface-300 group-hover:text-brand-400 shrink-0 transition-colors" />
      )}
    </button>
  )
}

function CritiquePrompt() {
  return <PromptButton prompt="/design-critique Review my prototype" label="Run Design Critique" icon={<Search className="h-3.5 w-3.5" />} />
}

function BuildPrompt() {
  return <PromptButton prompt="/create-prototype Build a prototype for [your feature]" label="Build New Prototype" icon={<Terminal className="h-3.5 w-3.5" />} />
}

export default function PrototypesPage({ prototypes, branch }: PrototypesPageProps) {
  const isMain = !branch || branch === 'main' || branch === 'unknown'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-surface-900">Prototypes</h1>
          <p className="text-sm text-surface-400 mt-0.5">
            Auto-discovered from <span className="font-mono text-brand-500 text-xs">./prototypes/</span>
          </p>
        </div>
        {branch && branch !== 'unknown' && (
          <div className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium font-mono',
            isMain ? 'bg-surface-100 text-surface-500' : 'bg-brand-50 text-brand-600 ring-1 ring-brand-200',
          )}>
            <GitBranch className="h-3 w-3" />
            {branch}
          </div>
        )}
      </div>

      {!isMain && (
        <div className="rounded-xl p-3.5 flex items-start gap-3 bg-brand-50/60 border border-brand-200/50">
          <Info className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
          <p className="text-xs text-brand-600">
            Showing prototypes on <span className="font-mono font-semibold">{branch}</span>. Switch to <span className="font-mono">main</span> to see all.
          </p>
        </div>
      )}

      {prototypes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-accent/5 p-6 mb-5">
            <Terminal className="h-10 w-10 text-brand-400" />
          </div>
          <h3 className="text-lg font-semibold text-surface-900">No prototypes yet</h3>
          <p className="text-sm text-surface-400 mt-2 max-w-md">
            {isMain
              ? 'Open Cursor chat and use the /create-prototype skill to get started. Prototypes are auto-discovered from the ./prototypes/ folder.'
              : `No prototypes on branch ${branch}. Build one or switch to main.`
            }
          </p>
          <div className="mt-6 flex items-center gap-2 rounded-xl bg-surface-50 border border-surface-200 px-4 py-2.5">
            <span className="text-xs text-surface-400 font-mono">&gt;</span>
            <span className="text-sm text-surface-600 font-mono">/create-prototype Build a prototype for [your feature]</span>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            {prototypes.map((proto) => {
              const Icon = getPrototypeIcon(proto.slug)
              const color = getPrototypeColor(proto.slug)
              return (
                <Link
                  key={proto.slug}
                  to={proto.path}
                  className="card card-hover rounded-2xl p-5 block group"
                >
                  <div className={cn('inline-flex rounded-xl p-2.5', color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-surface-900 mt-3 group-hover:text-brand-600 transition-colors">
                    {proto.name}
                  </h3>
                  <p className="text-xs text-surface-400 mt-1.5 line-clamp-2">{proto.description}</p>
                </Link>
              )
            })}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <CritiquePrompt />
            <BuildPrompt />
          </div>
        </>
      )}
    </div>
  )
}
