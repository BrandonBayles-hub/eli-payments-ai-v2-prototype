import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Box, UserCircle, Sparkles, ListTodo,
  PanelLeftClose, PanelLeft, HelpCircle, ExternalLink, Palette,
  CheckCircle2, AlertCircle, CloudOff,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import type { SyncStatus } from '@/App'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  prototypeCount: number
  syncStatus: SyncStatus | null
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', countKey: null as string | null },
  { to: '/prototypes', icon: Box, label: 'Prototypes', countKey: 'prototypes' },
  { to: '/tasks', icon: ListTodo, label: 'Tasks', countKey: null },
  { to: '/context', icon: UserCircle, label: 'My Context', countKey: null },
  { to: '/skills', icon: Sparkles, label: 'Skills', countKey: null },
]

export default function Sidebar({ collapsed, onToggle, prototypeCount, syncStatus }: SidebarProps) {
  const counts: Record<string, number> = {
    prototypes: prototypeCount,
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-14 bottom-0 z-30 flex flex-col border-r border-surface-200/60 bg-white/80 backdrop-blur-md transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]',
        collapsed ? 'w-[64px]' : 'w-[220px]',
      )}
    >
      <nav className="py-4 px-2 space-y-1">
        {navItems.map(({ to, icon: Icon, label, countKey }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-surface-500 hover:bg-surface-100 hover:text-surface-900',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[55%] rounded-full bg-brand-500" />
                )}
                <Icon className="h-[18px] w-[18px] shrink-0 ml-1" />
                {!collapsed && <span className="flex-1">{label}</span>}
                {!collapsed && countKey && counts[countKey] > 0 && (
                  <span className="rounded-full bg-brand-100 text-brand-600 px-2 py-0.5 text-xs font-semibold">
                    {counts[countKey]}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        <div className="pt-1 border-t border-surface-100 mt-1">
          <a
            href="/onboarding-guide"
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-surface-500 hover:bg-surface-100 hover:text-surface-900 transition-all duration-200"
          >
            <HelpCircle className="h-[18px] w-[18px] shrink-0 ml-1" />
            {!collapsed && (
              <>
                <span className="flex-1">Onboarding Guide</span>
                <ExternalLink className="h-3 w-3 text-surface-300" />
              </>
            )}
          </a>
        </div>
      </nav>

      {/* Shared Repos Sync Status */}
      {syncStatus && !collapsed && (
        <div className="px-3 mt-auto mb-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-400 font-mono px-1 mb-1.5">Sync Status</p>
          <SyncRow label="Product Spec Kit" info={syncStatus['product-spec-kit']} />
          {syncStatus['workspace-template']?.hasUpstream && (
            <UpstreamRow label="PM OS Workspace" info={syncStatus['workspace-template']} />
          )}
          <SyncRow label="Prototype Sandbox" info={syncStatus['prototype-sandbox']} />
          <a
            href="https://cautious-adventure-v9q5545.pages.github.io/?path=/docs/welcome--docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-2 py-1 ml-5 text-[10px] text-brand-500 hover:text-brand-700 hover:bg-brand-50/50 transition-colors"
          >
            <Palette className="h-3 w-3 shrink-0" />
            <span>View Storybook</span>
            <ExternalLink className="h-2.5 w-2.5 opacity-50" />
          </a>
        </div>
      )}
      {syncStatus && collapsed && (
        <div className="mt-auto mb-1 flex flex-col items-center gap-1 px-2">
          <SyncDot info={syncStatus['product-spec-kit']} title="Product Spec Kit" />
          {syncStatus['workspace-template']?.hasUpstream && (
            <UpstreamDot info={syncStatus['workspace-template']} />
          )}
          <SyncDot info={syncStatus['prototype-sandbox']} title="Prototype Sandbox" />
          <a
            href="https://cautious-adventure-v9q5545.pages.github.io/?path=/docs/welcome--docs"
            target="_blank"
            rel="noopener noreferrer"
            title="View Sandbox Storybook"
            className="rounded-full p-1.5 text-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
          >
            <Palette className="h-3 w-3" />
          </a>
        </div>
      )}

      <div className="border-t border-surface-200/60 p-2">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-xl p-2 text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors"
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  )
}

interface RepoInfo {
  exists: boolean
  behind: number
}

function SyncRow({ label, info }: { label: string; info: RepoInfo }) {
  if (!info.exists) {
    return (
      <div
        className="rounded-lg px-2 py-1.5 text-xs bg-red-50 cursor-help"
        title={`${label} is not cloned as a sibling folder. Re-run setup.sh or clone it: git clone git@github.com:entrata-product/${label === 'Spec Kit' ? 'product-spec-kit' : 'prototype-sandbox'}.git`}
      >
        <div className="flex items-center gap-2">
          <CloudOff className="h-3 w-3 text-red-400 shrink-0" />
          <span className="text-red-600 truncate flex-1 font-medium">{label}</span>
          <span className="text-[10px] text-red-400 font-mono">missing</span>
        </div>
        <p className="text-[10px] text-red-400 mt-0.5 ml-5">Clone or re-run setup</p>
      </div>
    )
  }
  if (info.behind > 0) {
    return (
      <div className="rounded-lg px-2 py-1.5 text-xs bg-amber-50 group" title={`Open Source Control → select ${label} from the repo dropdown → ... → Pull`}>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-3 w-3 text-amber-500 shrink-0" />
          <span className="text-amber-700 truncate flex-1 font-medium">{label}</span>
          <span className="text-[10px] text-amber-600 font-mono font-semibold">{info.behind} behind</span>
        </div>
        <p className="text-[10px] text-amber-500 mt-0.5 ml-5">Pull to update</p>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs group">
      <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
      <span className="text-surface-500 truncate flex-1">{label}</span>
      <span className="text-[10px] text-emerald-500 font-mono">current</span>
    </div>
  )
}

function SyncDot({ info, title }: { info: RepoInfo; title: string }) {
  if (!info.exists) {
    return (
      <div title={`${title}: missing — clone or re-run setup.sh`} className="rounded-full p-1.5 bg-red-100">
        <CloudOff className="h-3 w-3 text-red-400" />
      </div>
    )
  }
  if (info.behind > 0) {
    return (
      <div title={`${title}: ${info.behind} commits behind`} className="rounded-full p-1.5 bg-amber-100 animate-pulse">
        <AlertCircle className="h-3 w-3 text-amber-500" />
      </div>
    )
  }
  return (
    <div title={`${title}: up to date`} className="rounded-full p-1.5 bg-emerald-50">
      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
    </div>
  )
}

interface UpstreamInfo {
  hasUpstream: boolean
  behind: number
}

function UpstreamRow({ label, info }: { label: string; info: UpstreamInfo }) {
  if (info.behind > 0) {
    return (
      <div className="rounded-lg px-2 py-1.5 text-xs bg-blue-50 mt-0.5">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-3 w-3 text-blue-500 shrink-0" />
          <span className="text-blue-700 truncate flex-1 font-medium">{label}</span>
          <span className="text-[10px] text-blue-600 font-mono font-semibold">{info.behind} update{info.behind !== 1 ? 's' : ''}</span>
        </div>
        <p className="text-[10px] text-blue-500 mt-0.5 ml-5">Type <code className="font-mono bg-blue-100 px-1 rounded">/update-workspace</code> in Cursor chat</p>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs">
      <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
      <span className="text-surface-500 truncate flex-1">{label}</span>
      <span className="text-[10px] text-emerald-500 font-mono">current</span>
    </div>
  )
}

function UpstreamDot({ info }: { info: UpstreamInfo }) {
  if (info.behind > 0) {
    return (
      <div title={`Workspace template: ${info.behind} updates available`} className="rounded-full p-1.5 bg-blue-100 animate-pulse">
        <AlertCircle className="h-3 w-3 text-blue-500" />
      </div>
    )
  }
  return (
    <div title="Workspace template: up to date" className="rounded-full p-1.5 bg-emerald-50">
      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
    </div>
  )
}
