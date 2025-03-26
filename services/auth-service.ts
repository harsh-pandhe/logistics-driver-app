import { auth, db } from "../firebase-config"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    console.error("Error signing in:", error)
    throw error
  }
}

export const signUp = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    await updateProfile(user, { displayName })

    await setDoc(doc(db, "drivers", user.uid), {
      name: displayName,
      email: email,
      status: "available",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return user
  } catch (error) {
    console.error("Error signing up:", error)
    throw error
  }
}

export const signOut = async () => {
  try {
    await firebaseSignOut(auth)
    return true
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

export const getCurrentUser = (): User | null => {
  return auth.currentUser
}

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}

