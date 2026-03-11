import { Link } from 'react-router-dom'
import {
  Box, UserCircle, ArrowRight, GitBranch,
  Rocket, Terminal, RefreshCw, Copy, Check,
  Wand2, ListTodo, CloudOff,
} from 'lucide-react'
import { useState } from 'react'
import type { MeContext } from '@/lib/context-parser'
import { isUnconfigured } from '@/lib/context-parser'
import type { PrototypeEntry } from '@/lib/prototype-discovery'
import type { SyncStatus } from '@/App'
import { getPrototypeIcon, getPrototypeColor } from '@/lib/metadata'
import { cn } from '@/lib/cn'

interface HomePageProps {
  me: MeContext
  prototypes: PrototypeEntry[]
  git: { branch: string; dirty: boolean; changedFiles: number }
  syncStatus: SyncStatus | null
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const PROMPT_GUIDES = [
  { prompt: '/create-prototype Build a prototype for [your feature]', label: 'Build Prototype', icon: Terminal },
  { prompt: '/git-coach I need help with Git', label: 'Git Help', icon: Wand2 },
]

export default function HomePage({ me, prototypes, git, syncStatus }: HomePageProps) {
  const displayName = me.name || 'there'
  const unconfigured = isUnconfigured(me)

  const missingRepos = syncStatus
    ? (['product-spec-kit', 'prototype-sandbox'] as const)
        .filter((k) => syncStatus[k] && !syncStatus[k].exists)
    : []

  const outdatedSharedRepos = syncStatus
    ? (['product-spec-kit', 'prototype-sandbox'] as const)
        .filter((k) => syncStatus[k]?.exists && syncStatus[k]?.behind > 0)
        .map((k) => ({ name: k, behind: syncStatus[k].behind }))
    : []

  const workspaceUpdates = syncStatus?.['workspace-template']?.hasUpstream && syncStatus['workspace-template'].behind > 0
    ? syncStatus['workspace-template'].behind
    : 0

  return (
    <div className="space-y-6">
      {/* Missing Repos Banner */}
      {missingRepos.length > 0 && (
        <div className="rounded-2xl p-4 bg-gradient-to-r from-red-50 via-rose-50/80 to-red-50 border border-red-200/60 flex items-start gap-3 shadow-sm">
          <div className="rounded-xl bg-gradient-to-br from-red-400 to-rose-500 p-2.5 shrink-0 shadow-md shadow-red-400/20">
            <CloudOff className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-surface-900">
              {missingRepos.length === 1 ? 'Shared repo missing' : 'Shared repos missing'}
            </p>
            <div className="text-xs text-surface-500 mt-1 space-y-0.5">
              {missingRepos.map((name) => (
                <span key={name} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                  <span className="font-semibold text-surface-700">{name}</span>
                </span>
              ))}
            </div>
            <div className="text-xs text-surface-500 mt-2.5 bg-white/60 rounded-lg px-3 py-2 space-y-1">
              <p className="font-semibold text-surface-700">How to fix:</p>
              <p>These repos should be sibling folders next to your workspace. If they&apos;re missing, clone them:</p>
              <div className="mt-1.5 space-y-1">
                {missingRepos.map((name) => (
                  <code key={name} className="block font-mono bg-red-100/60 text-red-700 px-2 py-1 rounded text-[11px]">
                    git clone git@github.com:entrata-product/{name}.git
                  </code>
                ))}
              </div>
              <p className="mt-1.5 text-surface-400">Or re-run <code className="font-mono bg-surface-100 px-1 rounded">setup.sh</code> to set up everything fresh.</p>
            </div>
          </div>
        </div>
      )}

      {/* Shared Repos Sync Banner */}
      {outdatedSharedRepos.length > 0 && (
        <div className="rounded-2xl p-4 bg-gradient-to-r from-amber-50 via-orange-50/80 to-amber-50 border border-amber-200/60 flex items-start gap-3 shadow-sm">
          <div className="rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 p-2.5 shrink-0 shadow-md shadow-amber-400/20">
            <RefreshCw className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-surface-900">Shared repo updates available</p>
            <div className="text-xs text-surface-500 mt-1 space-y-0.5">
              {outdatedSharedRepos.map(({ name, behind }) => (
                <span key={name} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span><span className="font-semibold text-surface-700">{name}</span> — {behind} new commit{behind !== 1 ? 's' : ''}</span>
                </span>
              ))}
            </div>
            <div className="text-xs text-surface-500 mt-2.5 bg-white/60 rounded-lg px-3 py-2 space-y-1">
              <p className="font-semibold text-surface-700">How to pull:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-surface-500">
                <li>Open <strong>Source Control</strong> in Cursor (branch icon in the left sidebar)</li>
                <li>At the top of the panel, click the <strong>repo dropdown</strong> and select the repo that needs updating</li>
                <li>Click the <strong>...</strong> menu → <strong>Pull</strong></li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Workspace Template Update Banner */}
      {workspaceUpdates > 0 && (
        <div className="rounded-2xl p-4 bg-gradient-to-r from-blue-50 via-indigo-50/80 to-blue-50 border border-blue-200/60 flex items-start gap-3 shadow-sm">
          <div className="rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 p-2.5 shrink-0 shadow-md shadow-blue-400/20">
            <RefreshCw className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-surface-900">Workspace template update available</p>
            <p className="text-xs text-surface-500 mt-1">{workspaceUpdates} platform update{workspaceUpdates !== 1 ? 's' : ''} — bug fixes, UI improvements, or new features for your workspace.</p>
            <div className="text-xs text-surface-500 mt-2.5 bg-white/60 rounded-lg px-3 py-2">
              <p>Type <code className="font-mono bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[11px]">/update-workspace</code> in Cursor chat to update safely. Your personal files are never overwritten.</p>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 text-white relative overflow-hidden shadow-lg shadow-brand-500/20 border-0">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/[0.06] rounded-full -translate-y-36 translate-x-36" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/[0.04] rounded-full translate-y-28 -translate-x-28" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
        <div className="relative z-10">
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider font-mono mb-1">Product OS Workspace</p>
          <h1 className="text-2xl font-bold tracking-tight">
            {getGreeting()}, {displayName}
          </h1>
          {me.productArea ? (
            <p className="mt-1 text-sm text-white/60">{me.role} &middot; {me.productArea}</p>
          ) : (
            <p className="mt-1 text-sm text-white/40">Set up your profile to personalize this workspace</p>
          )}

          <div className="flex items-center gap-3 mt-5">
            <StatPill value={prototypes.length} label="Prototypes" />
            {git.branch && git.branch !== 'unknown' && (
              <div className="flex items-center gap-2 bg-white/[0.08] backdrop-blur-sm rounded-xl px-3.5 py-2">
                <GitBranch className="h-3.5 w-3.5 text-white/50" />
                <span className="text-xs font-medium font-mono">{git.branch}</span>
                {git.dirty && (
                  <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Onboarding Banner */}
      {unconfigured && (
        <div className="rounded-2xl p-5 bg-gradient-to-r from-brand-50 via-white to-accent-soft border border-brand-200/60 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 p-3 text-white shrink-0 shadow-md shadow-brand-500/20">
              <Rocket className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-surface-900">Welcome — let's set up your workspace</p>
              <p className="text-xs text-surface-400 mt-0.5">
                Open Cursor chat and run the onboarding skill. It walks you through everything step by step.
              </p>
            </div>
          </div>
          <div className="mt-4 ml-[60px]">
            <PromptCopy prompt="/first-run" />
          </div>
        </div>
      )}

      {/* Prototypes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Your Prototypes</h2>
          {prototypes.length > 0 && (
            <Link to="/prototypes" className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1 font-medium">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
        {prototypes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-surface-200 bg-white/60 backdrop-blur-sm p-8">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-accent/5 p-5 mb-4">
                <Terminal className="h-8 w-8 text-brand-400" />
              </div>
              <h3 className="text-base font-semibold text-surface-900">Build your first prototype</h3>
              <p className="text-sm text-surface-400 mt-1.5 max-w-md">
                Open Cursor chat and describe what you want to build. Copy a prompt below to get started.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 max-w-lg mx-auto">
              {PROMPT_GUIDES.map(({ prompt, label, icon: Icon }) => (
                <PromptCard key={label} prompt={prompt} label={label} icon={<Icon className="h-3.5 w-3.5" />} />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
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
        )}
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="section-title mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          <Link to="/tasks">
            <div className="card card-hover rounded-xl p-4 flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 p-2">
                <ListTodo className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-surface-700">Tasks</p>
                <p className="text-[10px] text-surface-400">Your daily board</p>
              </div>
            </div>
          </Link>
          <Link to="/context">
            <div className="card card-hover rounded-xl p-4 flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100 p-2">
                <UserCircle className="h-4 w-4 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-surface-700">My Context</p>
                <p className="text-[10px] text-surface-400">Edit your profile</p>
              </div>
            </div>
          </Link>
          <BuildPrototypeAction />
        </div>
      </section>
    </div>
  )
}

function StatPill({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white/[0.08] backdrop-blur-sm rounded-xl px-3.5 py-2 text-center min-w-[80px]">
      <p className="text-xl font-bold leading-none">{value}</p>
      <p className="text-[10px] text-white/50 mt-1 uppercase tracking-wide">{label}</p>
    </div>
  )
}

function PromptCopy({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="w-full flex items-center gap-2 rounded-xl bg-surface-50 border border-surface-200 px-4 py-2.5 text-left group hover:border-brand-300 hover:bg-brand-50/30 transition-all"
    >
      <span className="text-xs text-surface-300 font-mono">&gt;</span>
      <span className="text-sm text-surface-600 font-mono flex-1 truncate">{prompt}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-surface-300 group-hover:text-brand-400 shrink-0 transition-colors" />
      )}
    </button>
  )
}

function BuildPrototypeAction() {
  const [copied, setCopied] = useState(false)
  const prompt = '/create-prototype Build a prototype for [describe your feature]'
  const copy = () => {
    navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="text-left">
      <div className="card card-hover rounded-xl p-4 flex items-center gap-3">
        <div className="rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 p-2">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Box className="h-4 w-4 text-amber-600" />}
        </div>
        <div>
          <p className="text-sm font-medium text-surface-700">Build Prototype</p>
          <p className="text-[10px] text-surface-400">{copied ? 'Prompt copied!' : 'Copy /create-prototype prompt'}</p>
        </div>
      </div>
    </button>
  )
}

function PromptCard({ prompt, label, icon }: { prompt: string; label: string; icon: React.ReactNode }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-2.5 rounded-xl bg-white border border-surface-200 px-3.5 py-3 text-left group hover:border-brand-300 hover:shadow-md hover:shadow-brand-500/5 transition-all w-full"
    >
      <span className="text-brand-400 shrink-0">{icon}</span>
      <span className="text-xs font-medium text-surface-600 flex-1">{label}</span>
      {copied ? (
        <Check className="h-3 w-3 text-green-500 shrink-0" />
      ) : (
        <Copy className="h-3 w-3 text-surface-300 group-hover:text-brand-400 shrink-0 transition-colors" />
      )}
    </button>
  )
}
