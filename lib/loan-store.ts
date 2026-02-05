import { create } from "zustand"
import { persist } from "zustand/middleware"
import { createClient } from "@/lib/supabase/client"

export interface LoanConfig {
  totalLoanUVA: number
  annualInterestRate: number
  totalInstallments: number
  paidInstallments: number
  startDate: string
  bank: string
}

export type DollarType = "oficial" | "blue"

export const BANKS = [
  { id: "nacion", name: "Banco Nación", logo: "🏛️" },
  { id: "provincia", name: "Banco Provincia", logo: "🏦" },
  { id: "ciudad", name: "Banco Ciudad", logo: "🏙️" },
  { id: "hipotecario", name: "Banco Hipotecario", logo: "🏠" },
  { id: "santander", name: "Santander", logo: "🔴" },
  { id: "galicia", name: "Banco Galicia", logo: "🟠" },
  { id: "bbva", name: "BBVA", logo: "🔵" },
  { id: "macro", name: "Banco Macro", logo: "🟢" },
  { id: "otro", name: "Otro", logo: "🏦" },
] as const

interface LoanStore {
  loanConfig: LoanConfig | null
  isConfigModalOpen: boolean
  dollarType: DollarType
  isSyncing: boolean
  setLoanConfig: (config: LoanConfig) => void
  openConfigModal: () => void
  closeConfigModal: () => void
  markPaymentAsPaid: () => void
  unmarkPaymentAsPaid: () => void
  setDollarType: (type: DollarType) => void
  syncWithSupabase: (userId: string) => Promise<void>
  loadFromSupabase: (userId: string) => Promise<void>
}

export const useLoanStore = create<LoanStore>()(
  persist(
    (set, get) => ({
      loanConfig: null,
      isConfigModalOpen: false,
      dollarType: "oficial",
      isSyncing: false,

      setLoanConfig: async (config) => {
        set({ loanConfig: config })
      },

      openConfigModal: () => set({ isConfigModalOpen: true }),
      closeConfigModal: () => set({ isConfigModalOpen: false }),

      markPaymentAsPaid: () => {
        const { loanConfig } = get()
        if (loanConfig && loanConfig.paidInstallments < loanConfig.totalInstallments) {
          set({
            loanConfig: {
              ...loanConfig,
              paidInstallments: loanConfig.paidInstallments + 1,
            },
          })
        }
      },

      unmarkPaymentAsPaid: () => {
        const { loanConfig } = get()
        if (loanConfig && loanConfig.paidInstallments > 0) {
          set({
            loanConfig: {
              ...loanConfig,
              paidInstallments: loanConfig.paidInstallments - 1,
            },
          })
        }
      },

      setDollarType: (type) => set({ dollarType: type }),

      syncWithSupabase: async (userId: string) => {
        const { loanConfig, dollarType } = get()
        if (!loanConfig) return

        set({ isSyncing: true })
        try {
          const supabase = createClient()
          const { error } = await supabase.from("loan_configs").upsert(
            {
              user_id: userId,
              total_loan_uva: loanConfig.totalLoanUVA,
              annual_interest_rate: loanConfig.annualInterestRate,
              total_installments: loanConfig.totalInstallments,
              paid_installments: loanConfig.paidInstallments,
              start_date: loanConfig.startDate,
              bank: loanConfig.bank,
              dollar_type: dollarType,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
          )

          if (error) {
            console.error("Error syncing with Supabase:", error)
          }
        } catch (error) {
          console.error("Error syncing with Supabase:", error)
        } finally {
          set({ isSyncing: false })
        }
      },

      loadFromSupabase: async (userId: string) => {
        set({ isSyncing: true })
        try {
          const supabase = createClient()
          const { data, error } = await supabase.from("loan_configs").select("*").eq("user_id", userId).single()

          if (error && error.code !== "PGRST116") {
            console.error("Error loading from Supabase:", error)
          }

          if (data) {
            set({
              loanConfig: {
                totalLoanUVA: Number(data.total_loan_uva),
                annualInterestRate: Number(data.annual_interest_rate),
                totalInstallments: data.total_installments,
                paidInstallments: data.paid_installments,
                startDate: data.start_date,
                bank: data.bank,
              },
              dollarType: data.dollar_type as DollarType,
            })
          }
        } catch (error) {
          console.error("Error loading from Supabase:", error)
        } finally {
          set({ isSyncing: false })
        }
      },
    }),
    {
      name: "loan-config-storage",
    },
  ),
)
