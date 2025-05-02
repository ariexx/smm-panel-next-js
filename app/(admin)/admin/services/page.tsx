"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Edit, Plus, Search, Trash } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

interface Service {
  id: string
  name: string
  description: string
  category: string
  price_per_1000: number
  min_quantity: number
  max_quantity: number
  popularity: number
}

interface Category {
  id: string
  name: string
}

export default function AdminServicesPage() {
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)
  const [saving, setSaving] = useState(false)

  // Form fields
  const [formName, setFormName] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formCategory, setFormCategory] = useState("")
  const [formPrice, setFormPrice] = useState("")
  const [formMinQuantity, setFormMinQuantity] = useState("")
  const [formMaxQuantity, setFormMaxQuantity] = useState("")

  const servicesPerPage = 10
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // Get the current authenticated user
        const { data: authData } = await supabase.auth.getUser()

        if (!authData.user) {
          router.push("/login")
          return
        }

        // Check if user is an admin
        const { data: userData, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", authData.user.id)
          .single()

        if (error || userData.role !== "admin") {
          toast({
            title: "Access denied",
            description: "You do not have permission to access the admin dashboard",
            variant: "destructive",
          })
          router.push("/dashboard")
          return
        }

        // Fetch services and categories
        await Promise.all([fetchServices(), fetchCategories()])
      } catch (error) {
        console.error("Error checking admin access:", error)
        router.push("/dashboard")
      }
    }

    checkAdminAccess()
  }, [router, supabase, toast])

  useEffect(() => {
    // Filter services based on search query and category filter
    let filtered = services

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (service) => service.name.toLowerCase().includes(query) || service.description.toLowerCase().includes(query),
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((service) => service.category === categoryFilter)
    }

    setFilteredServices(filtered)
    setTotalPages(Math.ceil(filtered.length / servicesPerPage))
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchQuery, categoryFilter, services])

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase.from("services").select("*").order("name")

      if (error) {
        throw error
      }

      setServices(data || [])
      setFilteredServices(data || [])
      setTotalPages(Math.ceil((data?.length || 0) / servicesPerPage))
    } catch (error) {
      console.error("Error fetching services:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*").order("name")

      if (error) {
        throw error
      }

      setCategories(data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const getCurrentPageServices = () => {
    const startIndex = (currentPage - 1) * servicesPerPage
    const endIndex = startIndex + servicesPerPage
    return filteredServices.slice(startIndex, endIndex)
  }

  const handleAddService = () => {
    // Reset form fields
    setFormName("")
    setFormDescription("")
    setFormCategory("")
    setFormPrice("")
    setFormMinQuantity("")
    setFormMaxQuantity("")

    setIsAddDialogOpen(true)
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setFormName(service.name)
    setFormDescription(service.description)
    setFormCategory(service.category)
    setFormPrice(service.price_per_1000.toString())
    setFormMinQuantity(service.min_quantity.toString())
    setFormMaxQuantity(service.max_quantity.toString())
    setIsEditDialogOpen(true)
  }

  const handleDeleteService = (service: Service) => {
    setServiceToDelete(service)
    setIsDeleteDialogOpen(true)
  }

  const handleSaveNewService = async () => {
    if (!formName || !formDescription || !formCategory || !formPrice || !formMinQuantity || !formMaxQuantity) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      // Add new service to the database
      const { data, error } = await supabase
        .from("services")
        .insert([
          {
            name: formName,
            description: formDescription,
            category: formCategory,
            price_per_1000: Number.parseFloat(formPrice),
            min_quantity: Number.parseInt(formMinQuantity),
            max_quantity: Number.parseInt(formMaxQuantity),
            popularity: 0,
          },
        ])
        .select()

      if (error) {
        throw error
      }

      // Update local state
      setServices([...services, data[0]])

      toast({
        title: "Service added",
        description: "Service has been added successfully",
      })

      setIsAddDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Error adding service",
        description: error.message || "There was an error adding the service",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateService = async () => {
    if (!editingService) return

    if (!formName || !formDescription || !formCategory || !formPrice || !formMinQuantity || !formMaxQuantity) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      // Update service in the database
      const { error } = await supabase
        .from("services")
        .update({
          name: formName,
          description: formDescription,
          category: formCategory,
          price_per_1000: Number.parseFloat(formPrice),
          min_quantity: Number.parseInt(formMinQuantity),
          max_quantity: Number.parseInt(formMaxQuantity),
        })
        .eq("id", editingService.id)

      if (error) {
        throw error
      }

      // Update local state
      setServices(
        services.map((service) =>
          service.id === editingService.id
            ? {
                ...service,
                name: formName,
                description: formDescription,
                category: formCategory,
                price_per_1000: Number.parseFloat(formPrice),
                min_quantity: Number.parseInt(formMinQuantity),
                max_quantity: Number.parseInt(formMaxQuantity),
              }
            : service,
        ),
      )

      toast({
        title: "Service updated",
        description: "Service has been updated successfully",
      })

      setIsEditDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Error updating service",
        description: error.message || "There was an error updating the service",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return

    setSaving(true)

    try {
      // Delete service from the database
      const { error } = await supabase.from("services").delete().eq("id", serviceToDelete.id)

      if (error) {
        throw error
      }

      // Update local state
      setServices(services.filter((service) => service.id !== serviceToDelete.id))

      toast({
        title: "Service deleted",
        description: "Service has been deleted successfully",
      })

      setIsDeleteDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Error deleting service",
        description: error.message || "There was an error deleting the service",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-full max-w-md mb-8" />
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <Skeleton className="h-10 w-full md:w-1/3" />
          <Skeleton className="h-10 w-full md:w-1/3" />
          <Skeleton className="h-10 w-full md:w-1/4" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <th key={i} className="h-12 px-4">
                          <Skeleton className="h-4 w-16" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="border-b">
                        {[1, 2, 3, 4, 5, 6].map((j) => (
                          <td key={j} className="p-4">
                            <Skeleton className="h-4 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Manage Services</h1>
        <p className="text-muted-foreground">View and manage all services on the platform</p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative md:w-1/3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search services..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="md:w-1/3">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button className="md:ml-auto" onClick={handleAddService}>
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Category</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Price (per 1000)
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Min Quantity</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Max Quantity</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {getCurrentPageServices().length > 0 ? (
                    getCurrentPageServices().map((service) => (
                      <tr
                        key={service.id}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        <td className="p-4 align-middle font-medium">
                          <div>
                            {service.name}
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{service.description}</p>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <Badge variant="outline">
                            {categories.find((c) => c.id === service.category)?.name || "Uncategorized"}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle">${service.price_per_1000.toFixed(2)}</td>
                        <td className="p-4 align-middle">{service.min_quantity}</td>
                        <td className="p-4 align-middle">{service.max_quantity}</td>
                        <td className="p-4 align-middle text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditService(service)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteService(service)}>
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-muted-foreground">
                        No services found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {filteredServices.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min(filteredServices.length, (currentPage - 1) * servicesPerPage + 1)} to{" "}
                {Math.min(filteredServices.length, currentPage * servicesPerPage)} of {filteredServices.length} services
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Service Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>Create a new service to offer to your customers</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Instagram Followers"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="High quality Instagram followers, non-drop"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Price per 1000</Label>
              <Input
                id="price"
                type="number"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                placeholder="12.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="min-quantity">Min Quantity</Label>
                <Input
                  id="min-quantity"
                  type="number"
                  value={formMinQuantity}
                  onChange={(e) => setFormMinQuantity(e.target.value)}
                  placeholder="100"
                  min="1"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="max-quantity">Max Quantity</Label>
                <Input
                  id="max-quantity"
                  type="number"
                  value={formMaxQuantity}
                  onChange={(e) => setFormMaxQuantity(e.target.value)}
                  placeholder="10000"
                  min="1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewService} disabled={saving}>
              {saving ? "Saving..." : "Add Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>Update the service details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Service Name</Label>
              <Input id="edit-name" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-price">Price per 1000</Label>
              <Input
                id="edit-price"
                type="number"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-min-quantity">Min Quantity</Label>
                <Input
                  id="edit-min-quantity"
                  type="number"
                  value={formMinQuantity}
                  onChange={(e) => setFormMinQuantity(e.target.value)}
                  min="1"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-max-quantity">Max Quantity</Label>
                <Input
                  id="edit-max-quantity"
                  type="number"
                  value={formMaxQuantity}
                  onChange={(e) => setFormMaxQuantity(e.target.value)}
                  min="1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateService} disabled={saving}>
              {saving ? "Saving..." : "Update Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Service Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">{serviceToDelete?.name}</p>
            <p className="text-sm text-muted-foreground mt-1">{serviceToDelete?.description}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={saving}>
              {saving ? "Deleting..." : "Delete Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
