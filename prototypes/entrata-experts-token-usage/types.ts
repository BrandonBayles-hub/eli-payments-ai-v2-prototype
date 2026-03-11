export interface ChatMessage {
  id: string
  sender: "user" | "assistant"
  content: string
  timestamp: string
  tokenCost?: number
}

export interface Conversation {
  id: string
  title: string
  preview: string
  timestamp: string
  messageCount: number
  tokensUsed: number
  messages: ChatMessage[]
}

export interface UsageStats {
  tokensUsed: number
  tokenLimit: number
  percentUsed: number
  periodStart: string
  periodEnd: string
  conversationCount: number
  avgTokensPerConversation: number
}

export type UsageThreshold = "under-50" | "at-50" | "at-75" | "at-90" | "at-100"

export interface UserUsage {
  id: string
  name: string
  email: string
  role: string
  property: string
  tokensUsed: number
  tokenLimit: number
  percentUsed: number
  conversationCount: number
  lastActive: string
  status: "active" | "approaching-limit" | "at-limit"
}

export interface PropertyUsage {
  id: string
  name: string
  totalTokensUsed: number
  totalTokenLimit: number
  percentUsed: number
  userCount: number
  activeUsers: number
  conversationCount: number
}

export interface ClientUsage {
  id: string
  name: string
  totalTokensUsed: number
  totalTokenLimit: number
  percentUsed: number
  propertyCount: number
  userCount: number
  conversationCount: number
  properties: PropertyUsage[]
}

export interface AuditConversation {
  id: string
  userId: string
  userName: string
  userEmail: string
  property: string
  title: string
  messageCount: number
  tokensUsed: number
  startedAt: string
  lastMessageAt: string
  messages: ChatMessage[]
  flagged: boolean
  flagReason?: string
}

export interface AllotmentChange {
  id: string
  timestamp: string
  changedBy: string
  previousLimit: number
  newLimit: number
  reason: string
  level: "client" | "property" | "user"
  targetName: string
}

export interface BetaClient {
  id: string
  name: string
  plan: "beta-small" | "beta-medium" | "beta-large"
  tokenAllotment: number
  tokensUsed: number
  percentUsed: number
  propertyCount: number
  userCount: number
  activeUsers: number
  conversationCount: number
  avgTokensPerUser: number
  topUsageProperty: string
  enrolledDate: string
  lastActive: string
  feedbackScore: number | null
  allotmentHistory: AllotmentChange[]
  status: "healthy" | "watch" | "critical" | "exhausted"
}

export interface BetaOverview {
  totalClients: number
  totalTokensAllocated: number
  totalTokensUsed: number
  percentUsed: number
  clientsAtLimit: number
  clientsApproaching: number
  avgUtilization: number
  allotmentChangesThisWeek: number
}
