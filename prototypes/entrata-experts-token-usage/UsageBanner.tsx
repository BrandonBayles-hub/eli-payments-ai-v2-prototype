import { Alert } from "@sandbox-components/ui/alert"
import type { UsageThreshold } from "./types"

interface UsageBannerProps {
  threshold: UsageThreshold
  periodEnd: string
}

export function UsageBanner({ threshold, periodEnd }: UsageBannerProps) {
  if (threshold === "under-50") return null

  const config: Record<string, { variant: "info" | "warning" | "error"; title: string; message: string }> = {
    "at-50": {
      variant: "info",
      title: "50% of monthly tokens used",
      message: `You've used half of your Entrata Experts tokens for this period. Usage resets on ${periodEnd}.`,
    },
    "at-75": {
      variant: "warning",
      title: "75% of monthly tokens used",
      message: `You're approaching your token limit. Consider prioritizing your most important questions. Usage resets on ${periodEnd}.`,
    },
    "at-90": {
      variant: "warning",
      title: "90% of monthly tokens used — running low",
      message: `You have very few tokens remaining this period. Each response uses tokens based on length. Usage resets on ${periodEnd}.`,
    },
    "at-100": {
      variant: "error",
      title: "Monthly token limit reached",
      message: `You've used all of your Entrata Experts tokens for this period. Your usage will reset on ${periodEnd}. Contact your administrator for questions about your allocation.`,
    },
  }

  const cfg = config[threshold]
  if (!cfg) return null

  return (
    <Alert variant={cfg.variant} title={cfg.title}>
      {cfg.message}
    </Alert>
  )
}
