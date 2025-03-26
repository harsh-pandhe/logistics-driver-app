import { storage, db } from "../firebase-config"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore"

export const uploadDeliveryProof = async (shipmentId: string, file: File) => {
  try {
    const fileName = `${shipmentId}_${new Date().getTime()}_${file.name}`
    const storageRef = ref(storage, `deliveryProofs/${fileName}`)

    const snapshot = await uploadBytes(storageRef, file)

    const downloadURL = await getDownloadURL(snapshot.ref)

    const shipmentRef = doc(db, "shipments", shipmentId)
    await updateDoc(shipmentRef, {
      deliveryProofs: arrayUnion({
        url: downloadURL,
        fileName: fileName,
        uploadedAt: serverTimestamp(),
      }),
    })

    return { fileName, downloadURL }
  } catch (error) {
    console.error("Error uploading delivery proof:", error)
    throw error
  }
}

export const getDeliveryProofURL = async (path: string) => {
  try {
    const storageRef = ref(storage, path)
    return await getDownloadURL(storageRef)
  } catch (error) {
    console.error("Error getting delivery proof URL:", error)
    throw error
  }
}

