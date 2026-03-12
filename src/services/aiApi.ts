import { apiGet, apiPost } from './api'

type ChatRole = 'system' | 'user' | 'assistant'

type ChatMessage = {
  role: ChatRole
  content: string
}

export type AiChatResult = {
  reply: string
  provider: string
  model: string
  phase: 'clarify' | 'recommend'
  quickReplies: string[]
}

export async function askAiChat(input: {
  message: string
  history: ChatMessage[]
  threadId?: string
  userId?: string
  appContext?: string
}): Promise<AiChatResult> {
  const apiKey = import.meta.env.VITE_GROK_API_KEY?.trim()
  return apiPost<
    AiChatResult,
    { message: string; history: ChatMessage[]; apiKey?: string; threadId?: string; userId?: string; appContext?: string }
  >('/ai/chat', {
    message: input.message,
    history: input.history,
    apiKey: apiKey || undefined,
    threadId: input.threadId,
    userId: input.userId,
    appContext: input.appContext,
  })
}

export async function getAiThread(threadId: string) {
  return apiGet<Array<{ role: ChatRole; content: string; createdAt?: string }>>(`/ai/threads/${threadId}`)
}
