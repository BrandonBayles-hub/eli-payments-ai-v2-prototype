import { Zap, AlertTriangle, XCircle } from "lucide-react"
import { Progress } from "@sandbox-components/ui/progress"
import { cn } from "@sandbox-lib/utils"
import type { UsageStats, UsageThreshold } from "./types"

interface UsageMeterProps {
  usage: UsageStats
  threshold: UsageThreshold
  compact?: boolean
}

function getThresholdColor(threshold: UsageThreshold) {
  switch (threshold) {
    case "under-50":
      return { bar: "bg-green-500", text: "text-green-600", bg: "bg-green-50", icon: "text-green-500" }
    case "at-50":
      return { bar: "bg-yellow-500", text: "text-yellow-600", bg: "bg-yellow-50", icon: "text-yellow-500" }
    case "at-75":
      return { bar: "bg-orange-500", text: "text-orange-600", bg: "bg-orange-50", icon: "text-orange-500" }
    case "at-90":
      return { bar: "bg-red-500", text: "text-red-600", bg: "bg-red-50", icon: "text-red-500" }
    case "at-100":
      return { bar: "bg-red-600", text: "text-red-700", bg: "bg-red-50", icon: "text-red-600" }
  }
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`
  return tokens.toString()
}

export function UsageMeter({ usage, threshold, compact = false }: UsageMeterProps) {
  const colors = getThresholdColor(threshold)

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Zap className={cn("h-4 w-4 shrink-0", colors.icon)} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Token Usage</span>
            <span className={cn("text-xs font-medium", colors.text)}>
              {usage.percentUsed}%
            </span>
          </div>
          <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", colors.bar)}
              style={{ width: `${Math.min(usage.percentUsed, 100)}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("rounded-lg border p-4 space-y-3", colors.bg)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {threshold === "at-100" ? (
            <XCircle className={cn("h-5 w-5", colors.icon)} aria-hidden="true" />
          ) : threshold === "at-90" ? (
            <AlertTriangle className={cn("h-5 w-5", colors.icon)} aria-hidden="true" />
          ) : (
            <Zap className={cn("h-5 w-5", colors.icon)} aria-hidden="true" />
          )}
          <span className="text-sm font-medium">Monthly Token Usage</span>
        </div>
        <span className={cn("text-sm font-semibold", colors.text)}>
          {usage.percentUsed}%
        </span>
      </div>

      <div className="space-y-1">
        <div className="h-2 w-full bg-background rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", colors.bar)}
            style={{ width: `${Math.min(usage.percentUsed, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatTokens(usage.tokensUsed)} used</span>
          <span>{formatTokens(usage.tokenLimit)} limit</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
        <span>{usage.conversationCount} conversations</span>
        <span>Resets {usage.periodEnd}</span>
      </div>
    </div>
  )
}
