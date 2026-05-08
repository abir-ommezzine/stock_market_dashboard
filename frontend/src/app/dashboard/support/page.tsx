"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth.context"
import { useNavigate } from "react-router-dom"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, Send } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  getConversations, 
  getConversation, 
  createConversation, 
  sendMessage,
  type ConversationResponse,
  type MessageResponse 
} from "@/lib/api/chat.api"

export default function SupportPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [conversations, setConversations] = useState<ConversationResponse[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null)
  const [messages, setMessages] = useState<MessageResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [sending, setSending] = useState(false)
  
  const [subject, setSubject] = useState("")
  const [initialMessage, setInitialMessage] = useState("")
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    if (!user) {
      navigate("/auth/sign-in-3")
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

  const handleCreateConversation = async () => {
    if (!subject.trim() || !initialMessage.trim()) return

    try {
      setCreating(true)
      const newConvo = await createConversation({
        subject: subject.trim(),
        initialMessage: initialMessage.trim()
      })

      await loadConversations()
      await loadConversation(newConvo.id)

      setDialogOpen(false)
      setSubject("")
      setInitialMessage("")
    } catch (error: any) {
      console.error("Failed to create conversation:", error)
      alert(error.message || "Failed to create conversation")
    } finally {
      setCreating(false)
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (loading) {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center h-[600px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout>
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Customer Support</h1>
          <p className="text-muted-foreground">
            Get help from our support team
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start a New Conversation</DialogTitle>
              <DialogDescription>
                Describe your issue and our support team will help you.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue in detail..."
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateConversation}
                disabled={creating || !subject.trim() || !initialMessage.trim()}
                className="cursor-pointer"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Start Conversation"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="h-[600px] flex rounded-lg border overflow-hidden bg-background">
        {/* Conversations Sidebar */}
        <div className="w-80 border-r bg-background flex-shrink-0">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Conversations</h2>
          </div>
          <ScrollArea className="h-[calc(600px-57px)]">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No conversations yet. Start one!
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
                      <AvatarFallback>CS</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">Customer Support</h3>
                        <span className="text-xs text-muted-foreground">
                          {new Date(conv.lastMessageAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground truncate">
                        {conv.subject}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.lastMessage}
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
              <div className="h-16 px-4 border-b flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>CS</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">Customer Support</h2>
                  <p className="text-sm text-muted-foreground">{selectedConversation.subject}</p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isAdminMessage ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[70%] ${msg.isAdminMessage ? 'order-2' : 'order-1'}`}>
                        <div className={`rounded-lg p-3 ${
                          msg.isAdminMessage 
                            ? 'bg-muted' 
                            : 'bg-primary text-primary-foreground'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 px-1">
                          {msg.isAdminMessage ? `${msg.senderFirstName} ${msg.senderLastName}` : 'You'} • {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex items-end gap-2">
                  <Textarea
                    placeholder="Type your message..."
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
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Welcome to Support</h3>
                <p className="text-muted-foreground">
                  Select a conversation or start a new one
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </BaseLayout>
  )
}
