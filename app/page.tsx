import { AppShell } from "@/components/app-shell"
import { Dashboard } from "@/components/designs"
import { LoanConfigModal } from "@/components/loan-config-modal"

export default function HomePage() {
  return (
    <AppShell>
      <Dashboard />
      <LoanConfigModal />
    </AppShell>
  )
}
