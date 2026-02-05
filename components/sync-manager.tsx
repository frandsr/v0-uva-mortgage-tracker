"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@/components/auth-provider"
import { useLoanStore } from "@/lib/loan-store"

export function SyncManager() {
  const { user } = useAuth()
  const { loanConfig, dollarType, syncWithSupabase, loadFromSupabase } = useLoanStore()
  const hasLoadedRef = useRef(false)
  const previousConfigRef = useRef<string | null>(null)

  // Load data from Supabase when user logs in
  useEffect(() => {
    if (user && !hasLoadedRef.current) {
      hasLoadedRef.current = true
      loadFromSupabase(user.id)
    }
    if (!user) {
      hasLoadedRef.current = false
    }
  }, [user, loadFromSupabase])

  // Sync changes to Supabase when loan config changes
  useEffect(() => {
    if (!user || !loanConfig) return

    const currentConfig = JSON.stringify({ loanConfig, dollarType })
    if (previousConfigRef.current === currentConfig) return
    if (previousConfigRef.current === null) {
      previousConfigRef.current = currentConfig
      return
    }

    previousConfigRef.current = currentConfig

    // Debounce sync
    const timeoutId = setTimeout(() => {
      syncWithSupabase(user.id)
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [user, loanConfig, dollarType, syncWithSupabase])

  return null
}
