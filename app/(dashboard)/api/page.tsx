"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Copy, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function ApiPage() {
  const [user, setUser] = useState<any>(null)
  const [apiKey, setApiKey] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchUser = async () => {
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

        // Get or generate API key
        if (!userData.api_key) {
          await generateApiKey(authData.user.id)
        } else {
          setApiKey(userData.api_key)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router, supabase])

  const generateApiKey = async (userId: string) => {
    try {
      // Generate a random API key
      const key = Array.from(Array(32), () => Math.floor(Math.random() * 36).toString(36)).join("")

      // Update the user's API key in the database
      const { error } = await supabase.from("users").update({ api_key: key }).eq("id", userId)

      if (error) {
        throw error
      }

      setApiKey(key)

      // Update local user state
      if (user) {
        setUser({
          ...user,
          api_key: key,
        })
      }

      return key
    } catch (error) {
      console.error("Error generating API key:", error)
      throw error
    }
  }

  const handleRegenerateApiKey = async () => {
    setRegenerating(true)

    try {
      await generateApiKey(user.id)

      toast({
        title: "API key regenerated",
        description: "Your new API key has been generated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error regenerating API key",
        description: error.message || "There was an error regenerating your API key",
        variant: "destructive",
      })
    } finally {
      setRegenerating(false)
    }
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    toast({
      title: "API key copied",
      description: "Your API key has been copied to clipboard",
    })
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Code copied",
      description: "The code snippet has been copied to clipboard",
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-full max-w-md mb-8" />
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-40 w-full mb-6" />
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">API Documentation</h1>
        <p className="text-muted-foreground">Integrate our services with your applications using our API</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your API Key</CardTitle>
            <CardDescription>Use this key to authenticate your API requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={apiKey}
                readOnly
                type="password"
                className="font-mono"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button variant="outline" size="icon" onClick={handleCopyApiKey}>
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy API key</span>
              </Button>
              <Button variant="outline" size="icon" onClick={handleRegenerateApiKey} disabled={regenerating}>
                <RefreshCw className={`h-4 w-4 ${regenerating ? "animate-spin" : ""}`} />
                <span className="sr-only">Regenerate API key</span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Keep your API key secret. Do not share it in public repositories or client-side code.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
            <CardDescription>Learn how to use our API to automate your orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="services">
              <TabsList className="mb-4">
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="order">Place Order</TabsTrigger>
                <TabsTrigger value="status">Order Status</TabsTrigger>
                <TabsTrigger value="balance">User Balance</TabsTrigger>
              </TabsList>

              <TabsContent value="services" className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Get Services</h3>
                  <p className="text-sm text-muted-foreground mb-4">Retrieve a list of all available services.</p>

                  <div className="bg-muted rounded-md p-4 mb-4">
                    <p className="font-medium mb-2">Endpoint:</p>
                    <code className="font-mono text-sm">GET https://api.socialboost.com/v1/services</code>

                    <p className="font-medium mt-4 mb-2">Headers:</p>
                    <code className="font-mono text-sm block">Authorization: Bearer {"{your_api_key}"}</code>
                  </div>

                  <div className="bg-muted rounded-md p-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium">Example Response:</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleCopyCode(
                            JSON.stringify(
                              {
                                success: true,
                                data: [
                                  {
                                    id: "1",
                                    name: "Instagram Followers",
                                    category: "Instagram",
                                    price_per_1000: 12.0,
                                    min_quantity: 100,
                                    max_quantity: 10000,
                                    description: "High quality Instagram followers",
                                  },
                                  {
                                    id: "2",
                                    name: "TikTok Likes",
                                    category: "TikTok",
                                    price_per_1000: 8.0,
                                    min_quantity: 50,
                                    max_quantity: 50000,
                                    description: "Real TikTok likes, non-drop",
                                  },
                                ],
                              },
                              null,
                              2,
                            ),
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy code</span>
                      </Button>
                    </div>
                    <pre className="text-xs overflow-auto p-2 bg-background rounded border">
                      {`{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Instagram Followers",
      "category": "Instagram",
      "price_per_1000": 12.00,
      "min_quantity": 100,
      "max_quantity": 10000,
      "description": "High quality Instagram followers"
    },
    {
      "id": "2",
      "name": "TikTok Likes",
      "category": "TikTok",
      "price_per_1000": 8.00,
      "min_quantity": 50,
      "max_quantity": 50000,
      "description": "Real TikTok likes, non-drop"
    }
  ]
}`}
                    </pre>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="order" className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Place Order</h3>
                  <p className="text-sm text-muted-foreground mb-4">Create a new order for a service.</p>

                  <div className="bg-muted rounded-md p-4 mb-4">
                    <p className="font-medium mb-2">Endpoint:</p>
                    <code className="font-mono text-sm">POST https://api.socialboost.com/v1/order</code>

                    <p className="font-medium mt-4 mb-2">Headers:</p>
                    <code className="font-mono text-sm block">
                      Authorization: Bearer {"{your_api_key}"}
                      <br />
                      Content-Type: application/json
                    </code>

                    <p className="font-medium mt-4 mb-2">Request Body:</p>
                    <pre className="text-xs overflow-auto p-2 bg-background rounded border">
                      {`{
  "service_id": "1",
  "link": "https://instagram.com/username",
  "quantity": 1000
}`}
                    </pre>
                  </div>

                  <div className="bg-muted rounded-md p-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium">Example Response:</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleCopyCode(
                            JSON.stringify(
                              {
                                success: true,
                                data: {
                                  order_id: "12345",
                                  service_id: "1",
                                  link: "https://instagram.com/username",
                                  quantity: 1000,
                                  price: 12.0,
                                  status: "pending",
                                  created_at: "2023-05-01T12:00:00Z",
                                },
                              },
                              null,
                              2,
                            ),
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy code</span>
                      </Button>
                    </div>
                    <pre className="text-xs overflow-auto p-2 bg-background rounded border">
                      {`{
  "success": true,
  "data": {
    "order_id": "12345",
    "service_id": "1",
    "link": "https://instagram.com/username",
    "quantity": 1000,
    "price": 12.00,
    "status": "pending",
    "created_at": "2023-05-01T12:00:00Z"
  }
}`}
                    </pre>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="status" className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Check Order Status</h3>
                  <p className="text-sm text-muted-foreground mb-4">Get the current status of an order.</p>

                  <div className="bg-muted rounded-md p-4 mb-4">
                    <p className="font-medium mb-2">Endpoint:</p>
                    <code className="font-mono text-sm">GET https://api.socialboost.com/v1/order/{"{order_id}"}</code>

                    <p className="font-medium mt-4 mb-2">Headers:</p>
                    <code className="font-mono text-sm block">Authorization: Bearer {"{your_api_key}"}</code>
                  </div>

                  <div className="bg-muted rounded-md p-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium">Example Response:</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleCopyCode(
                            JSON.stringify(
                              {
                                success: true,
                                data: {
                                  order_id: "12345",
                                  service_id: "1",
                                  link: "https://instagram.com/username",
                                  quantity: 1000,
                                  price: 12.0,
                                  status: "processing",
                                  created_at: "2023-05-01T12:00:00Z",
                                  progress: "60%",
                                },
                              },
                              null,
                              2,
                            ),
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy code</span>
                      </Button>
                    </div>
                    <pre className="text-xs overflow-auto p-2 bg-background rounded border">
                      {`{
  "success": true,
  "data": {
    "order_id": "12345",
    "service_id": "1",
    "link": "https://instagram.com/username",
    "quantity": 1000,
    "price": 12.00,
    "status": "processing",
    "created_at": "2023-05-01T12:00:00Z",
    "progress": "60%"
  }
}`}
                    </pre>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="balance" className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Get User Balance</h3>
                  <p className="text-sm text-muted-foreground mb-4">Retrieve your current account balance.</p>

                  <div className="bg-muted rounded-md p-4 mb-4">
                    <p className="font-medium mb-2">Endpoint:</p>
                    <code className="font-mono text-sm">GET https://api.socialboost.com/v1/user/balance</code>

                    <p className="font-medium mt-4 mb-2">Headers:</p>
                    <code className="font-mono text-sm block">Authorization: Bearer {"{your_api_key}"}</code>
                  </div>

                  <div className="bg-muted rounded-md p-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium">Example Response:</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleCopyCode(
                            JSON.stringify(
                              {
                                success: true,
                                data: {
                                  balance: 125.0,
                                  currency: "USD",
                                },
                              },
                              null,
                              2,
                            ),
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy code</span>
                      </Button>
                    </div>
                    <pre className="text-xs overflow-auto p-2 bg-background rounded border">
                      {`{
  "success": true,
  "data": {
    "balance": 125.00,
    "currency": "USD"
  }
}`}
                    </pre>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              For more detailed documentation and examples, please visit our{" "}
              <a href="#" className="text-primary hover:underline">
                API Reference
              </a>
              .
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
