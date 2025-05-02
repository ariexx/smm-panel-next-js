"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface Service {
  id: string
  name: string
  description: string
  category: string
  price_per_1000: number
  min_quantity: number
  max_quantity: number
}

interface Category {
  id: string
  name: string
}

export default function NewOrderPage() {
  const [user, setUser] = useState<any>(null)
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedService, setSelectedService] = useState<string>("")
  const [quantity, setQuantity] = useState<string>("")
  const [link, setLink] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filteredServices, setFilteredServices] = useState<Service[]>([])

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

        // Get all services
        const { data: servicesData } = await supabase.from("services").select("*").order("category").order("name")

        setServices(servicesData || [])
        setFilteredServices(servicesData || [])

        // Get all categories
        const { data: categoriesData } = await supabase.from("categories").select("*").order("name")

        setCategories(categoriesData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router, supabase])

  useEffect(() => {
    // Filter services based on category and search query
    let filtered = services

    if (selectedCategory !== "all") {
      filtered = filtered.filter((service) => service.category === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (service) => service.name.toLowerCase().includes(query) || service.description.toLowerCase().includes(query),
      )
    }

    setFilteredServices(filtered)
  }, [selectedCategory, searchQuery, services])

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId)
    const service = services.find((s) => s.id === serviceId)
    if (service) {
      setQuantity(service.min_quantity.toString())
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedService || !link || !quantity) {
      toast({
        title: "Missing information",
        description: "Please select a service, enter a valid URL, and specify a quantity",
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

      const quantityNum = Number.parseInt(quantity)

      // Validate quantity
      if (quantityNum < service.min_quantity || quantityNum > service.max_quantity) {
        toast({
          title: "Invalid quantity",
          description: `Quantity must be between ${service.min_quantity} and ${service.max_quantity}`,
          variant: "destructive",
        })
        return
      }

      const price = (quantityNum * service.price_per_1000) / 1000

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
            quantity: quantityNum,
            link: link,
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

      toast({
        title: "Order placed successfully",
        description: `Your order for ${service.name} has been placed`,
      })

      // Reset form
      setLink("")
      setQuantity("")
      setSelectedService("")

      // Redirect to order history
      router.push("/order-history")
    } catch (error: any) {
      toast({
        title: "Error placing order",
        description: error.message || "There was an error placing your order",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-full max-w-md mb-8" />
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-3">
            <Card>
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
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Place New Order</h1>
        <p className="text-muted-foreground">
          Select a service and provide the required information to place your order
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div
                className={`px-3 py-2 rounded-md cursor-pointer ${selectedCategory === "all" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                onClick={() => setSelectedCategory("all")}
              >
                All Services
              </div>
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`px-3 py-2 rounded-md cursor-pointer ${selectedCategory === category.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Services</CardTitle>
              <CardDescription>Select a service from the list below</CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search services..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <div
                      key={service.id}
                      className={`p-4 border rounded-md cursor-pointer ${
                        selectedService === service.id ? "border-primary bg-primary/5" : "hover:bg-muted"
                      }`}
                      onClick={() => handleServiceSelect(service.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{service.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span>Min: {service.min_quantity}</span>
                            <span>Max: {service.max_quantity}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">${(service.price_per_1000 / 10).toFixed(2)}</span>
                          <span className="text-sm text-muted-foreground">/100</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No services found. Try adjusting your search or category filter.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedService && (
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
                <CardDescription>
                  Complete the information below to place your order for{" "}
                  {services.find((s) => s.id === selectedService)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="link">Link</Label>
                    <Input
                      id="link"
                      placeholder="https://instagram.com/username"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Enter the URL where you want to receive the service</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="Enter quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min={services.find((s) => s.id === selectedService)?.min_quantity}
                      max={services.find((s) => s.id === selectedService)?.max_quantity}
                    />
                    <p className="text-xs text-muted-foreground">
                      Min: {services.find((s) => s.id === selectedService)?.min_quantity} - Max:{" "}
                      {services.find((s) => s.id === selectedService)?.max_quantity}
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Price:</span>
                      <span className="font-bold">
                        $
                        {quantity && services.find((s) => s.id === selectedService)
                          ? (
                              (Number.parseInt(quantity) *
                                services.find((s) => s.id === selectedService)!.price_per_1000) /
                              1000
                            ).toFixed(2)
                          : "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mb-4">
                      <span>Your balance:</span>
                      <span>${user?.balance?.toFixed(2) || "0.00"}</span>
                    </div>
                    <Button className="w-full" onClick={handlePlaceOrder}>
                      Place Order
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
