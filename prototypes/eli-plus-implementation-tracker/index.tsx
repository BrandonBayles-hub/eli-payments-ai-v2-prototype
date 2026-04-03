import { useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { usePrototypeControls } from "@sandbox-components/prototype"
import { Button } from "@sandbox-components/ui/button"
import { Badge } from "@sandbox-components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger, TabsProvider } from "@sandbox-components/ui/tabs"
import {
  LayoutDashboard, Bot, Wrench, MessageSquare, AlertTriangle, Users as UsersIcon, FileText,
  Settings, Building2, Rocket, Shield, ChevronRight, Zap, Headphones,
} from "lucide-react"
import { OverviewDashboard } from "./components/OverviewDashboard"
import { ImplementationChecklist } from "./components/ImplementationChecklist"
import { PropertyReadiness } from "./components/PropertyReadiness"
import { InternalPipeline } from "./components/InternalPipeline"
import { AgentActivation } from "./components/AgentActivation"
import { SettingsIntelligence } from "./components/SettingsIntelligence"
import { newClientImplementation, backfillImplementation } from "./data/sample-data"
import type { ViewRole, ClientSegment } from "./types"

type OxpSection = "command-center" | "agent-roster" | "eli-setup" | "conversations" | "escalations" | "workforce" | "trainings" | "settings"

const NAV: { id: OxpSection; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "command-center", label: "Command Center", icon: LayoutDashboard },
  { id: "agent-roster", label: "Agent Roster", icon: Bot },
  { id: "eli-setup", label: "ELI+ Setup", icon: Zap },
  { id: "conversations", label: "Conversations", icon: MessageSquare },
  { id: "escalations", label: "Escalations", icon: AlertTriangle },
  { id: "workforce", label: "Workforce", icon: UsersIcon },
  { id: "trainings", label: "Trainings & SOPs", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
]

export default function EliPlusImplementationTracker() {
  const [searchParams, setSearchParams] = useSearchParams()
  const controls = usePrototypeControls({
    groups: [
      { key: "role", label: "View As", defaultValue: "client", options: [
        { value: "client", label: "Client", icon: UsersIcon }, { value: "internal", label: "Entrata Employee", icon: Shield },
      ]},
      { key: "segment", label: "Client Type", defaultValue: "new", options: [
        { value: "new", label: "New Implementation" }, { value: "backfill", label: "Backfill (Pre-Oct 2025)" },
      ]},
      { key: "viewState", label: "Simulate State", defaultValue: "normal", options: [
        { value: "normal", label: "Normal" }, { value: "loading", label: "Loading" },
        { value: "error", label: "Error" }, { value: "empty", label: "Empty" },
      ]},
    ],
  })

  const role = controls.value("role") as ViewRole
  const segment = controls.value("segment") as ClientSegment
  const viewState = controls.value("viewState")
  const data = segment === "new" ? newClientImplementation : backfillImplementation

  const propertyId = searchParams.get("property")
  const validTabs = useMemo(() => {
    const base = new Set(["checklist", "properties", "activation", "settings-map"])
    if (role === "internal") base.add("pipeline")
    return base
  }, [role])
  const tabParam = searchParams.get("tab") ?? "checklist"
  const tabFromUrl = validTabs.has(tabParam) ? tabParam : "checklist"
  const activeTab = propertyId ? "properties" : tabFromUrl

  const setTab = (v: string) => {
    setSearchParams((p) => { const n = new URLSearchParams(p); n.set("tab", v); n.delete("property"); return n })
  }
  const selectProperty = (id: string | null) => {
    setSearchParams((p) => {
      const n = new URLSearchParams(p)
      if (id) { n.set("property", id); n.set("tab", "properties") } else n.delete("property")
      return n
    })
  }

  const clientItemsLeft = data.companyItems.filter((i) => i.visibility !== "internal" && i.status === "needs_input").length

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-600 to-pink-500 flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground">OXP Studio</h1>
            <p className="text-xs text-muted-foreground">
              {role === "internal" ? `${data.companyName} (${data.companyId})` : "Sunset Property Group"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {role === "client" && (
            <Button variant="outline" size="sm" onClick={() => window.open("https://support.entrata.com", "_blank")}>
              <Headphones className="h-4 w-4" aria-hidden="true" />
              Support
            </Button>
          )}
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
            {role === "internal" ? "EN" : "CH"}
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-57px)]">
        <aside className="w-56 bg-card border-r border-border py-4 shrink-0">
          <div className="px-4 mb-4">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Navigation</span>
          </div>
          <nav className="space-y-1 px-2">
            {NAV.map((item) => {
              const isActive = item.id === "eli-setup"
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.id === "eli-setup" && clientItemsLeft > 0 && (
                      <Badge variant="yellow" className="text-xs">{clientItemsLeft}</Badge>
                    )}
                    {isActive && <ChevronRight className="h-4 w-4" aria-hidden="true" />}
                  </div>
                </button>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1 p-6 overflow-y-auto">
          {viewState === "empty" ? (
            <div className="max-w-lg mx-auto flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-purple-600 to-pink-500 flex items-center justify-center mb-6">
                <Zap className="h-7 w-7 text-white" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Welcome to ELI+ Setup</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We've scanned your Entrata account and pre-filled what we can — property addresses, office hours, policies, and financial settings are ready to go.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                A few items need your input before activation. Most clients finish in a single session.
              </p>
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <Button variant="primary" size="lg" className="w-full" onClick={() => controls.setValue("viewState", "normal")}>
                  Start Setup
                </Button>
                <Button variant="outline" size="lg" className="w-full" onClick={() => window.open("https://support.entrata.com", "_blank")}>
                  <Headphones className="h-4 w-4" aria-hidden="true" />
                  Talk to Support First
                </Button>
              </div>
              <div className="mt-12 grid grid-cols-3 gap-6 w-full max-w-md">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{data.propertiesTotal}</p>
                  <p className="text-xs text-muted-foreground mt-1">Properties detected</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">4</p>
                  <p className="text-xs text-muted-foreground mt-1">AI products included</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">~15 min</p>
                  <p className="text-xs text-muted-foreground mt-1">Typical setup time</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    {role === "client" ? "ELI+ Setup" : `ELI+ Setup — ${data.companyName}`}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {role === "client"
                      ? `Get ELI+ live across your ${data.propertiesTotal} properties. Complete the items below and activate when ready.`
                      : `Implementation pipeline for ${data.companyName} (${data.companyId}) — ${data.segment === "backfill" ? "backfill" : "new"} client.`}
                  </p>
                </div>
              </div>

              <OverviewDashboard data={data} role={role} viewState={viewState} onNavigateToProperty={() => setTab("properties")} onStartSetup={() => setTab("checklist")} />

              <TabsProvider variant="subtab">
                <Tabs value={activeTab} onValueChange={setTab}>
                  <TabsList>
                    <TabsTrigger value="checklist"><LayoutDashboard className="h-4 w-4" aria-hidden="true" />{role === "client" ? "What We Need" : "Checklist"}</TabsTrigger>
                    <TabsTrigger value="properties"><Building2 className="h-4 w-4" aria-hidden="true" />Properties</TabsTrigger>
                    <TabsTrigger value="activation"><Rocket className="h-4 w-4" aria-hidden="true" />{role === "client" ? "Go Live" : "Activation"}</TabsTrigger>
                    <TabsTrigger value="settings-map"><Wrench className="h-4 w-4" aria-hidden="true" />Settings Map</TabsTrigger>
                    {role === "internal" && <TabsTrigger value="pipeline"><Shield className="h-4 w-4" aria-hidden="true" />Pipeline</TabsTrigger>}
                  </TabsList>
                  <TabsContent value="checklist"><ImplementationChecklist items={data.companyItems} role={role} viewState={viewState} /></TabsContent>
                  <TabsContent value="properties">
                    <PropertyReadiness properties={data.properties} role={role} viewState={viewState} selectedPropertyId={propertyId} onSelectProperty={selectProperty} />
                  </TabsContent>
                  <TabsContent value="activation"><AgentActivation data={data} role={role} viewState={viewState} onGoToChecklist={() => setTab("checklist")} /></TabsContent>
                  <TabsContent value="settings-map"><SettingsIntelligence viewState={viewState} /></TabsContent>
                  {role === "internal" && <TabsContent value="pipeline"><InternalPipeline items={data.companyItems} viewState={viewState} /></TabsContent>}
                </Tabs>
              </TabsProvider>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
