"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Camera, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { uploadDeliveryProof } from "@/services/storage-service"

interface ShipmentCardProps {
  shipment: {
    id: string
    address: string
    status: string
    customer: string
    destination?: {
      address: string
      coordinates?: {
        latitude: number
        longitude: number
      }
    }
    deliveryProofs?: Array<{
      url: string
      fileName: string
      uploadedAt: any
    }>
  }
  onUpdateStatus: (id: string, status: string) => void
}

export function ShipmentCard({ shipment, onUpdateStatus }: ShipmentCardProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      await uploadDeliveryProof(shipment.id, file)

      toast({
        title: "Proof uploaded",
        description: "Delivery proof has been uploaded successfully",
      })

      onUpdateStatus(shipment.id, "delivered")
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload delivery proof",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Shipment #{shipment.id}</CardTitle>
          <div
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              shipment.status === "delivered"
                ? "bg-green-100 text-green-800"
                : shipment.status === "in_transit"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {shipment.status.replace("_", " ")}
          </div>
        </div>
        <CardDescription>{shipment.customer}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center text-sm text-gray-500">
          <MapPin className="mr-1 h-4 w-4" />
          {shipment.destination?.address || shipment.address}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {shipment.status === "pending" && (
          <Button size="sm" onClick={() => onUpdateStatus(shipment.id, "in_transit")}>
            Start Delivery
          </Button>
        )}
        {shipment.status === "in_transit" && (
          <>
            <Button size="sm" variant="outline" className="relative" disabled={isUploading}>
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              {isUploading ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="mr-1 h-4 w-4" />
                  Upload Proof
                </>
              )}
            </Button>
            <Button size="sm" onClick={() => onUpdateStatus(shipment.id, "delivered")}>
              Mark Delivered
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

