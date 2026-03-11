import { useSearchParams } from "react-router-dom"
import { EntrataLayout } from "@sandbox/layouts/EntrataLayout"
import { usePrototypeControls } from "@sandbox-components/prototype"
import { PageHeader } from "@sandbox-components/composite/PageHeader"
import { Tabs, TabsContent, TabsList, TabsTrigger, TabsProvider } from "@sandbox-components/ui/tabs"
import { Users, LayoutDashboard, ShieldCheck } from "lucide-react"
import { TokenUsageProvider, useTokenUsage } from "./TokenUsageContext"
import { ChatSidebar } from "./ChatSidebar"
import { ChatInterface } from "./ChatInterface"
import { UsageMeter } from "./UsageMeter"
import { AdminDashboard } from "./AdminDashboard"
import { AdminUsageTable } from "./AdminUsageTable"
import { ConversationAudit } from "./ConversationAudit"
import { AllotmentManager } from "./AllotmentManager"
import { sampleAuditConversations } from "./sample-data"

function ExpertsPrototype() {
  const [searchParams, setSearchParams] = useSearchParams()

  const ctx = useTokenUsage()

  const controls = usePrototypeControls({
    groups: [
      {
        key: "role",
        label: "View As",
        defaultValue: "user",
        options: [
          { value: "user", label: "User", icon: Users },
          { value: "admin", label: "Client Settings", icon: LayoutDashboard },
          { value: "internal", label: "Entrata Internal", icon: ShieldCheck },
        ],
      },
      {
        key: "chatState",
        label: "Simulate State",
        defaultValue: "normal",
        visibleWhen: { role: "user" },
        options: [
          { value: "normal", label: "Normal" },
          { value: "loading", label: "Loading" },
          { value: "error", label: "Error" },
          { value: "empty", label: "Empty" },
        ],
      },
      {
        key: "adminState",
        label: "Simulate State",
        defaultValue: "normal",
        visibleWhen: { role: "admin" },
        options: [
          { value: "normal", label: "Normal" },
          { value: "loading", label: "Loading" },
          { value: "error", label: "Error" },
          { value: "empty", label: "Empty" },
        ],
      },
      {
        key: "internalState",
        label: "Simulate State",
        defaultValue: "normal",
        visibleWhen: { role: "internal" },
        options: [
          { value: "normal", label: "Normal" },
          { value: "loading", label: "Loading" },
          { value: "error", label: "Error" },
          { value: "empty", label: "Empty" },
        ],
      },
    ],
  })

  const role = controls.value("role")
  const chatState = controls.value("chatState")
  const adminState = controls.value("adminState")
  const internalState = controls.value("internalState")

  const auditUserId = searchParams.get("audit")
  const auditUser = auditUserId
    ? ctx.allUsers.find((u) => u.id === auditUserId)
    : null

  if (role === "internal") {
    return (
      <EntrataLayout activeTab="Tools" activeSubTab="Entrata Experts">
        <div className="max-w-7xl mx-auto py-2 space-y-6">
          <PageHeader title="Entrata Experts — Beta Management" />
          <AllotmentManager
            client={ctx.betaClient}
            viewState={internalState}
            onBack={() => setSearchParams({})}
            onAdjustAllotment={ctx.adjustAllotment}
          />
        </div>
      </EntrataLayout>
    )
  }

  if (role === "admin") {
    if (auditUser) {
      return (
        <EntrataLayout activeTab="Tools" activeSubTab="Entrata Experts">
          <div className="max-w-7xl mx-auto py-2 space-y-6">
            <PageHeader title="Entrata Experts — Usage Audit" />
            <ConversationAudit
              user={auditUser}
              conversations={sampleAuditConversations}
              viewState={adminState}
              onBack={() => setSearchParams({})}
            />
          </div>
        </EntrataLayout>
      )
    }

    return (
      <EntrataLayout activeTab="Tools" activeSubTab="Entrata Experts">
        <div className="max-w-7xl mx-auto py-2 space-y-6">
          <PageHeader title="Entrata Experts — Client Settings" />

          <TabsProvider variant="subtab">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">All Users</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <AdminDashboard
                  clientUsage={ctx.clientUsage}
                  users={ctx.allUsers}
                  viewState={adminState}
                  onViewUserDetail={(userId) =>
                    setSearchParams({ audit: userId })
                  }
                  onViewPropertyDetail={() => {}}
                />
              </TabsContent>
              <TabsContent value="users">
                <AdminUsageTable
                  users={ctx.allUsers}
                  viewState={adminState}
                  onAuditUser={(userId) => setSearchParams({ audit: userId })}
                />
              </TabsContent>
            </Tabs>
          </TabsProvider>
        </div>
      </EntrataLayout>
    )
  }

  return (
    <EntrataLayout
      activeTab="Tools"
      activeSubTab="Entrata Experts"
      disableContentCard
    >
      <div className="flex min-h-[calc(100vh-8rem)]">
        <aside className="w-64 border-r bg-card shrink-0 flex flex-col">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Entrata Experts</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatSidebar
              conversations={ctx.conversations}
              activeConversationId={ctx.activeConversationId}
              onSelectConversation={ctx.selectConversation}
              onNewConversation={ctx.startNewConversation}
            />
          </div>
          <div className="border-t">
            <UsageMeter
              usage={ctx.usageStats}
              threshold={ctx.threshold}
              compact
            />
          </div>
        </aside>
        <main className="flex-1 overflow-hidden bg-background">
          <ChatInterface viewState={chatState} />
        </main>
      </div>
    </EntrataLayout>
  )
}

export default function EntrataExpertsTokenUsage() {
  return (
    <TokenUsageProvider>
      <ExpertsPrototype />
    </TokenUsageProvider>
  )
}
