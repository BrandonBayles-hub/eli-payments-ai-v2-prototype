import type { PageId } from "../index"
import { buttonVariants } from "@sandbox-components/ui/button"
import { cn } from "@sandbox-lib/utils"
import { Button } from "@sandbox-components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@sandbox-components/ui/card"
import { Badge } from "@sandbox-components/ui/badge"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { useState } from "react"

const STEPS = [
  { id: 1, label: "Forward property inquiry emails to your ELI+ address" },
  { id: 2, label: "Send a test message and confirm delivery within 2 minutes" },
  { id: 3, label: "Confirm outbound replies use the property From address" },
]

interface Props { navigate: (to: PageId) => void }

export function EmailPage({ navigate }: Props) {
  const [checked, setChecked] = useState<number[]>([])

  const toggle = (id: number) =>
    setChecked((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  const complete = checked.length === STEPS.length

  return (
    <div className="p-6 md:p-8 max-w-2xl space-y-6">
      <button
        type="button"
        onClick={() => navigate("overview")}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 -ml-2 text-muted-foreground")}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Overview
      </button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Email integration</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect your property email addresses so ELI+ can send and receive on behalf of each property.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Setup checklist</CardTitle>
            <Badge variant={complete ? "green" : "gray"}>{checked.length} / {STEPS.length} complete</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          {STEPS.map((step) => {
            const done = checked.includes(step.id)
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => toggle(step.id)}
                className="w-full flex items-start gap-3 rounded-md px-2 py-2.5 text-left hover:bg-accent/60 transition-colors"
              >
                <CheckCircle2
                  className={cn("h-4 w-4 mt-0.5 shrink-0 transition-colors", done ? "text-emerald-500" : "text-muted-foreground/30")}
                  aria-hidden
                />
                <span className={cn("text-sm", done ? "line-through text-muted-foreground" : "text-foreground")}>
                  {step.label}
                </span>
              </button>
            )
          })}
        </CardContent>
      </Card>

      {complete && (
        <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          Email integration complete
        </div>
      )}
    </div>
  )
}
