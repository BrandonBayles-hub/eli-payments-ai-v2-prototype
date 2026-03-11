import { ArrowLeft, Flag, MessageSquare, Clock, Zap, AlertCircle, RefreshCw, FolderOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@sandbox-components/ui/card"
import { Badge } from "@sandbox-components/ui/badge"
import { Button } from "@sandbox-components/ui/button"
import { Separator } from "@sandbox-components/ui/separator"
import { ScrollArea } from "@sandbox-components/ui/scroll-area"
import { Skeleton } from "@sandbox-components/ui/skeleton"
import { EmptyState } from "@sandbox-components/composite/EmptyState"
import { EliChatBubble } from "@sandbox-components/eli/EliChatBubble"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@sandbox-components/ui/table"
import { cn } from "@sandbox-lib/utils"
import type { AuditConversation, UserUsage } from "./types"
import { useState } from "react"

interface ConversationAuditProps {
  user: UserUsage
  conversations: AuditConversation[]
  viewState: string
  onBack: () => void
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`
  return tokens.toString()
}

export function ConversationAudit({
  user,
  conversations,
  viewState,
  onBack,
}: ConversationAuditProps) {
  const [expandedConversation, setExpandedConversation] = useState<string | null>(null)

  if (viewState === "loading") {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (viewState === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-error-foreground mb-4" aria-hidden="true" />
        <h3 className="text-lg font-semibold mb-1">Unable to load audit data</h3>
        <p className="text-sm text-muted-foreground mb-4">Something went wrong. Please try again.</p>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  if (viewState === "empty") {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>
        <EmptyState
          icon={FolderOpen}
          title="No conversations yet"
          description={`${user.name} hasn't had any conversations with Entrata Experts yet.`}
        />
      </div>
    )
  }

  const userConversations = conversations.filter((c) => c.userId === user.id)
  const flaggedCount = userConversations.filter((c) => c.flagged).length
  const totalTokens = userConversations.reduce((sum, c) => sum + c.tokensUsed, 0)

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </Button>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="gray">{user.role}</Badge>
                <Badge variant="blue">{user.property}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-semibold">{user.conversationCount}</p>
                <p className="text-xs text-muted-foreground">Conversations</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold">{formatTokens(user.tokensUsed)}</p>
                <p className="text-xs text-muted-foreground">Tokens Used</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold">{user.percentUsed}%</p>
                <p className="text-xs text-muted-foreground">Of Limit</p>
              </div>
              {flaggedCount > 0 && (
                <div className="text-center">
                  <p className="text-2xl font-semibold text-orange-600">{flaggedCount}</p>
                  <p className="text-xs text-muted-foreground">Flagged</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Conversation History</CardTitle>
            <Badge variant="gray">{userConversations.length} conversations</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Topic</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Last Message</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userConversations.map((conv) => (
                  <>
                    <TableRow
                      key={conv.id}
                      className={cn(conv.flagged && "bg-orange-50")}
                    >
                      <TableCell>
                        {conv.flagged && (
                          <Flag className="h-4 w-4 text-orange-500" aria-label="Flagged conversation" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{conv.title}</p>
                          {conv.flagReason && (
                            <p className="text-xs text-orange-600">{conv.flagReason}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{conv.messageCount}</TableCell>
                      <TableCell>{formatTokens(conv.tokensUsed)}</TableCell>
                      <TableCell>{conv.startedAt}</TableCell>
                      <TableCell>{conv.lastMessageAt}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setExpandedConversation(
                              expandedConversation === conv.id ? null : conv.id
                            )
                          }
                          aria-label={`View conversation: ${conv.title}`}
                        >
                          <MessageSquare className="h-4 w-4" />
                          {expandedConversation === conv.id ? "Hide" : "View"}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedConversation === conv.id && (
                      <TableRow key={`${conv.id}-expanded`}>
                        <TableCell colSpan={7} className="bg-muted/30 p-0">
                          <div className="p-6 max-w-3xl mx-auto space-y-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-semibold">{conv.title}</h4>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" aria-hidden="true" />
                                  {conv.messageCount} messages
                                </span>
                                <span className="flex items-center gap-1">
                                  <Zap className="h-3 w-3" aria-hidden="true" />
                                  {formatTokens(conv.tokensUsed)} tokens
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" aria-hidden="true" />
                                  {conv.startedAt}
                                </span>
                              </div>
                            </div>
                            <Separator />
                            <div className="space-y-3 pt-2">
                              {conv.messages.map((msg) => (
                                <EliChatBubble
                                  key={msg.id}
                                  sender={msg.sender === "assistant" ? "eli" : "user"}
                                  timestamp={msg.timestamp}
                                  userName={msg.sender === "user" ? conv.userName : undefined}
                                  aiStatus={msg.sender === "assistant" ? "ELI Generated" : undefined}
                                >
                                  <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                                </EliChatBubble>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
