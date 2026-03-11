import { useState, useRef, useEffect } from "react"
import { Bot, Sparkles, Lock } from "lucide-react"
import { EliChatBubble } from "@sandbox-components/eli/EliChatBubble"
import { EliChatInput } from "@sandbox-components/eli/EliChatInput"
import { EliTypingIndicator } from "@sandbox-components/eli/EliTypingIndicator"
import { ScrollArea } from "@sandbox-components/ui/scroll-area"
import { Button } from "@sandbox-components/ui/button"
import { Skeleton } from "@sandbox-components/ui/skeleton"
import { EmptyState } from "@sandbox-components/composite/EmptyState"
import { cn } from "@sandbox-lib/utils"
import { UsageBanner } from "./UsageBanner"
import { UsageMeter } from "./UsageMeter"
import type { Conversation, UsageStats, UsageThreshold } from "./types"
import { suggestedPrompts } from "./sample-data"

interface ChatInterfaceProps {
  conversation: Conversation | null
  usage: UsageStats
  threshold: UsageThreshold
  viewState: string
  onSendMessage: (message: string) => void
}

export function ChatInterface({
  conversation,
  usage,
  threshold,
  viewState,
  onSendMessage,
}: ChatInterfaceProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation?.messages.length])

  const handleSend = (message: string) => {
    if (threshold === "at-100") return
    setIsProcessing(true)
    onSendMessage(message)
    setTimeout(() => setIsProcessing(false), 1500)
  }

  if (viewState === "loading") {
    return (
      <div className="flex flex-col h-full p-6 space-y-4">
        <Skeleton className="h-10 w-64 mx-auto" />
        <div className="flex-1 space-y-4 max-w-3xl mx-auto w-full">
          <div className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
          <div className="flex gap-3 justify-end">
            <Skeleton className="h-16 w-3/4 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-12 w-full max-w-3xl mx-auto rounded-lg" />
      </div>
    )
  }

  if (viewState === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center">
        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <Bot className="h-6 w-6 text-red-600" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Unable to connect to Entrata Experts</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          Something went wrong. Please check your connection and try again.
        </p>
        <Button variant="outline">Try Again</Button>
      </div>
    )
  }

  if (viewState === "empty" || !conversation) {
    return (
      <div className="flex flex-col h-full">
        {threshold !== "under-50" && (
          <div className="px-6 pt-4">
            <UsageBanner threshold={threshold} periodEnd={usage.periodEnd} />
          </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="text-center mb-8">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-primary" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Entrata Experts</h2>
            <p className="text-muted-foreground max-w-md">
              Your AI-powered property management advisor. Ask about leasing, maintenance, compliance, budgets, and more.
            </p>
          </div>

          {threshold === "at-100" ? (
            <div className="flex flex-col items-center text-center">
              <Lock className="h-8 w-8 text-muted-foreground mb-3" aria-hidden="true" />
              <p className="text-sm text-muted-foreground max-w-sm">
                You've reached your monthly token limit. Your usage will reset on {usage.periodEnd}.
                Contact your administrator for questions about your allocation.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="text-left p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
        </div>

        {threshold !== "at-100" && (
          <div className="px-6 pb-6 max-w-3xl mx-auto w-full">
            <EliChatInput
              onSubmit={handleSend}
              placeholder="Ask Entrata Experts anything..."
              disabled={threshold === "at-100"}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {threshold !== "under-50" && (
        <div className="px-6 pt-4">
          <UsageBanner threshold={threshold} periodEnd={usage.periodEnd} />
        </div>
      )}

      <ScrollArea className="flex-1 px-6 py-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {conversation.messages.map((msg) => (
            <EliChatBubble
              key={msg.id}
              sender={msg.sender === "assistant" ? "eli" : "user"}
              timestamp={msg.timestamp}
              userName={msg.sender === "user" ? "You" : undefined}
              aiStatus={msg.sender === "assistant" ? "ELI Generated" : undefined}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </EliChatBubble>
          ))}

          {isProcessing && <EliTypingIndicator label="Entrata Experts is thinking..." />}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="px-6 pb-4">
        <div className="max-w-3xl mx-auto space-y-2">
          {threshold === "at-100" ? (
            <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" aria-hidden="true" />
              <span>Token limit reached — usage resets {usage.periodEnd}</span>
            </div>
          ) : (
            <EliChatInput
              onSubmit={handleSend}
              processing={isProcessing}
              placeholder="Ask Entrata Experts anything..."
            />
          )}
          <div className="flex items-center justify-center">
            <UsageMeter usage={usage} threshold={threshold} compact />
          </div>
        </div>
      </div>
    </div>
  )
}
