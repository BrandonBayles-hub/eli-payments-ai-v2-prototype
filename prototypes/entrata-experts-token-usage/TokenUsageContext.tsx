import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react"
import type {
  Conversation,
  ChatMessage,
  UsageStats,
  UsageThreshold,
  AllotmentChange,
  UserUsage,
  ClientUsage,
  PropertyUsage,
  BetaClient,
} from "./types"
import {
  sampleConversations,
  sampleUserUsage,
  samplePropertyUsage,
  sampleAuditConversations,
  aiResponsePool,
} from "./sample-data"

function computeThreshold(percent: number): UsageThreshold {
  if (percent >= 100) return "at-100"
  if (percent >= 90) return "at-90"
  if (percent >= 75) return "at-75"
  if (percent >= 50) return "at-50"
  return "under-50"
}

function formatTimestamp(): string {
  const now = new Date()
  return now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

function formatDateTimestamp(): string {
  const now = new Date()
  const date = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  const time = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
  return `${date} ${time}`
}

interface TokenUsageContextValue {
  tokenAllotment: number
  tokensUsed: number
  percentUsed: number
  threshold: UsageThreshold
  usageStats: UsageStats

  conversations: Conversation[]
  activeConversationId: string | null
  activeConversation: Conversation | null

  allUsers: UserUsage[]
  allotmentHistory: AllotmentChange[]

  clientUsage: ClientUsage
  betaClient: BetaClient

  sendUserMessage: (message: string) => void
  generateResponse: () => void
  selectConversation: (id: string | null) => void
  startNewConversation: () => void
  adjustAllotment: (
    newLimit: number,
    reason: string,
    changedBy: string
  ) => void
}

const TokenUsageContext = createContext<TokenUsageContextValue | null>(null)

export function useTokenUsage() {
  const ctx = useContext(TokenUsageContext)
  if (!ctx)
    throw new Error("useTokenUsage must be used within TokenUsageProvider")
  return ctx
}

const PRIMARY_USER_ID = "u1"
const INITIAL_ALLOTMENT = 25_000
const INITIAL_TOKENS_USED = 10_550

export function TokenUsageProvider({ children }: { children: ReactNode }) {
  const [tokenAllotment, setTokenAllotment] = useState(INITIAL_ALLOTMENT)
  const [conversations, setConversations] = useState<Conversation[]>(
    () => sampleConversations
  )
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >("conv-1")
  const [allUsers, setAllUsers] = useState<UserUsage[]>(() => {
    return sampleUserUsage.map((u) =>
      u.id === PRIMARY_USER_ID
        ? { ...u, tokensUsed: INITIAL_TOKENS_USED, tokenLimit: INITIAL_ALLOTMENT, percentUsed: Math.round((INITIAL_TOKENS_USED / INITIAL_ALLOTMENT) * 100) }
        : { ...u, tokenLimit: INITIAL_ALLOTMENT }
    )
  })
  const [allotmentHistory, setAllotmentHistory] = useState<AllotmentChange[]>([
    {
      id: "ah-init",
      timestamp: "Feb 1, 2026 10:00 AM",
      changedBy: "Caleb Harris",
      previousLimit: 0,
      newLimit: INITIAL_ALLOTMENT,
      reason:
        "Initial beta enrollment — Sunset Property Group, 5 properties, 22 users",
      level: "client",
      targetName: "Sunset Property Group",
    },
  ])
  const [pendingResponseId, setPendingResponseId] = useState<string | null>(
    null
  )
  const [aiResponseIndex, setAiResponseIndex] = useState(0)

  const primaryUser = allUsers.find((u) => u.id === PRIMARY_USER_ID)!
  const tokensUsed = primaryUser.tokensUsed
  const percentUsed = Math.min(
    Math.round((tokensUsed / tokenAllotment) * 100),
    100
  )
  const threshold = computeThreshold(percentUsed)

  const totalTokensUsed = allUsers.reduce((sum, u) => sum + u.tokensUsed, 0)
  const totalConversations = allUsers.reduce(
    (sum, u) => sum + u.conversationCount,
    0
  )

  const usageStats: UsageStats = useMemo(
    () => ({
      tokensUsed,
      tokenLimit: tokenAllotment,
      percentUsed,
      periodStart: "Mar 1, 2026",
      periodEnd: "Mar 31, 2026",
      conversationCount: conversations.length,
      avgTokensPerConversation:
        conversations.length > 0
          ? Math.round(tokensUsed / conversations.length)
          : 0,
    }),
    [tokensUsed, tokenAllotment, percentUsed, conversations.length]
  )

  const activeConversation = useMemo(
    () =>
      conversations.find((c) => c.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  )

  const clientUsage: ClientUsage = useMemo(
    () => ({
      id: "c1",
      name: "Sunset Property Group",
      totalTokensUsed,
      totalTokenLimit: tokenAllotment * allUsers.length,
      percentUsed: Math.min(
        Math.round(
          (totalTokensUsed / (tokenAllotment * allUsers.length)) * 100
        ),
        100
      ),
      propertyCount: 5,
      userCount: allUsers.length,
      conversationCount: totalConversations,
      properties: samplePropertyUsage.map((p) => {
        const propUsers = allUsers.filter((u) => u.property === p.name)
        const propTokens = propUsers.reduce((s, u) => s + u.tokensUsed, 0)
        const propLimit = propUsers.length * tokenAllotment
        return {
          ...p,
          totalTokensUsed: propTokens,
          totalTokenLimit: propLimit,
          percentUsed:
            propLimit > 0
              ? Math.min(Math.round((propTokens / propLimit) * 100), 100)
              : 0,
        }
      }),
    }),
    [allUsers, tokenAllotment, totalTokensUsed, totalConversations]
  )

  const betaClient: BetaClient = useMemo(() => {
    const clientTokensUsed = allUsers.reduce((s, u) => s + u.tokensUsed, 0)
    const clientPercent = Math.min(
      Math.round((clientTokensUsed / tokenAllotment) * 100),
      100
    )
    const activeUsers = allUsers.filter((u) => u.tokensUsed > 0).length
    let status: BetaClient["status"] = "healthy"
    if (clientPercent >= 100) status = "exhausted"
    else if (clientPercent >= 90) status = "critical"
    else if (clientPercent >= 75) status = "watch"

    return {
      id: "bc1",
      name: "Sunset Property Group",
      plan: "beta-large" as const,
      tokenAllotment,
      tokensUsed: clientTokensUsed,
      percentUsed: clientPercent,
      propertyCount: 5,
      userCount: allUsers.length,
      activeUsers,
      conversationCount: totalConversations,
      avgTokensPerUser:
        allUsers.length > 0
          ? Math.round(clientTokensUsed / allUsers.length)
          : 0,
      topUsageProperty: "Oak Ridge Townhomes",
      enrolledDate: "Feb 1, 2026",
      lastActive: "Mar 10, 2026",
      feedbackScore: 4.2,
      status,
      allotmentHistory,
    }
  }, [allUsers, tokenAllotment, totalConversations, allotmentHistory])

  const sendUserMessage = useCallback(
    (message: string) => {
      if (percentUsed >= 100) return

      const timeStr = formatTimestamp()
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}-user`,
        sender: "user",
        content: message,
        timestamp: timeStr,
      }

      if (activeConversationId) {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== activeConversationId) return c
            return {
              ...c,
              messageCount: c.messageCount + 1,
              messages: [...c.messages, userMsg],
              timestamp: formatDateTimestamp(),
              preview: message.slice(0, 60),
            }
          })
        )
        setPendingResponseId(activeConversationId)
      } else {
        const newId = `conv-${Date.now()}`
        const newConv: Conversation = {
          id: newId,
          title: message.length > 40 ? message.slice(0, 37) + "..." : message,
          preview: message.slice(0, 60),
          timestamp: formatDateTimestamp(),
          messageCount: 1,
          tokensUsed: 0,
          messages: [userMsg],
        }
        setConversations((prev) => [newConv, ...prev])
        setActiveConversationId(newId)
        setPendingResponseId(newId)
      }
    },
    [activeConversationId, percentUsed]
  )

  const generateResponse = useCallback(() => {
    if (!pendingResponseId) return

    const tokenCost = 1000 + Math.floor(Math.random() * 1000)
    const responseText = aiResponsePool[aiResponseIndex % aiResponsePool.length]
    setAiResponseIndex((i) => i + 1)

    const timeStr = formatTimestamp()
    const assistantMsg: ChatMessage = {
      id: `msg-${Date.now()}-assistant`,
      sender: "assistant",
      content: responseText,
      timestamp: timeStr,
      tokenCost,
    }

    const targetConvId = pendingResponseId

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== targetConvId) return c
        return {
          ...c,
          messageCount: c.messageCount + 1,
          tokensUsed: c.tokensUsed + tokenCost,
          messages: [...c.messages, assistantMsg],
        }
      })
    )

    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id !== PRIMARY_USER_ID) return u
        const newUsed = Math.min(u.tokensUsed + tokenCost, tokenAllotment)
        const newPercent = Math.min(
          Math.round((newUsed / tokenAllotment) * 100),
          100
        )
        return {
          ...u,
          tokensUsed: newUsed,
          percentUsed: newPercent,
          conversationCount: u.conversationCount + 1,
          lastActive: "Mar 10, 2026",
          status:
            newPercent >= 100
              ? "at-limit"
              : newPercent >= 75
                ? "approaching-limit"
                : "active",
        }
      })
    )

    setPendingResponseId(null)
  }, [pendingResponseId, aiResponseIndex, tokenAllotment])

  const selectConversation = useCallback((id: string | null) => {
    setActiveConversationId(id)
  }, [])

  const startNewConversation = useCallback(() => {
    setActiveConversationId(null)
  }, [])

  const adjustAllotment = useCallback(
    (newLimit: number, reason: string, changedBy: string) => {
      const change: AllotmentChange = {
        id: `ah-${Date.now()}`,
        timestamp: formatDateTimestamp(),
        changedBy,
        previousLimit: tokenAllotment,
        newLimit,
        reason,
        level: "client",
        targetName: "Sunset Property Group",
      }

      setAllotmentHistory((prev) => [...prev, change])
      setTokenAllotment(newLimit)

      setAllUsers((prev) =>
        prev.map((u) => {
          const newPercent = Math.min(
            Math.round((u.tokensUsed / newLimit) * 100),
            100
          )
          return {
            ...u,
            tokenLimit: newLimit,
            percentUsed: newPercent,
            status:
              newPercent >= 100
                ? ("at-limit" as const)
                : newPercent >= 75
                  ? ("approaching-limit" as const)
                  : ("active" as const),
          }
        })
      )
    },
    [tokenAllotment]
  )

  const value: TokenUsageContextValue = useMemo(
    () => ({
      tokenAllotment,
      tokensUsed,
      percentUsed,
      threshold,
      usageStats,
      conversations,
      activeConversationId,
      activeConversation,
      allUsers,
      allotmentHistory,
      clientUsage,
      betaClient,
      sendUserMessage,
      generateResponse,
      selectConversation,
      startNewConversation,
      adjustAllotment,
    }),
    [
      tokenAllotment,
      tokensUsed,
      percentUsed,
      threshold,
      usageStats,
      conversations,
      activeConversationId,
      activeConversation,
      allUsers,
      allotmentHistory,
      clientUsage,
      betaClient,
      sendUserMessage,
      generateResponse,
      selectConversation,
      startNewConversation,
      adjustAllotment,
    ]
  )

  return (
    <TokenUsageContext.Provider value={value}>
      {children}
    </TokenUsageContext.Provider>
  )
}
