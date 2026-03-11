import { useState, useEffect, useCallback } from 'react'
import { Save, Check, UserCircle, Building2, Plus, Trash2, FileText, Brain } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  parseMe, serializeMe,
  parseProductArea, serializeProductArea,
  type MeContext, type ProductAreaContext,
} from '@/lib/context-parser'

type Tab = 'me' | 'product-area' | 'memory'

const tabs: Array<{ id: Tab; label: string; icon: typeof UserCircle; file: string }> = [
  { id: 'me', label: 'About Me', icon: UserCircle, file: 'context/me.md' },
  { id: 'product-area', label: 'Product Area', icon: Building2, file: 'context/product-area.md' },
  { id: 'memory', label: 'Memory', icon: Brain, file: 'context/memory.md' },
]

export default function ContextPage() {
  const [activeTab, setActiveTab] = useState<Tab>('me')
  const [me, setMe] = useState<MeContext | null>(null)
  const [productArea, setProductArea] = useState<ProductAreaContext | null>(null)
  const [memory, setMemory] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/context')
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        if (data['me.md']) setMe(parseMe(data['me.md']))
        if (data['product-area.md']) setProductArea(parseProductArea(data['product-area.md']))
        if (data['memory.md']) setMemory(data['memory.md'])
      })
  }, [])

  const save = useCallback(async (filename: string, content: string) => {
    setSaving(true)
    setSaved(false)
    await fetch('/api/context/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, content }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [])

  const saveMe = () => { if (me) save('me.md', serializeMe(me)) }
  const saveProductArea = () => { if (productArea) save('product-area.md', serializeProductArea(productArea)) }
  const saveMemory = () => save('memory.md', memory)

  const currentTab = tabs.find(t => t.id === activeTab)!

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-surface-900">My Context</h1>
          <p className="text-sm text-surface-400 mt-0.5">
            The AI reads these markdown files to personalize its help. Edit here or directly in Cursor.
          </p>
        </div>
        <button
          onClick={() => {
            if (activeTab === 'me') saveMe()
            else if (activeTab === 'product-area') saveProductArea()
            else saveMemory()
          }}
          disabled={saving}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors',
            saved
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 shadow-sm shadow-brand-500/25',
          )}
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-surface-100/80 backdrop-blur-sm p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors flex-1 justify-center',
              activeTab === id
                ? 'bg-white text-surface-900 shadow-sm'
                : 'text-surface-500 hover:text-surface-700',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* File path indicator */}
      <div className="flex items-center gap-1.5 px-1">
        <FileText className="h-3 w-3 text-surface-300" />
        <span className="text-[11px] text-surface-300 font-mono">{currentTab.file}</span>
      </div>

      {/* Tab Content */}
      <div className="card rounded-2xl p-6">
        {activeTab === 'me' && me && <MeForm me={me} onChange={setMe} />}
        {activeTab === 'product-area' && productArea && <ProductAreaForm pa={productArea} onChange={setProductArea} />}
        {activeTab === 'memory' && <MemoryForm memory={memory} onChange={setMemory} />}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-surface-500 mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm text-surface-900 placeholder:text-surface-300 focus:border-brand-400 focus:ring-1 focus:ring-brand-400 outline-none transition-colors"
      />
    </div>
  )
}

function TextArea({ label, value, onChange, placeholder, hint, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string; rows?: number
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-surface-500 mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm text-surface-900 placeholder:text-surface-300 focus:border-brand-400 focus:ring-1 focus:ring-brand-400 outline-none transition-colors resize-none"
      />
      {hint && <p className="text-[11px] text-surface-300 mt-1">{hint}</p>}
    </div>
  )
}

function ListEditor({ label, items, onChange, placeholder, hint }: {
  label: string; items: string[]; onChange: (items: string[]) => void; placeholder?: string; hint?: string
}) {
  const addItem = () => onChange([...items, ''])
  const removeItem = (i: number) => onChange(items.filter((_, idx) => idx !== i))
  const updateItem = (i: number, val: string) => {
    const next = [...items]
    next[i] = val
    onChange(next)
  }

  return (
    <div>
      <label className="block text-xs font-medium text-surface-500 mb-1.5">{label}</label>
      {hint && <p className="text-[11px] text-surface-300 mb-2">{hint}</p>}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(i, e.target.value)}
              placeholder={placeholder}
              className="flex-1 rounded-lg border border-surface-200 px-3 py-2 text-sm text-surface-900 placeholder:text-surface-300 focus:border-brand-400 focus:ring-1 focus:ring-brand-400 outline-none transition-colors"
            />
            <button onClick={() => removeItem(i)} className="text-surface-300 hover:text-danger transition-colors p-1">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button onClick={addItem} className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700">
          <Plus className="h-3 w-3" /> Add item
        </button>
      </div>
    </div>
  )
}

