import type { PageId } from "../index"
import { buttonVariants } from "@sandbox-components/ui/button"
import { cn } from "@sandbox-lib/utils"
import { Button } from "@sandbox-components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@sandbox-components/ui/card"
import { Badge } from "@sandbox-components/ui/badge"
import { Progress } from "@sandbox-components/ui/progress"
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react"

const CHECKLIST = [
  { id: 1, label: "Company & 10DLC registration submitted", done: true },
  { id: 2, label: "Privacy policies verified across all properties", done: false },
  { id: 3, label: "Email integration configured", done: true },
  { id: 4, label: "Payments AI settings confirmed", done: false },
  { id: 5, label: "Leasing AI settings confirmed", done: true },
  { id: 6, label: "Carrier approval received", done: false },
]

interface Props { navigate: (to: PageId) => void }

export function GoLivePage({ navigate }: Props) {
  const complete = CHECKLIST.filter((c) => c.done).length
  const total = CHECKLIST.length
  const ready = complete === total

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
        <h1 className="text-2xl font-bold tracking-tight">Go live</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complete all prerequisites below to enable trial activation across your portfolio.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-foreground">Prerequisites</span>
          <span className="text-muted-foreground tabular-nums">{complete} of {total}</span>
        </div>
        <Progress value={(complete / total) * 100} className="h-2" />
      </div>

      <Card>
        <CardContent className="pt-4 space-y-1">
          {CHECKLIST.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-2 border-b border-border/60 last:border-0">
              {item.done
                ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" aria-hidden />
                : <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" aria-hidden />}
              <span className={cn("text-sm", item.done ? "text-muted-foreground line-through" : "text-foreground")}>
                {item.label}
              </span>
              {!item.done && <Badge variant="yellow" className="ml-auto text-[10px]">Incomplete</Badge>}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="button" variant="primary" disabled={!ready}>
          Enable trial activation
        </Button>
        {!ready && (
          <p className="text-xs text-muted-foreground">Complete all prerequisites to enable</p>
        )}
      </div>
    </div>
  )
}
