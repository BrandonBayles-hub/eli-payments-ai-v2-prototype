import React, { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { EntrataLayout } from "@sandbox/layouts/EntrataLayout"
import { HybridShell } from "./components/HybridShell"
import { OverviewPage } from "./pages/OverviewPage"
import { CompanyPage } from "./pages/CompanyPage"
import { PrivacyPage } from "./pages/PrivacyPage"
import { EmailPage } from "./pages/EmailPage"
import { PaymentsSummaryPage } from "./pages/PaymentsSummaryPage"
import { PaymentsAdvancedPage } from "./pages/PaymentsAdvancedPage"
import { GoLivePage } from "./pages/GoLivePage"

export type PageId = "overview" | "company" | "privacy" | "email" | "payments" | "payments-advanced" | "golive"

export type BasePageProps = {
  navigate: (to: PageId) => void
  completedTasks: Set<string>
  onComplete: (id: string) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NON_OVERVIEW_PAGES: Partial<Record<PageId, React.ComponentType<any>>> = {
  company: CompanyPage,
  privacy: PrivacyPage,
  email: EmailPage,
  payments: PaymentsSummaryPage,
  "payments-advanced": PaymentsAdvancedPage,
  golive: GoLivePage,
}

export default function EliOnboardingHybrid() {
  const [params, setParams] = useSearchParams()
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())

  const pageParam = params.get("page") as PageId | null
  const allPageIds: PageId[] = ["overview", "company", "privacy", "email", "payments", "payments-advanced", "golive"]
  const page: PageId = pageParam && allPageIds.includes(pageParam) ? pageParam : "overview"

  function navigate(to: PageId) {
    setParams({ page: to })
  }

  function handleComplete(taskId: string) {
    setCompletedTasks((prev) => new Set([...prev, taskId]))
  }

  return (
    <EntrataLayout activeTab="Setup" activeSubTab="ELI+ Onboarding" disableContentCard>
      <HybridShell page={page} navigate={navigate} completedTasks={completedTasks}>
        {page === "overview" ? (
          <OverviewPage navigate={navigate} completedTasks={completedTasks} onComplete={handleComplete} />
        ) : (
          (() => {
            const PageComponent = NON_OVERVIEW_PAGES[page as keyof typeof NON_OVERVIEW_PAGES]
            return PageComponent ? <PageComponent navigate={navigate} completedTasks={completedTasks} onComplete={handleComplete} /> : null
          })()
        )}
      </HybridShell>
    </EntrataLayout>
  )
}
