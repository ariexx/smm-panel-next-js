"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart3,
  CreditCard,
  DollarSign,
  Home,
  LineChart,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if we're in a browser environment before trying to access localStorage
    if (typeof window !== "undefined") {
      // Simple check for an existing session in localStorage
      // This avoids the Supabase client initialization error when env vars aren't set
      const hasSession = localStorage.getItem("supabase.auth.token")

      if (hasSession) {
        router.push("/dashboard")
      } else {
        router.push("/login")
      }
    }

    // Set a timeout to prevent indefinite loading if something goes wrong
    const timeout = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timeout)
  }, [router])

  // If still loading, show a loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Sparkles className="mx-auto h-10 w-10 text-primary animate-pulse" />
          <h2 className="mt-4 text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    )
  }

  // If we get here, something went wrong with the redirection
  // Show a landing page with login/register options
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">SocialBoost</CardTitle>
          <CardDescription>Your all-in-one SMM Panel solution</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4 text-center">
          <p>Boost your social media presence with our premium services</p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button asChild className="w-full">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/register">Create Account</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export function Dashboard() {
  const [orderQuantity, setOrderQuantity] = useState("1000")
  const [orderUrl, setOrderUrl] = useState("")

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-border/40 pb-2">
            <div className="flex items-center gap-2 px-4 py-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">SocialBoost</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive tooltip="Dashboard">
                      <Home className="h-4 w-4" />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="New Order">
                      <ShoppingCart className="h-4 w-4" />
                      <span>New Order</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Services">
                      <Package className="h-4 w-4" />
                      <span>Services</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Order History">
                      <BarChart3 className="h-4 w-4" />
                      <span>Order History</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Account</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Add Funds">
                      <DollarSign className="h-4 w-4" />
                      <span>Add Funds</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="API">
                      <LineChart className="h-4 w-4" />
                      <span>API</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Settings">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-border/40 p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-muted-foreground">Premium Member</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <div className="flex flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
              <SidebarTrigger />
              <div className="w-full flex-1">
                <form>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search services..."
                      className="w-full bg-background shadow-none appearance-none pl-8 md:w-2/3 lg:w-1/3"
                    />
                  </div>
                </form>
              </div>
              <Button variant="outline" size="sm">
                <Users className="mr-2 h-4 w-4" />
                Invite Friends
              </Button>
              <Button size="sm">
                <DollarSign className="mr-2 h-4 w-4" />
                Add Funds
              </Button>
            </header>

            <main className="flex-1 p-6">
              <div className="flex flex-col gap-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">$125.00</div>
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          <Plus className="mr-1 h-3 w-3" /> Top Up
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <div className="text-2xl font-bold">247</div>
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Spent This Month</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <div className="text-2xl font-bold">$432.80</div>
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <div className="text-2xl font-bold">12</div>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Quick Order</CardTitle>
                      <CardDescription>Place a new order in seconds</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        <div>
                          <label
                            htmlFor="service"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2"
                          >
                            Select Service
                          </label>
                          <Select defaultValue="instagram-followers">
                            <SelectTrigger>
                              <SelectValue placeholder="Select a service" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="instagram-followers">Instagram Followers</SelectItem>
                              <SelectItem value="instagram-likes">Instagram Likes</SelectItem>
                              <SelectItem value="tiktok-followers">TikTok Followers</SelectItem>
                              <SelectItem value="tiktok-likes">TikTok Likes</SelectItem>
                              <SelectItem value="youtube-views">YouTube Views</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label
                            htmlFor="url"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2"
                          >
                            Link
                          </label>
                          <Input
                            id="url"
                            placeholder="https://instagram.com/username"
                            value={orderUrl}
                            onChange={(e) => setOrderUrl(e.target.value)}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="quantity"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2"
                          >
                            Quantity
                          </label>
                          <Select value={orderQuantity} onValueChange={setOrderQuantity}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select quantity" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="500">500 followers</SelectItem>
                              <SelectItem value="1000">1,000 followers</SelectItem>
                              <SelectItem value="2500">2,500 followers</SelectItem>
                              <SelectItem value="5000">5,000 followers</SelectItem>
                              <SelectItem value="10000">10,000 followers</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Price:</p>
                            <p className="text-2xl font-bold">${(Number.parseInt(orderQuantity) * 0.012).toFixed(2)}</p>
                          </div>
                          <Button size="lg" className="bg-primary hover:bg-primary/90">
                            Place Order
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Popular Services</CardTitle>
                      <CardDescription>Most ordered services</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Instagram Followers</p>
                            <p className="text-xs text-muted-foreground">High Quality • Fast</p>
                          </div>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            $1.20/100
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">TikTok Likes</p>
                            <p className="text-xs text-muted-foreground">Real • Non-drop</p>
                          </div>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            $0.80/100
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">YouTube Views</p>
                            <p className="text-xs text-muted-foreground">Retention • Worldwide</p>
                          </div>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            $1.50/1000
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Twitter Followers</p>
                            <p className="text-xs text-muted-foreground">Mixed Quality • Fast</p>
                          </div>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            $2.00/100
                          </Badge>
                        </div>

                        <Button variant="outline" className="w-full mt-2">
                          View All Services
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Tabs defaultValue="all" className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Recent Orders</h2>
                    <TabsList>
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="pending">Pending</TabsTrigger>
                      <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="all" className="mt-0">
                    <Card>
                      <CardContent className="p-0">
                        <div className="rounded-md border">
                          <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                              <thead>
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    ID
                                  </th>
                                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Service
                                  </th>
                                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Quantity
                                  </th>
                                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Price
                                  </th>
                                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Status
                                  </th>
                                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Date
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="[&_tr:last-child]:border-0">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                  <td className="p-4 align-middle">#12345</td>
                                  <td className="p-4 align-middle">Instagram Followers</td>
                                  <td className="p-4 align-middle">1,000</td>
                                  <td className="p-4 align-middle">$12.00</td>
                                  <td className="p-4 align-middle">
                                    <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/10">
                                      Pending
                                    </Badge>
                                  </td>
                                  <td className="p-4 align-middle">2023-05-01</td>
                                </tr>
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                  <td className="p-4 align-middle">#12344</td>
                                  <td className="p-4 align-middle">TikTok Likes</td>
                                  <td className="p-4 align-middle">2,500</td>
                                  <td className="p-4 align-middle">$20.00</td>
                                  <td className="p-4 align-middle">
                                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/10">
                                      Completed
                                    </Badge>
                                  </td>
                                  <td className="p-4 align-middle">2023-04-29</td>
                                </tr>
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                  <td className="p-4 align-middle">#12343</td>
                                  <td className="p-4 align-middle">YouTube Views</td>
                                  <td className="p-4 align-middle">10,000</td>
                                  <td className="p-4 align-middle">$15.00</td>
                                  <td className="p-4 align-middle">
                                    <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/10">
                                      Processing
                                    </Badge>
                                  </td>
                                  <td className="p-4 align-middle">2023-04-28</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between border-t p-4">
                        <Button variant="outline" size="sm">
                          Previous
                        </Button>
                        <Button variant="outline" size="sm">
                          Next
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  <TabsContent value="pending" className="mt-0">
                    <Card>
                      <CardContent className="p-0">
                        <div className="rounded-md border">
                          <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                              <thead>
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    ID
                                  </th>
                                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Service
                                  </th>
                                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Quantity
                                  </th>
                                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Price
                                  </th>
                                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Status
                                  </th>
                                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Date
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="[&_tr:last-child]:border-0">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                  <td className="p-4 align-middle">#12345</td>
                                  <td className="p-4 align-middle">Instagram Followers</td>
                                  <td className="p-4 align-middle">1,000</td>
                                  <td className="p-4 align-middle">$12.00</td>
                                  <td className="p-4 align-middle">
                                    <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/10">
                                      Pending
                                    </Badge>
                                  </td>
                                  <td className="p-4 align-middle">2023-05-01</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="completed" className="mt-0">
                    <Card>
                      <CardContent className="p-0">
                        <div className="rounded-md border">
                          <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                              <thead>
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    ID
                                  </th>
                                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Service
                                  </th>
                                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Quantity
                                  </th>
                                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Price
                                  </th>
                                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Status
                                  </th>
                                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Date
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="[&_tr:last-child]:border-0">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                  <td className="p-4 align-middle">#12344</td>
                                  <td className="p-4 align-middle">TikTok Likes</td>
                                  <td className="p-4 align-middle">2,500</td>
                                  <td className="p-4 align-middle">$20.00</td>
                                  <td className="p-4 align-middle">
                                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/10">
                                      Completed
                                    </Badge>
                                  </td>
                                  <td className="p-4 align-middle">2023-04-29</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
