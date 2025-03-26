"use client";

import { useState } from "react";

export function useToast() {
    const [toasts, setToasts] = useState<string[]>([]);
    const addToast = (message: string) => setToasts([...toasts, message]);
    return { toasts, addToast };
}