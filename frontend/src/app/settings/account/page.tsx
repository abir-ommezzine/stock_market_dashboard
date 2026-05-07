"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth.context"
import { changePassword } from "@/lib/api/auth.api"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { Loader2, Pencil } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
})

type PasswordFormValues = z.infer<typeof passwordFormSchema>
type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>

export default function AccountSettings() {
  const { user, isAuthenticated, login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const personalInfoForm = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    },
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/sign-in-3", {
        state: {
          redirect: location.pathname,
          locationState: location.state
        }
      })
    }
  }, [isAuthenticated, navigate, location])

  useEffect(() => {
    if (user) {
      personalInfoForm.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      })
    }
  }, [user, personalInfoForm])

  async function onSubmit(data: PasswordFormValues) {
    if (!user) {
      toast.error("You must be logged in to change your password")
      return
    }

    setLoading(true)
    try {
      await changePassword(user.id, data.currentPassword, data.newPassword)
      toast.success("Password changed successfully!")
      form.reset()
    } catch (error: any) {
      toast.error(error.message || "Failed to change password")
    } finally {
      setLoading(false)
    }
  }

  async function onPersonalInfoSubmit(data: PersonalInfoFormValues) {
    if (!user) {
      toast.error("You must be logged in to update your information")
      return
    }

    setEditLoading(true)
    try {
      const response = await fetch(`http://localhost:8083/api/auth/update-profile/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const updatedUser = await response.json()
      
      login({
        ...user,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
      })

      toast.success("Personal information updated successfully!")
      setEditDialogOpen(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to update personal information")
    } finally {
      setEditLoading(false)
    }
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <BaseLayout>
      <div className="space-y-6 px-4 lg:px-6">
        <div>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Your account information
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => setEditDialogOpen(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">First Name</p>
                <p className="text-sm text-muted-foreground">{user?.firstName || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Name</p>
                <p className="text-sm text-muted-foreground">{user?.lastName || "N/A"}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Email Address</p>
              <p className="text-sm text-muted-foreground">{user?.email || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter current password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter new password (min 6 characters)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirm new password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex space-x-2">
              <Button type="submit" className="cursor-pointer" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
              <Button 
                variant="outline" 
                type="button" 
                className="cursor-pointer"
                onClick={() => form.reset()}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Personal Information</DialogTitle>
              <DialogDescription>
                Update your personal information below.
              </DialogDescription>
            </DialogHeader>
            <Form {...personalInfoForm}>
              <form onSubmit={personalInfoForm.handleSubmit(onPersonalInfoSubmit)} className="space-y-4">
                <FormField
                  control={personalInfoForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={personalInfoForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={personalInfoForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditDialogOpen(false)}
                    disabled={editLoading}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={editLoading} className="cursor-pointer">
                    {editLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </BaseLayout>
  )
}
