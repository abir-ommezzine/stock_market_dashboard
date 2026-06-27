"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth.context"
import { getAdminStats, getAllUsers, searchUsers, getAllPredictions, createAdmin, type AdminStats, type UserSummary, type PredictionSummary } from "@/lib/api/admin.api"
import { 
  getConversations, 
  getConversation, 
  sendMessage,
  closeConversation,
  type ConversationResponse,
  type MessageResponse 
} from "@/lib/api/chat.api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/mode-toggle"
import { Logo } from "@/components/logo"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Users, TrendingUp, BarChart3, UserPlus,
  Search, LogOut, Loader2, Activity, LineChart, RefreshCw, Send, CheckCircle
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

export default function AdminPage() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin && user !== null) {
      toast.error("Access denied. Admin privileges required.")
      navigate("/dashboard")
    } else if (!user) {
      // User logged out, redirect to login without error
      navigate("/auth/sign-in-3")
    }
  }, [isAdmin, user, navigate])

  const [stats, setStats]       = useState<AdminStats | null>(null)
  const [users, setUsers]       = useState<UserSummary[]>([])
  const [predictions, setPredictions] = useState<PredictionSummary[]>([])
  const [search, setSearch]     = useState("")
  const [tab, setTab]           = useState<"overview" | "users" | "predictions" | "support">("overview")
  const [loading, setLoading]   = useState(true)
  const [createAdminDialogOpen, setCreateAdminDialogOpen] = useState(false)
  const [adminForm, setAdminForm] = useState({ firstName: "", lastName: "", email: "", password: "" })
  const [creatingAdmin, setCreatingAdmin] = useState(false)

  // Support tab state
  const [conversations, setConversations] = useState<ConversationResponse[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null)
  const [supportMessages, setSupportMessages] = useState<MessageResponse[]>([])
  const [supportLoading, setSupportLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [closing, setClosing] = useState(false)
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    Promise.all([getAdminStats(), getAllUsers(), getAllPredictions()])
      .then(([s, u, p]) => { setStats(s); setUsers(u); setPredictions(p) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  // Refresh predictions when switching to predictions tab
  useEffect(() => {
    if (tab === 'predictions') {
      getAllPredictions()
        .then(setPredictions)
        .catch(console.error)
    } else if (tab === 'support') {
      loadSupportConversations()
    }
  }, [tab])

  useEffect(() => {
    if (!search.trim()) {
      getAllUsers().then(setUsers).catch(console.error)
      return
    }
    const t = setTimeout(() => {
      searchUsers(search).then(setUsers).catch(console.error)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  const handleLogout = () => { logout(); navigate("/dashboard") }

  const handleRefreshPredictions = async () => {
    try {
      const [s, p] = await Promise.all([getAdminStats(), getAllPredictions()])
      setStats(s)
      setPredictions(p)
      toast.success('Predictions refreshed')
    } catch (error) {
      console.error('Failed to refresh predictions:', error)
      toast.error('Failed to refresh predictions')
    }
  }

  const handleCreateAdmin = async () => {
    if (!adminForm.firstName || !adminForm.lastName || !adminForm.email || !adminForm.password) {
      toast.error('All fields are required')
      return
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(adminForm.email.trim())) {
      toast.error('Please enter a valid email address')
      return
    }

    if (adminForm.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setCreatingAdmin(true)
    try {
      const newAdmin = await createAdmin(adminForm)
      setUsers(prev => [newAdmin, ...prev])
      const updatedStats = await getAdminStats()
      setStats(updatedStats)
      toast.success(`Admin account created for ${adminForm.email}`)
      setAdminForm({ firstName: "", lastName: "", email: "", password: "" })
      setCreateAdminDialogOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create admin account')
    } finally {
      setCreatingAdmin(false)
    }
  }

  // Support functions
  const loadSupportConversations = async () => {
    try {
      setSupportLoading(true)
      const convos = await getConversations()
      setConversations(convos)
      
      if (convos.length > 0 && !selectedConversation) {
        loadSupportConversation(convos[0].id)
      }
    } catch (error) {
      console.error("Failed to load conversations:", error)
    } finally {
      setSupportLoading(false)
    }
  }

  const loadSupportConversation = async (conversationId: number) => {
    try {
      const convo = await getConversation(conversationId)
      setSelectedConversation(convo)
      setSupportMessages(convo.messages || [])
    } catch (error) {
      console.error(`Failed to load conversation ${conversationId}:`, error)
    }
  }

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim() || sending) return

    try {
      setSending(true)
      const message = await sendMessage(selectedConversation.id, { content: newMessage.trim() })
      
      setSupportMessages(prev => [...prev, message])
      setNewMessage("")
      
      setConversations(prev => prev.map(c => 
        c.id === selectedConversation.id 
          ? { ...c, lastMessage: message.content, lastMessageAt: message.createdAt }
          : c
      ))
    } catch (error) {
      console.error("Failed to send message:", error)
      toast.error("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const handleCloseConversation = async () => {
    if (!selectedConversation || closing) return

    try {
      setClosing(true)
      await closeConversation(selectedConversation.id)
      
      setConversations(prev => prev.map(c => 
        c.id === selectedConversation.id 
          ? { ...c, status: "CLOSED" }
          : c
      ))
      
      setSelectedConversation(prev => prev ? { ...prev, status: "CLOSED" } : null)
      
      toast.success("Conversation closed successfully")
    } catch (error: any) {
      console.error("Failed to close conversation:", error)
      toast.error(error.message || "Failed to close conversation")
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
            <Logo size={20} />
          </div>
          <span className="font-semibold text-lg">Stocky Admin</span>
          <Badge variant="destructive" className="text-xs">Admin</Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user?.firstName} {user?.lastName}</span>
          <ModeToggle />
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="size-4 mr-1" /> Sign out
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b pb-2">
          {(["overview", "users", "predictions", "support"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors capitalize
                ${tab === t
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : tab === "overview" ? (
          // ── Overview Tab ──
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={<Users className="size-5 text-blue-500" />}
                label="Total Users" value={stats?.totalUsers ?? 0} />
              <StatCard icon={<UserPlus className="size-5 text-green-500" />}
                label="New This Month" value={stats?.newUsersThisMonth ?? 0} />
              <StatCard icon={<TrendingUp className="size-5 text-purple-500" />}
                label="Total Predictions" value={stats?.totalPredictions ?? 0} />
              <StatCard icon={<BarChart3 className="size-5 text-orange-500" />}
                label="Models Used" value={Object.keys(stats?.predictionsByModel ?? {}).length} />
            </div>

            {/* Predictions by model */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Predictions by Model</CardTitle>
              </CardHeader>
              <CardContent>
                {stats && Object.keys(stats.predictionsByModel).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(stats.predictionsByModel).map(([model, count]) => {
                      const total = stats.totalPredictions || 1
                      const pct = Math.round((count / total) * 100)
                      return (
                        <div key={model} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{model}</span>
                            <span className="text-muted-foreground">{count} ({pct}%)</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No predictions yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : tab === "users" ? (
          // ── Users Tab ──
          <div className="space-y-6">
            {/* User Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-3xl font-bold mt-1">{stats?.totalUsers ?? 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">All registered users</p>
                    </div>
                    <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-3">
                      <Users className="size-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">New This Month</p>
                      <p className="text-3xl font-bold mt-1">{stats?.newUsersThisMonth ?? 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">Recent signups</p>
                    </div>
                    <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
                      <UserPlus className="size-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Users</p>
                      <p className="text-3xl font-bold mt-1">
                        {users.filter(u => u.predictionCount > 0).length}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Made predictions</p>
                    </div>
                    <div className="rounded-full bg-purple-100 dark:bg-purple-900/20 p-3">
                      <Activity className="size-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Admin Users</p>
                      <p className="text-3xl font-bold mt-1">
                        {users.filter(u => u.role === "ADMIN").length}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Administrator accounts</p>
                    </div>
                    <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
                      <Badge className="size-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search Bar and Create Admin Button */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-9"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <Button 
                onClick={() => setCreateAdminDialogOpen(true)} 
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Create Admin
              </Button>
            </div>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  All Users ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        {["Name", "Email", "Role", "Predictions", "Joined"].map(h => (
                          <th key={h} className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                            No users found.
                          </td>
                        </tr>
                      ) : users.map(u => (
                        <tr key={u.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-medium">{u.firstName} {u.lastName}</td>
                          <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                          <td className="p-4">
                            <Badge variant={u.role === "ADMIN" ? "destructive" : "secondary"} className="text-xs">
                              {u.role}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm">{u.predictionCount}</td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : tab === "predictions" ? (
          // ── Predictions Tab ──
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">All Predictions</h2>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {predictions.length} total
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefreshPredictions}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Prediction Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Predictions</p>
                      <p className="text-3xl font-bold mt-1">{stats?.totalPredictions ?? 0}</p>
                    </div>
                    <div className="rounded-full bg-muted p-3">
                      <LineChart className="size-5 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Most Used Model</p>
                      <p className="text-2xl font-bold mt-1">
                        {stats && Object.keys(stats.predictionsByModel).length > 0
                          ? Object.entries(stats.predictionsByModel).sort((a, b) => b[1] - a[1])[0][0]
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="rounded-full bg-muted p-3">
                      <BarChart3 className="size-5 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Unique Stocks</p>
                      <p className="text-3xl font-bold mt-1">
                        {new Set(predictions.map(p => p.company)).size}
                      </p>
                    </div>
                    <div className="rounded-full bg-muted p-3">
                      <TrendingUp className="size-5 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {predictions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <LineChart className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No predictions yet</h3>
                  <p className="text-muted-foreground text-center">
                    Predictions will appear here once users start making forecasts.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Recent Predictions ({predictions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {predictions.slice(0, 50).map((pred) => (
                        <TableRow key={pred.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{pred.userName}</div>
                              <div className="text-xs text-muted-foreground">{pred.userEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{pred.company}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{pred.modelType}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(pred.createdAt), 'MMM dd, yyyy HH:mm')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        ) : tab === "support" ? (
          // ── Support Tab ──
          <div className="space-y-4">
            {supportLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : (
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
                          onClick={() => loadSupportConversation(conv.id)}
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
                          {supportMessages.map((msg) => (
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
            )}
          </div>
        ) : null}

        {/* Create Admin Dialog */}
        <Dialog open={createAdminDialogOpen} onOpenChange={setCreateAdminDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Admin Account</DialogTitle>
              <DialogDescription>
                Create a new administrator account with full access to the admin dashboard.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input
                    placeholder="John"
                    value={adminForm.firstName}
                    onChange={(e) => setAdminForm(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input
                    placeholder="Doe"
                    value={adminForm.lastName}
                    onChange={(e) => setAdminForm(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="text"
                  placeholder="admin@stocky.com"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, password: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateAdmin()
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setCreateAdminDialogOpen(false)
                  setAdminForm({ firstName: "", lastName: "", email: "", password: "" })
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateAdmin} 
                disabled={creatingAdmin}
              >
                {creatingAdmin ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Admin'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className="rounded-full bg-muted p-3">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}
