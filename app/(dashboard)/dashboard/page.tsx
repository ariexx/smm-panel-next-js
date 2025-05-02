"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { CreditCard, Plus, ShoppingCart, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [orderQuantity, setOrderQuantity] = useState("1000")
  const [orderUrl, setOrderUrl] = useState("")
  const [selectedService, setSelectedService] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the current authenticated user
        const { data: authData } = await supabase.auth.getUser()

        if (!authData.user) {
          router.push("/login")
          return
        }

        // Get the user profile data
        const { data: userData } = await supabase.from("users").select("*").eq("id", authData.user.id).single()

        setUser(userData)

        // Get popular services
        const { data: servicesData } = await supabase
          .from("services")
          .select("*")
          .order("popularity", { ascending: false })
          .limit(4)

        setServices(servicesData || [])

        // Get recent orders
        const { data: ordersData } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", authData.user.id)
          .order("created_at", { ascending: false })
          .limit(10)

        setOrders(ordersData || [])

        // Set default selected service if services exist
        if (servicesData && servicesData.length > 0) {
          setSelectedService(servicesData[0].id)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router, supabase])

  const handlePlaceOrder = async () => {
    if (!selectedService || !orderUrl) {
      toast({
        title: "Missing information",
        description: "Please select a service and enter a valid URL",
        variant: "destructive",
      })
      return
    }

    try {
      // Find the selected service
      const service = services.find((s) => s.id === selectedService)

      if (!service) {
        throw new Error("Service not found")
      }

      const quantity = Number.parseInt(orderQuantity)
      const price = (quantity * service.price_per_1000) / 1000

      // Check if user has enough balance
      if (user.balance < price) {
        toast({
          title: "Insufficient balance",
          description: "Please add funds to your account",
          variant: "destructive",
        })
        return
      }

      // Create the order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: user.id,
            service_id: selectedService,
            quantity: quantity,
            link: orderUrl,
            price: price,
            status: "pending",
          },
        ])
        .select()

      if (orderError) {
        throw orderError
      }

      // Update user balance
      const { error: balanceError } = await supabase
        .from("users")
        .update({ balance: user.balance - price })
        .eq("id", user.id)

      if (balanceError) {
        throw balanceError
      }

      // Update local user state
      setUser({
        ...user,
        balance: user.balance - price,
      })

      // Add the new order to the orders list
      setOrders([orderData[0], ...orders])

      toast({
        title: "Order placed successfully",
        description: `Your order for ${service.name} has been placed`,
      })

      // Reset form
      setOrderUrl("")
    } catch (error: any) {
      toast({
        title: "Error placing order",
        description: error.message || "There was an error placing your order",
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/10"
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/10"
      case "processing":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/10"
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/10"
      default:
        return ""
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">${user?.balance?.toFixed(2) || "0.00"}</div>
                <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => router.push("/add-funds")}>
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
              <div className="text-2xl font-bold">{orders.length}</div>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Spent This Month</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                $
                {orders
                  .filter((order) => {
                    const orderDate = new Date(order.created_at)
                    const now = new Date()
                    return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()
                  })
                  .reduce((sum, order) => sum + order.price, 0)
                  .toFixed(2)}
              </div>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {orders.filter((order) => order.status === "pending" || order.status === "processing").length}
              </div>
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
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
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
                      <SelectItem value="500">500</SelectItem>
                      <SelectItem value="1000">1,000</SelectItem>
                      <SelectItem value="2500">2,500</SelectItem>
                      <SelectItem value="5000">5,000</SelectItem>
                      <SelectItem value="10000">10,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Price:</p>
                    <p className="text-2xl font-bold">
                      $
                      {selectedService && services.find((s) => s.id === selectedService)
                        ? (
                            (Number.parseInt(orderQuantity) *
                              services.find((s) => s.id === selectedService)!.price_per_1000) /
                            1000
                          ).toFixed(2)
                        : "0.00"}
                    </p>
                  </div>
                  <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={handlePlaceOrder}>
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
                {services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground">{service.description}</p>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      ${(service.price_per_1000 / 10).toFixed(2)}/100
                    </Badge>
                  </div>
                ))}

                <Button variant="outline" className="w-full mt-2" onClick={() => router.push("/services")}>
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
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Service
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Quantity
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Price</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {orders.length > 0 ? (
                          orders.map((order) => (
                            <tr
                              key={order.id}
                              className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                            >
                              <td className="p-4 align-middle">#{order.id}</td>
                              <td className="p-4 align-middle">
                                {services.find((s) => s.id === order.service_id)?.name || "Unknown Service"}
                              </td>
                              <td className="p-4 align-middle">{order.quantity.toLocaleString()}</td>
                              <td className="p-4 align-middle">${order.price.toFixed(2)}</td>
                              <td className="p-4 align-middle">
                                <Badge className={getStatusBadgeColor(order.status)}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </Badge>
                              </td>
                              <td className="p-4 align-middle">{new Date(order.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-4 text-center text-muted-foreground">
                              No orders found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
              {orders.length > 0 && (
                <CardFooter className="flex justify-between border-t p-4">
                  <Button variant="outline" size="sm">
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </CardFooter>
              )}
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
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Service
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Quantity
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Price</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {orders.filter((order) => order.status === "pending").length > 0 ? (
                          orders
                            .filter((order) => order.status === "pending")
                            .map((order) => (
                              <tr
                                key={order.id}
                                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                              >
                                <td className="p-4 align-middle">#{order.id}</td>
                                <td className="p-4 align-middle">
                                  {services.find((s) => s.id === order.service_id)?.name || "Unknown Service"}
                                </td>
                                <td className="p-4 align-middle">{order.quantity.toLocaleString()}</td>
                                <td className="p-4 align-middle">${order.price.toFixed(2)}</td>
                                <td className="p-4 align-middle">
                                  <Badge className={getStatusBadgeColor(order.status)}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </Badge>
                                </td>
                                <td className="p-4 align-middle">{new Date(order.created_at).toLocaleDateString()}</td>
                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-4 text-center text-muted-foreground">
                              No pending orders found
                            </td>
                          </tr>
                        )}
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
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Service
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Quantity
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Price</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {orders.filter((order) => order.status === "completed").length > 0 ? (
                          orders
                            .filter((order) => order.status === "completed")
                            .map((order) => (
                              <tr
                                key={order.id}
                                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                              >
                                <td className="p-4 align-middle">#{order.id}</td>
                                <td className="p-4 align-middle">
                                  {services.find((s) => s.id === order.service_id)?.name || "Unknown Service"}
                                </td>
                                <td className="p-4 align-middle">{order.quantity.toLocaleString()}</td>
                                <td className="p-4 align-middle">${order.price.toFixed(2)}</td>
                                <td className="p-4 align-middle">
                                  <Badge className={getStatusBadgeColor(order.status)}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </Badge>
                                </td>
                                <td className="p-4 align-middle">{new Date(order.created_at).toLocaleDateString()}</td>
                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-4 text-center text-muted-foreground">
                              No completed orders found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
