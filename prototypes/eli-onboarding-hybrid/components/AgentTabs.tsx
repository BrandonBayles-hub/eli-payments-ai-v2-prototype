/**
 * Shared Voice selector and Test Agent chat panel used across all product pages
 * (Leasing AI, Payments AI, Maintenance AI, Renewals AI).
 */
import { useState, useRef, useEffect } from "react"
import { cn } from "@sandbox-lib/utils"
import { buttonVariants } from "@sandbox-components/ui/button"
import {
  Play, Check, Volume2, ChevronRight, Bot, User, RefreshCw, Send,
  Settings2, Mic2, MessageSquare,
} from "lucide-react"

// ── Shared types ───────────────────────────────────────────────────────────────

export type AgentTopTab = "configure" | "voices" | "test"

export const AGENT_TOP_TABS: { id: AgentTopTab; label: string; icon: typeof Settings2 }[] = [
  { id: "configure", label: "Configure",  icon: Settings2     },
  { id: "voices",    label: "Voice",      icon: Mic2          },
  { id: "test",      label: "Test Agent", icon: MessageSquare },
]

// ── Voice data (shared across all products) ────────────────────────────────────

export interface Voice {
  id: string
  name: string
  descriptor: string
  accent?: string
  avatar: string
  avatarColor: string
}

export const VOICES: Voice[] = [
  { id: "jordan",  name: "Jordan",  descriptor: "Professional",       accent: "American",   avatar: "JO", avatarColor: "bg-violet-500"  },
  { id: "maya",    name: "Maya",    descriptor: "Warm & Friendly",    accent: "American",   avatar: "MA", avatarColor: "bg-pink-500"    },
  { id: "alex",    name: "Alex",    descriptor: "Crisp & Clear",      accent: "American",   avatar: "AL", avatarColor: "bg-blue-500"    },
  { id: "sam",     name: "Sam",     descriptor: "Conversational",     accent: "American",   avatar: "SA", avatarColor: "bg-amber-500"   },
  { id: "riley",   name: "Riley",   descriptor: "Energetic",          accent: "American",   avatar: "RI", avatarColor: "bg-emerald-500" },
  { id: "morgan",  name: "Morgan",  descriptor: "Calm & Reassuring",  accent: "British",    avatar: "MO", avatarColor: "bg-indigo-500"  },
  { id: "taylor",  name: "Taylor",  descriptor: "Direct & Efficient", accent: "American",   avatar: "TA", avatarColor: "bg-orange-500"  },
  { id: "casey",   name: "Casey",   descriptor: "Approachable",       accent: "Australian", avatar: "CA", avatarColor: "bg-cyan-500"    },
]

// ── TopTab bar (reusable header strip) ─────────────────────────────────────────

export function AgentTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: AgentTopTab
  onTabChange: (t: AgentTopTab) => void
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-white px-1.5 py-1.5 w-fit">
      {AGENT_TOP_TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onTabChange(id)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            activeTab === id
              ? "bg-zinc-900 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-zinc-50",
          )}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  )
}

// ── Voice selector tab ─────────────────────────────────────────────────────────

