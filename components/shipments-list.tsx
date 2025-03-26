"use client"

import { useState, useEffect } from "react"
import { ShipmentCard } from "./shipment-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { updateShipmentStatus, subscribeToShipments } from "@/services/firestore-service"
import { Loader2 } from "lucide-react"

interface ShipmentsListProps {
  driverId: string
}

export function ShipmentsList({ driverId }: ShipmentsListProps) {
  const [shipments, setShipments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeToShipments(driverId, (data) => {
      setShipments(data)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [driverId])

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateShipmentStatus(id, newStatus)
    } catch (error) {
      console.error("Error updating shipment status:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (shipments.length === 0) {
    return <div className="text-center py-8">No shipments assigned to you.</div>
  }

  const pendingShipments = shipments.filter((s) => s.status === "pending")
  const activeShipments = shipments.filter((s) => s.status === "in_transit")
  const completedShipments = shipments.filter((s) => s.status === "delivered")

  return (
    <Tabs defaultValue="active">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="active">Active ({activeShipments.length})</TabsTrigger>
        <TabsTrigger value="pending">Pending ({pendingShipments.length})</TabsTrigger>
        <TabsTrigger value="completed">Completed ({completedShipments.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="mt-4">
        <div className="grid gap-4">
          {activeShipments.length > 0 ? (
            activeShipments.map((shipment) => (
              <ShipmentCard key={shipment.id} shipment={shipment} onUpdateStatus={handleUpdateStatus} />
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">No active shipments.</div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="pending" className="mt-4">
        <div className="grid gap-4">
          {pendingShipments.length > 0 ? (
            pendingShipments.map((shipment) => (
              <ShipmentCard key={shipment.id} shipment={shipment} onUpdateStatus={handleUpdateStatus} />
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">No pending shipments.</div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="completed" className="mt-4">
        <div className="grid gap-4">
          {completedShipments.length > 0 ? (
            completedShipments.map((shipment) => (
              <ShipmentCard key={shipment.id} shipment={shipment} onUpdateStatus={handleUpdateStatus} />
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">No completed shipments.</div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}

