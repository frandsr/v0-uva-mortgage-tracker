"use client"

import { useOnlineStatus } from "@/hooks/use-online-status"
import { WifiOff } from "lucide-react"

export function OfflineBanner() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto bg-amber-500/90 text-amber-950 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg z-50">
      <WifiOff className="h-4 w-4" />
      <span className="text-sm font-medium">Sin conexión - usando datos guardados</span>
    </div>
  )
}
