"use client"

import type * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { useLoanStore } from "@/lib/loan-store"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { themeMode } = useLoanStore()

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      forcedTheme={themeMode === "system" ? undefined : themeMode}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
