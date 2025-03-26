"use client";

import type * as React from "react"
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast as useToastHooks } from "@/components/ui/use-toast-hooks"; // Adjust the path as needed

export { useToastHooks as useToast }

type ToastProps = React.ComponentProps<typeof Toast>

export { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport, type ToastProps }

export function Toaster() {
  return <ToastProvider />
}

