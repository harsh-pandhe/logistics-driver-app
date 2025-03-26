import { db } from "../firebase-config"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  orderBy,
  limit,
} from "firebase/firestore"

export const getDriverProfile = async (driverId: string) => {
  try {
    const docRef = doc(db, "drivers", driverId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting driver profile:", error)
    throw error
  }
}

export const updateDriverProfile = async (driverId: string, data: any) => {
  try {
    const docRef = doc(db, "drivers", driverId)
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    })
    return true
  } catch (error) {
    console.error("Error updating driver profile:", error)
    throw error
  }
}

export const updateDriverLocation = async (driverId: string, location: { latitude: number; longitude: number }) => {
  try {
    const docRef = doc(db, "drivers", driverId)
    await updateDoc(docRef, {
      location,
      lastLocationUpdate: serverTimestamp(),
    })
    return true
  } catch (error) {
    console.error("Error updating driver location:", error)
    throw error
  }
}

export const getDriverShipments = async (driverId: string) => {
  try {
    const q = query(collection(db, "shipments"), where("driverId", "==", driverId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)

    const shipments: any[] = []
    querySnapshot.forEach((doc) => {
      shipments.push({ id: doc.id, ...doc.data() })
    })

    return shipments
  } catch (error) {
    console.error("Error getting driver shipments:", error)
    throw error
  }
}

export const updateShipmentStatus = async (shipmentId: string, status: string, notes?: string) => {
  try {
    const docRef = doc(db, "shipments", shipmentId)

    const updateData: any = {
      status,
      statusUpdatedAt: serverTimestamp(),
      [`statusHistory.${status}`]: serverTimestamp(),
    }

    if (notes) {
      updateData.notes = notes
    }

    await updateDoc(docRef, updateData)
    return true
  } catch (error) {
    console.error("Error updating shipment status:", error)
    throw error
  }
}

export const subscribeToShipments = (driverId: string, callback: (shipments: any[]) => void) => {
  const q = query(collection(db, "shipments"), where("driverId", "==", driverId), orderBy("createdAt", "desc"))

  return onSnapshot(q, (querySnapshot) => {
    const shipments: any[] = []
    querySnapshot.forEach((doc) => {
      shipments.push({ id: doc.id, ...doc.data() })
    })
    callback(shipments)
  })
}

export const getActiveShipment = async (driverId: string) => {
  try {
    const q = query(
      collection(db, "shipments"),
      where("driverId", "==", driverId),
      where("status", "==", "in_transit"),
      limit(1),
    )

    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return { id: doc.id, ...doc.data() }
    }

    return null
  } catch (error) {
    console.error("Error getting active shipment:", error)
    throw error
  }
}

