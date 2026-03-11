import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import { cn } from '@/lib/cn'
import type { SyncStatus } from '@/App'

interface AppLayoutProps {
  name: string
  prototypeCount: number
  branch: string
  dirty: boolean
  syncStatus: SyncStatus | null
}

export default function AppLayout({ name, prototypeCount, branch, dirty, syncStatus }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-surface-50 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="ambient-blob" style={{ width: 500, height: 500, top: -100, right: -100, background: '#e8dcff' }} />
        <div className="ambient-blob" style={{ width: 400, height: 400, bottom: -50, left: -80, background: '#ffeaf0', animationDelay: '-8s' }} />
        <div className="ambient-blob" style={{ width: 350, height: 350, top: '40%', left: '50%', background: '#e0f0ff', animationDelay: '-16s' }} />
        <div className="ambient-blob" style={{ width: 300, height: 300, bottom: '20%', right: '30%', background: '#fff8ee', animationDelay: '-12s' }} />
      </div>

      <Header name={name} branch={branch} dirty={dirty} />
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        prototypeCount={prototypeCount}
        syncStatus={syncStatus}
      />
      <main
        className={cn(
          'relative z-10 pt-14 transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]',
          collapsed ? 'pl-[64px]' : 'pl-[220px]',
        )}
      >
        <div className="mx-auto max-w-[1200px] p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
