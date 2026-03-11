import { Building2, GitBranch, Circle } from 'lucide-react'
import { cn } from '@/lib/cn'

interface HeaderProps {
  name: string
  branch: string
  dirty: boolean
}

export default function Header({ name, branch, dirty }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-surface-200/60 bg-white/80 backdrop-blur-md px-5">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent text-white">
          <Building2 className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold text-surface-900">
          Product OS Workspace{name ? ` — ${name}` : ''}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {branch && branch !== 'unknown' && (
          <div className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium font-mono',
            branch === 'main'
              ? 'bg-surface-100 text-surface-500'
              : 'bg-brand-50 text-brand-600',
          )}>
            <GitBranch className="h-3 w-3" />
            {branch}
            {dirty && <Circle className="h-1.5 w-1.5 fill-warning text-warning" />}
          </div>
        )}
      </div>
    </header>
  )
}