export function VoiceTab({
  selectedVoice,
  onSelect,
}: {
  selectedVoice: string
  onSelect: (id: string) => void
}) {
  const [playing, setPlaying] = useState<string | null>(null)
  const selected = VOICES.find(v => v.id === selectedVoice) ?? VOICES[0]

  function togglePlay(id: string) {
    setPlaying(prev => (prev === id ? null : id))
    setTimeout(() => setPlaying(null), 3000)
  }

  return (
    <div className="max-w-lg space-y-4">
      {/* Active voice */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Active Voice</p>
        <div className="flex items-center gap-3 rounded-xl border-2 border-zinc-900 bg-white px-4 py-3.5 shadow-sm">
          <div className={cn("h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0", selected.avatarColor)}>
            {selected.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{selected.name}</p>
            <p className="text-xs text-muted-foreground">{selected.descriptor}{selected.accent ? ` · ${selected.accent}` : ""}</p>
          </div>
          <button
            type="button"
            onClick={() => togglePlay(selected.id)}
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center transition-colors shrink-0",
              playing === selected.id ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
            )}
          >
            {playing === selected.id ? <Volume2 className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
          </button>
        </div>
      </div>

      {/* Voice list */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Available Voices</p>
        <div className="rounded-xl border border-border bg-white overflow-hidden divide-y divide-border">
          {VOICES.map(voice => {
            const isSelected = voice.id === selectedVoice
            const isPlaying  = playing === voice.id
            return (
              <button
                key={voice.id}
                type="button"
                onClick={() => onSelect(voice.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors",
                  isSelected ? "bg-zinc-50" : "bg-white hover:bg-zinc-50/70",
                )}
              >
                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0", voice.avatarColor)}>
                  {voice.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{voice.name}</p>
                </div>
                <p className="text-xs text-muted-foreground shrink-0 mr-3">{voice.descriptor}</p>
                {isSelected ? (
                  <Check className="h-4 w-4 text-zinc-900 shrink-0" />
                ) : (
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); togglePlay(voice.id) }}
                    className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center transition-colors shrink-0",
                      isPlaying ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200",
                    )}
                  >
                    {isPlaying ? <Volume2 className="h-3 w-3" /> : <Play className="h-3 w-3 ml-0.5" />}
                  </button>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <button
        type="button"
        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-zinc-400 transition-colors flex items-center justify-between"
      >
        <span>Explore more voices</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

// ── Test Agent chat tab ────────────────────────────────────────────────────────

export interface ChatScenario {
  label: string
  messages: { role: "eli" | "prospect"; text: string }[]
}

export function TestAgentTab({
  productLabel,
  voiceName,
  scenarios,
}: {
  productLabel: string
  voiceName: string
  scenarios: ChatScenario[]
}) {
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [visibleCount, setVisibleCount] = useState(0)
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const scenario = scenarios[scenarioIdx]

  function loadScenario(idx: number) {
    setScenarioIdx(idx)
    setVisibleCount(0)
    setInput("")
  }

  useEffect(() => {
    if (visibleCount >= scenario.messages.length) return
    const t = setTimeout(() => setVisibleCount(n => n + 1), visibleCount === 0 ? 300 : 700)
    return () => clearTimeout(t)
  }, [visibleCount, scenario.messages.length])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [visibleCount])

  return (
    <div className="max-w-xl flex flex-col" style={{ height: "calc(100vh - 18rem)" }}>
      <div className="rounded-xl border border-border bg-white overflow-hidden flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-zinc-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground leading-none">ELI — {productLabel}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Voice: {voiceName}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Preview mode
          </span>
        </div>

        {/* Scenario pills */}
        <div className="flex gap-1.5 px-3 py-2 border-b border-border bg-zinc-50/40 shrink-0 overflow-x-auto">
          {scenarios.map((s, i) => (
            <button key={i} type="button" onClick={() => loadScenario(i)}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-medium border transition-colors shrink-0",
                i === scenarioIdx
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white text-muted-foreground border-border hover:border-zinc-400 hover:text-foreground",
              )}>
              {s.label}
            </button>
          ))}
          <button type="button" onClick={() => loadScenario(scenarioIdx)}
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-medium text-muted-foreground border border-border bg-white hover:border-zinc-400 hover:text-foreground transition-colors shrink-0">
            <RefreshCw className="h-3 w-3" /> Replay
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
          {scenario.messages.slice(0, visibleCount).map((msg, i) => (
            <div key={i} className={cn("flex gap-2.5", msg.role === "prospect" ? "justify-end" : "justify-start")}>
              {msg.role === "eli" && (
                <div className="h-6 w-6 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
              )}
              <div className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed",
                msg.role === "eli"
                  ? "bg-zinc-100 text-foreground rounded-tl-sm"
                  : "bg-zinc-900 text-white rounded-tr-sm",
              )}>
                {msg.text}
              </div>
              {msg.role === "prospect" && (
                <div className="h-6 w-6 rounded-full bg-zinc-200 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-3.5 w-3.5 text-zinc-600" />
                </div>
              )}
            </div>
          ))}
          {visibleCount < scenario.messages.length && (
            <div className="flex gap-2.5">
              <div className="h-6 w-6 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="bg-zinc-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-3 py-3 border-t border-border bg-white shrink-0">
          <p className="text-[10px] text-muted-foreground/60 mb-2 text-center">Type as a resident to continue the conversation</p>
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (input.trim()) setInput("") } }}
              placeholder="Reply as a resident…"
              rows={2}
              className="flex-1 rounded-xl border border-border bg-zinc-50 px-3 py-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-zinc-900/20 placeholder:text-muted-foreground/60 leading-relaxed"
            />
            <button type="button" className={cn(buttonVariants({ variant: "eli", size: "sm" }), "shrink-0 px-2.5")}>
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
