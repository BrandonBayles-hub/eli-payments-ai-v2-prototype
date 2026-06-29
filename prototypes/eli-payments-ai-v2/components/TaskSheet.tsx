import { useEffect } from "react"
import { X } from "lucide-react"
import { buttonVariants } from "@sandbox-components/ui/button"
import { cn } from "@sandbox-lib/utils"

interface TaskSheetProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  onSave: () => void
  saveLabel?: string
  saveDisabled?: boolean
  /** When "header", primary save sits top-right next to close (footer hidden). */
  savePlacement?: "footer" | "header"
  children: React.ReactNode
}

export function TaskSheet({
  open,
  title,
  description,
  onClose,
  onSave,
  saveLabel = "Save & Mark Complete",
  saveDisabled = false,
  savePlacement = "footer",
  children,
}: TaskSheetProps) {
  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  // Header save: ⌘/Ctrl+Enter publishes when enabled (footer sheets unchanged)
  useEffect(() => {
    if (!open || savePlacement !== "header") return
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || !(e.metaKey || e.ctrlKey)) return
      if (saveDisabled) return
      e.preventDefault()
      onSave()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, savePlacement, saveDisabled, onSave])

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 bg-black/25 z-40 transition-opacity duration-200",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      />

      {/* Sheet panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-[680px] bg-background shadow-2xl z-50 flex flex-col",
          "transition-transform duration-250 ease-in-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-foreground">{title}</h2>
              {description && (
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {savePlacement === "header" && (
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saveDisabled}
                  title={saveDisabled ? undefined : "Shortcut: ⌘ Enter (Mac) or Ctrl+Enter (Windows)"}
                  className={cn(
                    buttonVariants({ variant: "eli" }),
                    "text-sm h-9 px-4 transition-all",
                    saveDisabled
                      ? "opacity-40 cursor-not-allowed shadow-none"
                      : "shadow-md ring-2 ring-emerald-600/25 bg-emerald-700 hover:bg-emerald-800",
                  )}
                >
                  {saveLabel}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close panel"
                className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {children}
        </div>

        {/* Footer */}
        {savePlacement === "footer" && (
          <div className="shrink-0 border-t border-border px-6 py-4 flex items-center justify-end bg-background">
            <button
              type="button"
              onClick={onSave}
              disabled={saveDisabled}
              className={cn(
                buttonVariants({ variant: "eli" }),
                saveDisabled ? "opacity-40 cursor-not-allowed" : "shadow-sm ring-2 ring-emerald-600/20",
              )}
            >
              {saveLabel}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
