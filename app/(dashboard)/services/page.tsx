"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const router = useRouter()
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

    if (activeCategory !== "all") {
      filtered = filtered.filter((service) => service.category === activeCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (service) => service.name.toLowerCase().includes(query) || service.description.toLowerCase().includes(query),
      )
    }

    setFilteredServices(filtered)
  }, [activeCategory, searchQuery, services])

  const handleOrderClick = (serviceId: string) => {
    router.push(`/new-order?service=${serviceId}`)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-full max-w-md mb-8" />
        </div>

        <div className="mb-6">
          <Skeleton className="h-10 w-full max-w-md mb-4" />
          <Skeleton className="h-10 w-full mb-4" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Services Catalog</h1>
        <p className="text-muted-foreground">Browse our complete list of services and place your orders</p>
      </div>

      <div className="mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search services by name or description..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="mb-4 flex flex-wrap h-auto">
            <TabsTrigger value="all">All Services</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory} className="mt-0">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <Card key={service.id}>
                    <CardHeader>
                      <CardTitle>{service.name}</CardTitle>
                      <CardDescription>
                        {categories.find((c) => c.id === service.category)?.name || "Uncategorized"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{service.description}</p>
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-sm">
                          <div>Min: {service.min_quantity}</div>
                          <div>Max: {service.max_quantity}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${(service.price_per_1000 / 10).toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">per 100</div>
                        </div>
                      </div>
                      <Button className="w-full" onClick={() => handleOrderClick(service.id)}>
                        Order Now
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No services found. Try adjusting your search or category filter.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
