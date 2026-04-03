import { useSearchParams } from "react-router-dom"
import { EntrataLayout } from "@sandbox/layouts/EntrataLayout"
import { usePrototypeControls } from "@sandbox-components/prototype"
import { PageHeader } from "@sandbox-components/composite/PageHeader"
import { Button } from "@sandbox-components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger, TabsProvider } from "@sandbox-components/ui/tabs"
import { Building2, LayoutDashboard, Rocket, Shield, Headphones, Users, Settings } from "lucide-react"
import { OverviewDashboard } from "./components/OverviewDashboard"
import { ImplementationChecklist } from "./components/ImplementationChecklist"
import { PropertyReadiness } from "./components/PropertyReadiness"
import { InternalPipeline } from "./components/InternalPipeline"
import { AgentActivation } from "./components/AgentActivation"
import { SettingsIntelligence } from "./components/SettingsIntelligence"
import { newClientImplementation, backfillImplementation } from "./data/sample-data"
import type { ViewRole, ClientSegment } from "./types"

export default function EliPlusImplementationTracker() {
  const [searchParams, setSearchParams] = useSearchParams()
  const controls = usePrototypeControls({
    groups: [
      { key: "role", label: "View As", defaultValue: "client", options: [
        { value: "client", label: "Client", icon: Users }, { value: "internal", label: "Entrata Employee", icon: Shield },
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
  const valid = role === "internal"
    ? new Set(["checklist", "properties", "activation", "settings-map", "pipeline"])
    : new Set(["checklist", "properties", "activation", "settings-map"])
  const tabParam = searchParams.get("tab") ?? "checklist"
  const tabFromUrl = valid.has(tabParam) ? tabParam : "checklist"
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
  const segLabel = data.segment === "backfill" ? "backfill (pre-Oct 2025)" : "new implementation"
  return (
    <EntrataLayout activeTab="Setup" activeSubTab="ELI+ Implementation">
      <div className="max-w-7xl mx-auto py-2 space-y-6">
        <PageHeader
          title={role === "client" ? "ELI+ Implementation" : `ELI+ Implementation — ${data.companyName}`}
          description={role === "client"
            ? `Track what's needed to get ELI+ live across your ${data.propertiesTotal} properties.`
            : `Implementation pipeline for ${data.companyName} (${data.companyId}) — ${segLabel} client.`}
          actions={role === "client" ? (
            <Button variant="outline" onClick={() => window.open("https://support.entrata.com", "_blank")}><Headphones className="h-4 w-4" aria-hidden="true" />Contact Support</Button>
          ) : undefined}
        />
        <OverviewDashboard data={data} role={role} viewState={viewState} onNavigateToProperty={() => setTab("properties")} onStartSetup={() => setTab("checklist")} />
        <TabsProvider variant="subtab">
          <Tabs value={activeTab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="checklist"><LayoutDashboard className="h-4 w-4" aria-hidden="true" />{role === "client" ? "What We Need" : "Checklist"}</TabsTrigger>
              <TabsTrigger value="properties"><Building2 className="h-4 w-4" aria-hidden="true" />Properties</TabsTrigger>
              <TabsTrigger value="activation"><Rocket className="h-4 w-4" aria-hidden="true" />{role === "client" ? "Go Live" : "Activation"}</TabsTrigger>
              <TabsTrigger value="settings-map"><Settings className="h-4 w-4" aria-hidden="true" />Settings Map</TabsTrigger>
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
    </EntrataLayout>
  )
}
