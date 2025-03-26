"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Loader2 } from "lucide-react"
import { startLocationTracking, stopLocationTracking, getCurrentPosition } from "@/services/location-service"
import { getActiveShipment } from "@/services/firestore-service"
import { useToast } from "@/components/ui/use-toast"

interface DriverMapProps {
  driverId: string
}

export function DriverMap({ driverId }: DriverMapProps) {
  const [isTracking, setIsTracking] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [activeShipment, setActiveShipment] = useState<any>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchActiveShipment = async () => {
      try {
        const shipment = await getActiveShipment(driverId)
        setActiveShipment(shipment)
      } catch (error) {
        console.error("Error fetching active shipment:", error)
      }
    }

    const getLocation = async () => {
      try {
        const position = await getCurrentPosition()
        setCurrentLocation(position)
      } catch (error) {
        console.error("Error getting location:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActiveShipment()
    getLocation()

    const initMap = () => {
      if (mapRef.current && currentLocation) {
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: currentLocation.latitude, lng: currentLocation.longitude },
          zoom: 15,
        });
       }
     };

    return () => {
      if (isTracking) {
        stopLocationTracking()
      }
    }
  }, [driverId])

  const toggleTracking = () => {
    if (isTracking) {
      stopLocationTracking()
      setIsTracking(false)
      toast({
        title: "Location tracking stopped",
        description: "Your location is no longer being tracked",
      })
    } else {
      const success = startLocationTracking(driverId)
      if (success) {
        setIsTracking(true)
        toast({
          title: "Location tracking started",
          description: "Your location is now being tracked",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to start location tracking",
          variant: "destructive",
        })
      }
    }
  }

  const openNavigation = () => {
    if (!activeShipment?.destination?.coordinates) {
      toast({
        title: "Navigation unavailable",
        description: "Destination coordinates are not available",
        variant: "destructive",
      })
      return
    }

    const { latitude, longitude } = activeShipment.destination.coordinates
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    window.open(url, "_blank")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Map</CardTitle>
        <CardDescription>
          {activeShipment
            ? `Navigate to: ${activeShipment.destination?.address || activeShipment.address}`
            : "Your current location and delivery routes"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div ref={mapRef} className="aspect-video bg-gray-200 rounded-md flex items-center justify-center">
              <div className="text-center">
                <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {currentLocation
                    ? `Current location: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`
                    : "Location not available"}
                </p>
                <p className="text-xs text-muted-foreground">Using Google Maps integration</p>
              </div>
            </div>

            <div className="mt-4 flex justify-between">
              <Button variant={isTracking ? "destructive" : "default"} onClick={toggleTracking}>
                {isTracking ? "Stop Tracking" : "Start Tracking"}
              </Button>

              {activeShipment && (
                <Button variant="outline" onClick={openNavigation}>
                  <Navigation className="mr-2 h-4 w-4" />
                  Navigate
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

