import { updateDriverLocation } from "./firestore-service"

let watchId: number | null = null

export const startLocationTracking = (driverId: string) => {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    console.error("Geolocation is not supported by this browser.")
    return false
  }

  if (watchId !== null) {
    stopLocationTracking()
  }

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      updateDriverLocation(driverId, { latitude, longitude })
        .then(() => console.log("Location updated successfully"))
        .catch((error) => console.error("Error updating location:", error))
    },
    (error) => {
      console.error("Error getting location:", error)
    },
    {
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 27000,
      distanceFilter: 10,
    },
  )

  return true
}

export const stopLocationTracking = () => {
  if (typeof navigator !== "undefined" && navigator.geolocation && watchId !== null) {
    navigator.geolocation.clearWatch(watchId)
    watchId = null
    return true
  }
  return false
}

export const getCurrentPosition = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      },
      { enableHighAccuracy: true },
    )
  })
}

