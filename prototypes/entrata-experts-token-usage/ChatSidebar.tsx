import { useState } from "react"
import { Plus, MessageSquare, Search, X } from "lucide-react"
import { Button } from "@sandbox-components/ui/button"
import { Input } from "@sandbox-components/ui/input"
import { ScrollArea } from "@sandbox-components/ui/scroll-area"
import { cn } from "@sandbox-lib/utils"
import type { Conversation } from "./types"

interface ChatSidebarProps {
  conversations: Conversation[]
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filtered = conversations.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.preview.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const todayConversations = filtered.filter((c) => c.timestamp.includes("Mar 10"))
  const yesterdayConversations = filtered.filter((c) => c.timestamp.includes("Mar 9"))
  const olderConversations = filtered.filter(
    (c) => !c.timestamp.includes("Mar 10") && !c.timestamp.includes("Mar 9")
  )

  return (
    <div className="flex flex-col h-full bg-muted/30">
      <div className="p-3 space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onNewConversation}
        >
          <Plus className="h-4 w-4" />
          New conversation
        </Button>

        <div className="relative">
          <Input
            type="search"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-4 pb-4">
          {todayConversations.length > 0 && (
            <ConversationGroup
              label="Today"
              conversations={todayConversations}
              activeId={activeConversationId}
              onSelect={onSelectConversation}
            />
          )}
          {yesterdayConversations.length > 0 && (
            <ConversationGroup
              label="Yesterday"
              conversations={yesterdayConversations}
              activeId={activeConversationId}
              onSelect={onSelectConversation}
            />
          )}
          {olderConversations.length > 0 && (
            <ConversationGroup
              label="Previous 7 days"
              conversations={olderConversations}
              activeId={activeConversationId}
              onSelect={onSelectConversation}
            />
          )}
          {filtered.length === 0 && (
            <div className="px-3 py-8 text-center">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">No conversations found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

function ConversationGroup({
  label,
  conversations,
  activeId,
  onSelect,
}: {
  label: string
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <div className="space-y-1">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
              "hover:bg-muted",
              activeId === conv.id && "bg-muted"
            )}
          >
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground mt-1 shrink-0" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{conv.title}</p>
                <p className="text-xs text-muted-foreground truncate">{conv.preview}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
