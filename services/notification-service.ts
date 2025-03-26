import { messaging, db } from "../firebase-config"
import { getToken, onMessage } from "firebase/messaging"
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"

export const requestNotificationPermission = async (userId: string) => {
  try {
    if (!messaging) {
      console.log("Firebase messaging is not available in this environment")
      return null
    }

    const permission = await Notification.requestPermission()

    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      })

      await saveTokenToDatabase(userId, token)

      console.log("Notification permission granted. Token:", token)
      return token
    } else {
      console.log("Notification permission denied")
      return null
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error)
    throw error
  }
}

export const onMessageReceived = (callback: (payload: any) => void) => {
  if (!messaging) {
    console.log("Firebase messaging is not available in this environment")
    return () => {}
  }

  return onMessage(messaging, (payload) => {
    console.log("Message received:", payload)
    callback(payload)
  })
}

export const saveTokenToDatabase = async (userId: string, token: string) => {
  try {
    const userRef = doc(db, "drivers", userId)
    await updateDoc(userRef, {
      fcmTokens: {
        [token]: true,
      },
      tokenUpdatedAt: serverTimestamp(),
    })
    return true
  } catch (error) {
    console.error("Error saving token to database:", error)
    throw error
  }
}

