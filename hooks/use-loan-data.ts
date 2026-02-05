"use client"

import useSWR from "swr"
import { useLoanStore } from "@/lib/loan-store"
import { calculateLoanData, type LoanData } from "@/lib/loan-calculations"
import { useEffect } from "react"

interface UvaHistoryEntry {
  date: string
  value: number
}

interface Rates {
  uva: number
  uvaHistory: UvaHistoryEntry[]
  dolarBlue: number
  dolarOficial: number
}

async function fetchRates(): Promise<Rates> {
  const uvaResponse = await fetch("/api/rates")
  if (!uvaResponse.ok) {
    throw new Error("Failed to fetch rates")
  }
  return uvaResponse.json()
}

export function getUvaForDate(uvaHistory: UvaHistoryEntry[], targetDate: Date, paymentDay?: number): number | null {
  if (!uvaHistory || uvaHistory.length === 0) return null

  const targetYear = targetDate.getFullYear()
  const targetMonth = targetDate.getMonth()

  // If a specific payment day is provided, use it
  const dayToMatch = paymentDay || targetDate.getDate()

  // Sort history by date to ensure correct order
  const sortedHistory = [...uvaHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  let closestEntry: UvaHistoryEntry | null = null
  let exactMatch: UvaHistoryEntry | null = null

  for (const entry of sortedHistory) {
    const entryDate = new Date(entry.date)
    const entryYear = entryDate.getFullYear()
    const entryMonth = entryDate.getMonth()
    const entryDay = entryDate.getDate()

    // Look for exact match (same year, month, and day)
    if (entryYear === targetYear && entryMonth === targetMonth && entryDay === dayToMatch) {
      exactMatch = entry
    }
    // If entry is in the same month, keep the closest to the payment day
    else if (entryYear === targetYear && entryMonth === targetMonth) {
      if (
        !closestEntry ||
        Math.abs(entryDay - dayToMatch) < Math.abs(new Date(closestEntry.date).getDate() - dayToMatch)
      ) {
        closestEntry = entry
      }
    }
    // If entry is before target date, keep it as a fallback
    else if (entryDate <= targetDate) {
      if (!closestEntry) {
        closestEntry = entry
      }
    }
  }

  // Prefer exact match, then closest entry in the same month
  return exactMatch?.value || closestEntry?.value || null
}

export function useLoanData() {
  const { loanConfig, openConfigModal } = useLoanStore()

  const {
    data: rates,
    error: ratesError,
    mutate,
  } = useSWR<Rates>("rates", fetchRates, {
    refreshInterval: 60000, // Refresh every minute
    revalidateOnFocus: true,
  })

  // Open config modal if no loan config exists
  useEffect(() => {
    if (!loanConfig) {
      openConfigModal()
    }
  }, [loanConfig, openConfigModal])

  const loanData: LoanData | null = loanConfig ? calculateLoanData(loanConfig) : null

  const paymentDay = loanConfig ? new Date(loanConfig.startDate).getDate() : undefined

  return {
    loanData,
    rates,
    isLoading: !rates || ratesError,
    error: ratesError,
    refetch: () => mutate(),
    paymentDay,
  }
}
