"use client"

import { useServiceWorker } from "@/hooks/use-service-worker"
import { OfflineBanner } from "@/components/offline-banner"

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  // Initialize service worker
  useServiceWorker()

  return (
    <>
      {children}
      <OfflineBanner />
    </>
  )
}
