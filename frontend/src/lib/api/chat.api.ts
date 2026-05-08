const API_BASE = "http://localhost:8083/api/chat"

export interface ConversationRequest {
  subject: string
  initialMessage: string
}

export interface MessageRequest {
  content: string
}

export interface MessageResponse {
  id: number
  senderId: number
  senderFirstName: string
  senderLastName: string
  content: string
  isAdminMessage: boolean
  createdAt: string
}

export interface ConversationResponse {
  id: number
  userId: number
  userFirstName: string
  userLastName: string
  userEmail: string
  subject: string
  status: string
  createdAt: string
  lastMessageAt: string
  messages?: MessageResponse[]
  lastMessage?: string
}

export async function createConversation(request: ConversationRequest): Promise<ConversationResponse> {
  const token = localStorage.getItem("auth_token")
  const res = await fetch(`${API_BASE}/conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(request),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Failed to create conversation")
  }

  return res.json()
}

export async function getConversations(): Promise<ConversationResponse[]> {
  const token = localStorage.getItem("auth_token")
  const res = await fetch(`${API_BASE}/conversations`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Failed to fetch conversations")
  }

  return res.json()
}

export async function getConversation(conversationId: number): Promise<ConversationResponse> {
  const token = localStorage.getItem("auth_token")
  const res = await fetch(`${API_BASE}/conversations/${conversationId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Failed to fetch conversation")
  }

  return res.json()
}

export async function sendMessage(conversationId: number, request: MessageRequest): Promise<MessageResponse> {
  const token = localStorage.getItem("auth_token")
  const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(request),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Failed to send message")
  }

  return res.json()
}

export async function closeConversation(conversationId: number): Promise<void> {
  const token = localStorage.getItem("auth_token")
  const res = await fetch(`${API_BASE}/conversations/${conversationId}/close`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Failed to close conversation")
  }
}
