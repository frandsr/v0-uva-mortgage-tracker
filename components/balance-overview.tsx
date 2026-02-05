"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useLoanData } from "@/hooks/use-loan-data"
import { useLoanStore } from "@/lib/loan-store"
import { formatCurrency, formatUVA } from "@/lib/formatters"
import { RefreshCw, Landmark, Wallet, TrendingDown, PiggyBank, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function BalanceOverview() {
  const { loanData, rates, isLoading, refetch } = useLoanData()
  const { loanConfig, dollarType, setDollarType } = useLoanStore()

  if (isLoading || !loanData || !rates || !loanConfig) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-48 bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  const { remainingUVA, paidUVA, monthlyPaymentUVA, paidInterestUVA } = loanData
  const { uva, dolarBlue, dolarOficial } = rates

  const dolarValue = dollarType === "oficial" ? dolarOficial : dolarBlue
  const dolarLabel = dollarType === "oficial" ? "Oficial" : "Blue"

  const mainBalances = [
    {
      label: "Préstamo Original",
      icon: Landmark,
      uva: loanConfig.totalLoanUVA,
      ars: loanConfig.totalLoanUVA * uva,
      usd: (loanConfig.totalLoanUVA * uva) / dolarValue,
      color: "slate",
    },
    {
      label: "Saldo Pendiente",
      icon: Wallet,
      uva: remainingUVA,
      ars: remainingUVA * uva,
      usd: (remainingUVA * uva) / dolarValue,
      color: "amber",
    },
    {
      label: "Capital Pagado",
      icon: PiggyBank,
      uva: paidUVA,
      ars: paidUVA * uva,
      usd: (paidUVA * uva) / dolarValue,
      color: "emerald",
    },
    {
      label: "Intereses Pagados",
      icon: TrendingDown,
      uva: paidInterestUVA,
      ars: paidInterestUVA * uva,
      usd: (paidInterestUVA * uva) / dolarValue,
      color: "rose",
    },
  ]

  const cuotaActual = {
    label: "Cuota Actual",
    icon: Receipt,
    uva: monthlyPaymentUVA,
    ars: monthlyPaymentUVA * uva,
    usd: (monthlyPaymentUVA * uva) / dolarValue,
  }

  return (
    <Card className="overflow-hidden border shadow-sm">
      <CardContent className="p-4 sm:p-6">
        {/* Header con cotizaciones */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 pb-4 border-b">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-violet-50 border border-violet-200 dark:bg-violet-950 dark:border-violet-800">
              <span className="text-[10px] font-bold text-violet-700 dark:text-violet-300 uppercase">UVA</span>
              <span className="text-sm font-semibold text-violet-900 dark:text-violet-100">
                {formatCurrency(uva, "ARS")}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800">
              <span className="text-[10px] font-bold text-green-700 dark:text-green-300 uppercase">
                USD {dolarLabel}
              </span>
              <span className="text-sm font-semibold text-green-900 dark:text-green-100">
                {formatCurrency(dolarValue, "ARS")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={dollarType} onValueChange={(v) => setDollarType(v as "oficial" | "blue")}>
              <SelectTrigger className="w-[120px] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oficial">USD Oficial</SelectItem>
                <SelectItem value="blue">USD Blue</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" className="h-9 w-9 bg-transparent" onClick={refetch}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 p-5 rounded-xl border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 dark:border-blue-600 shadow-lg ring-2 ring-blue-200 dark:ring-blue-800">
            {/* Title section - now more prominent */}
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-lg bg-blue-500 text-white">
                <Receipt className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 uppercase tracking-wide">
                Cuota Actual
              </h2>
            </div>

            {/* Values - balanced sizing */}
            <div className="space-y-3">
              {/* UVA - Principal value but not larger than title */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold bg-violet-600 text-white">
                  UVA
                </span>
                <span className="text-xl font-bold text-blue-900 dark:text-blue-100">{formatUVA(cuotaActual.uva)}</span>
              </div>

              {/* ARS */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold bg-sky-600 text-white">
                  ARS
                </span>
                <span className="text-lg font-bold text-blue-800 dark:text-blue-200">
                  {formatCurrency(cuotaActual.ars, "ARS")}
                </span>
              </div>

              {/* USD */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold bg-green-600 text-white">
                  USD
                </span>
                <span className="text-base font-semibold text-blue-700 dark:text-blue-300">
                  {formatCurrency(cuotaActual.usd, "USD")}
                </span>
              </div>
            </div>
          </div>

          {/* Otras métricas */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mainBalances.map((balance) => {
              const Icon = balance.icon
              const colorClasses = {
                slate:
                  "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300",
                amber:
                  "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300",
                emerald:
                  "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300",
                rose: "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300",
              }[balance.color]

              const iconColorClasses = {
                slate: "text-slate-500 dark:text-slate-400",
                amber: "text-amber-500 dark:text-amber-400",
                emerald: "text-emerald-500 dark:text-emerald-400",
                rose: "text-rose-500 dark:text-rose-400",
              }[balance.color]

              return (
                <div key={balance.label} className={`p-3.5 rounded-xl border ${colorClasses} space-y-2.5`}>
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${iconColorClasses}`} />
                    <p className="text-xs font-semibold uppercase tracking-wide">{balance.label}</p>
                  </div>

                  <div className="space-y-1.5">
                    {/* UVA */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-600 text-white">
                        UVA
                      </span>
                      <span className="text-sm font-bold">{formatUVA(balance.uva)}</span>
                    </div>

                    {/* ARS */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-600 text-white">
                        ARS
                      </span>
                      <span className="text-sm font-semibold">{formatCurrency(balance.ars, "ARS")}</span>
                    </div>

                    {/* USD */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-600 text-white">
                        USD
                      </span>
                      <span className="text-sm font-semibold">{formatCurrency(balance.usd, "USD")}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
