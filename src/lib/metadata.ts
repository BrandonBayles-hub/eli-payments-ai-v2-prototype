import {
  FileText, Home, CreditCard, Users, Settings, Shield, Wrench,
  BarChart3, Bell, Calendar, ClipboardList, Building2, Key,
  type LucideIcon,
} from 'lucide-react'

const keywordIconMap: Array<[string[], LucideIcon]> = [
  [['lease', 'audit', 'document', 'file'], FileText],
  [['home', 'resident', 'unit', 'property'], Home],
  [['payment', 'billing', 'invoice', 'charge'], CreditCard],
  [['user', 'tenant', 'roommate', 'applicant'], Users],
  [['setting', 'config', 'preference'], Settings],
  [['security', 'access', 'permission', 'auth'], Shield],
  [['maintenance', 'work-order', 'repair'], Wrench],
  [['report', 'analytics', 'dashboard', 'metric'], BarChart3],
  [['notification', 'alert', 'reminder'], Bell],
  [['schedule', 'calendar', 'tour'], Calendar],
  [['task', 'checklist', 'inspection'], ClipboardList],
  [['building', 'portfolio', 'community'], Building2],
  [['key', 'renewal', 'contract'], Key],
]

export function getPrototypeIcon(slug: string): LucideIcon {
  const lower = slug.toLowerCase()
  for (const [keywords, icon] of keywordIconMap) {
    if (keywords.some((k) => lower.includes(k))) return icon
  }
  return FileText
}

const colors = [
  'bg-gradient-to-br from-violet-100 to-purple-100 text-violet-700',
  'bg-gradient-to-br from-teal-100 to-emerald-100 text-teal-700',
  'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700',
  'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700',
  'bg-gradient-to-br from-rose-100 to-pink-100 text-rose-700',
  'bg-gradient-to-br from-cyan-100 to-sky-100 text-cyan-700',
  'bg-gradient-to-br from-fuchsia-100 to-purple-100 text-fuchsia-700',
  'bg-gradient-to-br from-lime-100 to-green-100 text-lime-700',
  'bg-gradient-to-br from-orange-100 to-red-100 text-orange-700',
]

export function getPrototypeColor(slug: string): string {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const statusColors: Record<string, string> = {
  Planning: 'bg-blue-50 text-blue-600 ring-1 ring-blue-200',
  Building: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200',
  Review: 'bg-violet-50 text-violet-600 ring-1 ring-violet-200',
  Handoff: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
  Complete: 'bg-surface-100 text-surface-500',
}

export function getStatusColor(status: string): string {
  return statusColors[status] ?? 'bg-surface-100 text-surface-600'
}
