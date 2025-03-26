"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ShipmentsList } from "@/components/shipments-list"
import { DriverMap } from "@/components/driver-map"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Truck, Loader2 } from "lucide-react"

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return <DashboardContent />
}

function DashboardContent() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Driver Dashboard</h1>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>

        <Tabs defaultValue="shipments">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="shipments">Shipments</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
          </TabsList>

          <TabsContent value="shipments" className="mt-6">
            {user && <ShipmentsList driverId={user.uid} />}
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Driver Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">{user.displayName || "Driver"}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Vehicle Information</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Truck className="mr-2 h-4 w-4" />
                    Not configured
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map">{user && <DriverMap driverId={user.uid} />}</TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

