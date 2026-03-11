import { useState, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { EntrataLayout } from "@sandbox/layouts/EntrataLayout"
import { usePrototypeControls } from "@sandbox-components/prototype"
import { PageHeader } from "@sandbox-components/composite/PageHeader"
import { Users, LayoutDashboard, BarChart3 } from "lucide-react"
import { ChatSidebar } from "./ChatSidebar"
import { ChatInterface } from "./ChatInterface"
import { UsageMeter } from "./UsageMeter"
import { AdminDashboard } from "./AdminDashboard"
import { AdminUsageTable } from "./AdminUsageTable"
import { ConversationAudit } from "./ConversationAudit"
import {
  sampleConversations,
  sampleUsageByThreshold,
  sampleUserUsage,
  sampleClientUsage,
  sampleAuditConversations,
} from "./sample-data"
import type { UsageThreshold } from "./types"

export default function EntrataExpertsTokenUsage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const controls = usePrototypeControls({
    groups: [
      {
        key: "role",
        label: "View As",
        defaultValue: "user",
        options: [
          { value: "user", label: "User", icon: Users },
          { value: "admin", label: "Admin", icon: LayoutDashboard },
        ],
      },
      {
        key: "usageLevel",
        label: "Usage Level",
        defaultValue: "under-50",
        visibleWhen: { role: "user" },
        options: [
          { value: "under-50", label: "<50%" },
          { value: "at-50", label: "50%" },
          { value: "at-75", label: "75%" },
          { value: "at-90", label: "90%" },
          { value: "at-100", label: "100%" },
        ],
      },
      {
        key: "adminScreen",
        label: "Admin Screen",
        defaultValue: "dashboard",
        visibleWhen: { role: "admin" },
        options: [
          { value: "dashboard", label: "Dashboard", icon: BarChart3 },
          { value: "users", label: "All Users", icon: Users },
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
    ],
  })

  const role = controls.value("role")
  const usageLevel = controls.value("usageLevel") as UsageThreshold
  const adminScreen = controls.value("adminScreen")
  const chatState = controls.value("chatState")
  const adminState = controls.value("adminState")

  const [activeConversationId, setActiveConversationId] = useState<string | null>("conv-1")

  const auditUserId = searchParams.get("audit")
  const auditUser = auditUserId ? sampleUserUsage.find((u) => u.id === auditUserId) : null

  const activeConversation = useMemo(
    () => sampleConversations.find((c) => c.id === activeConversationId) ?? null,
    [activeConversationId]
  )

  const usage = sampleUsageByThreshold[usageLevel]

  const handleSendMessage = (_message: string) => {
    // In a real app, this would send the message to the API
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
          <PageHeader title="Entrata Experts — Admin" />

          {adminScreen === "dashboard" ? (
            <AdminDashboard
              clientUsage={sampleClientUsage}
              users={sampleUserUsage}
              viewState={adminState}
              onViewUserDetail={(userId) => setSearchParams({ audit: userId })}
              onViewPropertyDetail={() => {
                controls.setValue("adminScreen", "users")
              }}
            />
          ) : (
            <AdminUsageTable
              users={sampleUserUsage}
              viewState={adminState}
              onAuditUser={(userId) => setSearchParams({ audit: userId })}
            />
          )}
        </div>
      </EntrataLayout>
    )
  }

  return (
    <EntrataLayout activeTab="Tools" activeSubTab="Entrata Experts" disableContentCard>
      <div className="flex min-h-[calc(100vh-8rem)]">
        <aside className="w-64 border-r bg-card shrink-0 flex flex-col">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Entrata Experts</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatSidebar
              conversations={sampleConversations}
              activeConversationId={activeConversationId}
              onSelectConversation={setActiveConversationId}
              onNewConversation={() => setActiveConversationId(null)}
            />
          </div>
          <div className="border-t">
            <UsageMeter usage={usage} threshold={usageLevel} compact />
          </div>
        </aside>
        <main className="flex-1 overflow-hidden bg-background">
          <ChatInterface
            conversation={chatState === "empty" ? null : activeConversation}
            usage={usage}
            threshold={usageLevel}
            viewState={chatState}
            onSendMessage={handleSendMessage}
          />
        </main>
      </div>
    </EntrataLayout>
  )
}
