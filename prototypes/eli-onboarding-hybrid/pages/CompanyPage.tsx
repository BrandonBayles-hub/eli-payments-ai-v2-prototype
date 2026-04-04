import type { PageId } from "../index"
import { buttonVariants } from "@sandbox-components/ui/button"
import { cn } from "@sandbox-lib/utils"
import { Input } from "@sandbox-components/ui/input"
import { Label } from "@sandbox-components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@sandbox-components/ui/card"
import { Button } from "@sandbox-components/ui/button"
import { ArrowLeft, CheckCircle2 } from "lucide-react"

interface Props { navigate: (to: PageId) => void }

export function CompanyPage({ navigate }: Props) {
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
        <h1 className="text-2xl font-bold tracking-tight">Company setup</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Confirm your business details for carrier registration. Required before SMS and voice campaigns can go live.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-amber-500" aria-hidden />
            <CardTitle className="text-sm font-medium text-muted-foreground">Brand registration in progress — carrier review typically takes 2–3 business days</CardTitle>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Business details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ein">Employer Identification Number (EIN)</Label>
            <Input id="ein" placeholder="XX-XXXXXXX" className="max-w-md" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="legal">Legal business name</Label>
            <Input id="legal" defaultValue="Sunset Property Group LLC" className="max-w-md" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dba">DBA / brand name (optional)</Label>
            <Input id="dba" placeholder="Sunset Properties" className="max-w-md" />
          </div>
          <Button type="button" variant="primary">
            Save & continue
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
