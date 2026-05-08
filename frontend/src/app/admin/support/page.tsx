"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth.context"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Loader2, Send, CheckCircle } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  getConversations, 
  getConversation, 
  sendMessage,
  closeConversation,
  type ConversationResponse,
  type MessageResponse 
} from "@/lib/api/chat.api"

export default function AdminSupportPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  const [conversations, setConversations] = useState<ConversationResponse[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null)
  const [messages, setMessages] = useState<MessageResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [closing, setClosing] = useState(false)
  
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    if (!user) {
      navigate("/auth/sign-in-3")
      return
    }
    if (user.role !== "ADMIN") {
      navigate("/dashboard")
      return
    }
    loadConversations()
  }, [user, navigate])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const convos = await getConversations()
      setConversations(convos)
      
      // Auto-select first conversation if none selected
      if (convos.length > 0 && !selectedConversation) {
        loadConversation(convos[0].id)
      }
    } catch (error) {
      console.error("Failed to load conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadConversation = async (conversationId: number) => {
    try {
      const convo = await getConversation(conversationId)
      setSelectedConversation(convo)
      setMessages(convo.messages || [])
    } catch (error) {
      console.error(`Failed to load conversation ${conversationId}:`, error)
    }
  }

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim() || sending) return

    try {
      setSending(true)
      const message = await sendMessage(selectedConversation.id, { content: newMessage.trim() })
      
      setMessages(prev => [...prev, message])
      setNewMessage("")
      
      // Update last message in conversation list
      setConversations(prev => prev.map(c => 
        c.id === selectedConversation.id 
          ? { ...c, lastMessage: message.content, lastMessageAt: message.createdAt }
          : c
      ))
    } catch (error) {
      console.error("Failed to send message:", error)
      alert("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const handleCloseConversation = async () => {
    if (!selectedConversation || closing) return

    try {
      setClosing(true)
      await closeConversation(selectedConversation.id)
      
      // Update conversation status in list
      setConversations(prev => prev.map(c => 
        c.id === selectedConversation.id 
          ? { ...c, status: "CLOSED" }
          : c
      ))
      
      // Update selected conversation
      setSelectedConversation(prev => prev ? { ...prev, status: "CLOSED" } : null)
      
      alert("Conversation closed successfully")
    } catch (error: any) {
      console.error("Failed to close conversation:", error)
      alert(error.message || "Failed to close conversation")
    } finally {
      setClosing(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <>
      {/* Simple Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background">
        <div className="flex w-full items-center gap-2 px-4 py-3 lg:gap-4 lg:px-6">
          <h2 className="text-lg font-semibold">Admin Support</h2>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
            >
              Admin Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
            <span className="text-sm text-muted-foreground">
              {user?.firstName}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
            >
              Sign out
            </Button>
            <ModeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Support Conversations</h1>
          <p className="text-muted-foreground">
            Manage customer support requests
          </p>
        </div>
      </div>

      <div className="h-[600px] flex rounded-lg border overflow-hidden bg-background">
        {/* Conversations Sidebar */}
        <div className="w-80 border-r bg-background flex-shrink-0">
          <div className="p-4 border-b">
            <h2 className="font-semibold">All Conversations</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {conversations.length} total
            </p>
          </div>
          <ScrollArea className="h-[calc(600px-73px)]">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No conversations yet
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={`p-4 border-b cursor-pointer hover:bg-accent transition-colors ${
                    selectedConversation?.id === conv.id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {getInitials(conv.userFirstName, conv.userLastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-sm truncate">
                          {conv.userFirstName} {conv.userLastName}
                        </h3>
                        <Badge 
                          variant={conv.status === "OPEN" ? "default" : "secondary"}
                          className="text-xs flex-shrink-0"
                        >
                          {conv.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.userEmail}
                      </p>
                      <p className="text-sm font-medium text-muted-foreground truncate mt-1">
                        {conv.subject}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.lastMessage}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(conv.lastMessageAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </div>

        {/* Chat Panel */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="h-16 px-4 border-b flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback>
                      {getInitials(selectedConversation.userFirstName, selectedConversation.userLastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h2 className="font-semibold truncate">
                      {selectedConversation.userFirstName} {selectedConversation.userLastName}
                    </h2>
                    <p className="text-sm text-muted-foreground truncate">
                      {selectedConversation.subject}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={selectedConversation.status === "OPEN" ? "default" : "secondary"}>
                    {selectedConversation.status}
                  </Badge>
                  {selectedConversation.status === "OPEN" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCloseConversation}
                      disabled={closing}
                      className="cursor-pointer"
                    >
                      {closing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Closing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Close
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isAdminMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%]`}>
                        <div className={`rounded-lg p-3 ${
                          msg.isAdminMessage 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 px-1">
                          {msg.isAdminMessage ? 'You' : `${msg.senderFirstName} ${msg.senderLastName}`} • {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t p-4">
                {selectedConversation.status === "CLOSED" ? (
                  <div className="text-center text-muted-foreground py-2">
                    This conversation is closed
                  </div>
                ) : (
                  <div className="flex items-end gap-2">
                    <Textarea
                      placeholder="Type your response..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      disabled={sending}
                      className="min-h-[40px] max-h-[120px] resize-none"
                      rows={1}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Support Dashboard</h3>
                <p className="text-muted-foreground">
                  Select a conversation to view and respond
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  )
}