function MeForm({ me, onChange }: { me: MeContext; onChange: (m: MeContext) => void }) {
  const set = (key: keyof MeContext, val: any) => onChange({ ...me, [key]: val })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-surface-900 mb-4">Identity</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" value={me.name} onChange={(v) => set('name', v)} placeholder="Jane Smith" />
          <Field label="Role" value={me.role} onChange={(v) => set('role', v)} placeholder="Senior Product Manager" />
          <Field label="Product Area" value={me.productArea} onChange={(v) => set('productArea', v)} placeholder="Homebody, Leasing, etc." />
          <Field label="Team" value={me.team} onChange={(v) => set('team', v)} placeholder="Resident Experience" />
        </div>
      </div>
      <ListEditor
        label="Focus Areas"
        items={me.focusAreas}
        onChange={(v) => set('focusAreas', v)}
        placeholder="e.g., Improving renewal flow"
        hint="What you're working on right now. The AI uses this to prioritize and contextualize its suggestions."
      />
      <ListEditor
        label="How I Work"
        items={me.howIWork}
        onChange={(v) => set('howIWork', v)}
        placeholder="e.g., Keep explanations PM-friendly"
        hint="Communication preferences. Tells the AI how to talk to you -- tone, detail level, what to avoid."
      />
    </div>
  )
}

function ProductAreaForm({ pa, onChange }: { pa: ProductAreaContext; onChange: (p: ProductAreaContext) => void }) {
  const set = (key: keyof ProductAreaContext, val: any) => onChange({ ...pa, [key]: val })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-surface-900 mb-4">Domain</h3>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Product Area" value={pa.productArea} onChange={(v) => set('productArea', v)} placeholder="Homebody" />
          <Field label="Primary Users" value={pa.primaryUsers} onChange={(v) => set('primaryUsers', v)} placeholder="Residents, Property Managers" />
          <Field label="Key Engineering Repos" value={pa.keyRepos} onChange={(v) => set('keyRepos', v)} placeholder="capricorn, homebody-services" />
        </div>
      </div>
      <TextArea
        label="Current State"
        value={pa.currentState}
        onChange={(v) => set('currentState', v)}
        placeholder="Describe what's working and what's not..."
        hint="The AI uses this to ground prototypes and specs in your actual product reality."
        rows={4}
      />
      <TextArea
        label="Competitive Landscape"
        value={pa.competitiveLandscape}
        onChange={(v) => set('competitiveLandscape', v)}
        placeholder="What are competitors doing?"
        hint="Helps the AI reference industry patterns when building features."
        rows={3}
      />
    </div>
  )
}

function MemoryForm({ memory, onChange }: { memory: string; onChange: (m: string) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-surface-900">AI Memory</h3>
        <p className="text-xs text-surface-400 mt-1">
          A running log of what the AI knows about you — your preferences, decisions, patterns, and corrections.
          The AI reads this at the start of every session and adds to it as it learns. You can edit it directly.
        </p>
      </div>
      <textarea
        value={memory}
        onChange={(e) => onChange(e.target.value)}
        rows={20}
        className="w-full rounded-lg border border-surface-200 px-4 py-3 text-sm text-surface-900 font-mono leading-relaxed placeholder:text-surface-300 focus:border-brand-400 focus:ring-1 focus:ring-brand-400 outline-none transition-colors resize-y"
        placeholder="# Memory&#10;&#10;The AI will add entries here as it learns about you..."
      />
      <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2.5 text-xs text-blue-600">
        <Brain className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>The AI appends to this file automatically when it discovers preferences or makes corrections. You can also add entries manually — just write under the appropriate section heading.</span>
      </div>
    </div>
  )
}
