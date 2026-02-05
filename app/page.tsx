import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { BalanceOverview } from "@/components/balance-overview"
import { ProgressChart } from "@/components/progress-chart"
import { PaymentProgress } from "@/components/payment-progress"
import { PaymentHistory } from "@/components/payment-history"
import { LoanConfigModal } from "@/components/loan-config-modal"
import { CapitalInterestEvolution } from "@/components/capital-interest-evolution"
import { Skeleton } from "@/components/ui/skeleton"
import { AppShell } from "@/components/app-shell"

export default function HomePage() {
  return (
    <AppShell>
      <main className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container mx-auto px-4 py-8 space-y-8">
          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContent />
          </Suspense>
        </div>
        <LoanConfigModal />
      </main>
    </AppShell>
  )
}

async function DashboardContent() {
  return (
    <>
      <BalanceOverview />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressChart />
        <PaymentProgress />
      </div>
      <CapitalInterestEvolution />
      <PaymentHistory />
    </>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-48 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
      <Skeleton className="h-80 rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  )
}
