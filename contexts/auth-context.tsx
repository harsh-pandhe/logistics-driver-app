"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "firebase/auth"
import { onAuthStateChange, signIn, signOut, signUp } from "@/services/auth-service"
import { useToast } from "@/components/ui/use-toast"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { addToast } = useToast()

  useEffect(() => {
    const unsubscribe = onAuthStateChange((currentUser) => {
      setUser(currentUser)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      await signIn(email, password)
    } catch (error: any) {
      addToast("Login failed: " + (error.message || "Invalid email or password"))
      throw error
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      await signUp(email, password, name)
    } catch (error: any) {
      addToast("Registration failed: " + (error.message || "Could not create account"))
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut()
    } catch (error: any) {
      addToast("Logout failed: " + (error.message || "Could not log out"))
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

