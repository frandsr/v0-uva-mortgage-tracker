"use client"

import { useState, useEffect } from "react"
import { useLoanData, getUvaForDate } from "@/hooks/use-loan-data"
import { useLoanStore, BANKS } from "@/lib/loan-store"
import { formatCurrency, formatUVA } from "@/lib/formatters"
import { RefreshCw, Settings, Check, ArrowUpRight, ArrowDownRight, Activity, Menu, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, BarChart, Bar, Legend } from "recharts"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/user-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function PortfolioDashboard() {
  const { loanData, rates, isLoading, refetch, paymentDay } = useLoanData()
  const { loanConfig, dollarType, setDollarType, openConfigModal, markPaymentAsPaid, unmarkPaymentAsPaid } = useLoanStore()

  // Pagination for payment history (must be before any conditional returns)
  const PAYMENTS_PER_PAGE = 5
  const [currentPage, setCurrentPage] = useState<number | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Extract values safely for use in useEffect (before conditional return)
  const paidInstallments = loanData?.paidInstallments
  const totalInstallments = loanData?.totalInstallments ?? 1
  const totalPages = Math.ceil(totalInstallments / PAYMENTS_PER_PAGE)

  // Set initial page to the one containing the next payment due
  // This useEffect must be before any conditional returns
  useEffect(() => {
    if (!hasInitialized && paidInstallments !== undefined) {
      const initialPage = Math.floor(paidInstallments / PAYMENTS_PER_PAGE)
      setCurrentPage(Math.min(initialPage, totalPages - 1))
      setHasInitialized(true)
    }
  }, [hasInitialized, paidInstallments, totalPages])

  if (isLoading || !loanData || !rates || !loanConfig) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  const { remainingUVA, paidUVA, monthlyPaymentUVA, paidInterestUVA, amortizationSchedule, startDate } = loanData
  const { uva, uvaHistory, dolarBlue, dolarOficial } = rates
  const dolarValue = dollarType === "oficial" ? dolarOficial : dolarBlue
  const percentagePaid = (paidUVA / loanConfig.totalLoanUVA) * 100
  const bank = BANKS.find((b) => b.id === loanConfig.bank)

  const today = new Date()
  const configuredPaymentDay = paymentDay || new Date(startDate).getDate()

  const remainingYears = Math.ceil((totalInstallments - paidInstallments!) / 12)

  // Use page 0 as fallback while initializing
  const activePage = currentPage ?? Math.floor(paidInstallments! / PAYMENTS_PER_PAGE)

  const evolutionData = amortizationSchedule
    .filter((_, i) => i % 6 === 0 || i === amortizationSchedule.length - 1)
    .map((item) => ({
      month: item.month,
      equity: item.cumulativePaid,
      debt: item.remainingBalance,
    }))

  const compositionData = amortizationSchedule
    .filter((_, i) => i % 12 === 0)
    .slice(0, 10)
    .map((item) => ({
      year: `Año ${Math.ceil(item.month / 12)}`,
      capital: item.principal,
      interes: item.interest,
    }))

  // Get payments for current page
  const startIndex = activePage * PAYMENTS_PER_PAGE
  const paginatedPayments = amortizationSchedule.slice(startIndex, startIndex + PAYMENTS_PER_PAGE)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border dark:border-slate-800 bg-card/50 dark:bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-sm">Mi Crédito</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">• {bank?.name}</span>
          </div>

          {/* Desktop */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">UVA</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(uva, "ARS")}</span>
            </div>
            <Select value={dollarType} onValueChange={(v) => setDollarType(v as "oficial" | "blue")}>
              <SelectTrigger className="w-24 h-7 bg-muted dark:bg-slate-800 border-border dark:border-slate-700 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oficial">Oficial</SelectItem>
                <SelectItem value="blue">Blue</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={refetch} className="text-muted-foreground hover:text-foreground h-7 w-7">
              <RefreshCw className="w-3 h-3" />
            </Button>
            <UserMenu />
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={openConfigModal} className="text-muted-foreground hover:text-foreground h-7 w-7">
              <Settings className="w-3 h-3" />
            </Button>
          </div>

          {/* Mobile */}
          <div className="flex sm:hidden items-center gap-1">
            <UserMenu />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" title="Cotizaciones" className="bg-background dark:bg-slate-900 border-border dark:border-slate-800 w-72 p-0">
                <div className="px-4 py-4 border-b border-border dark:border-slate-800 space-y-2">
                  <h3 className="text-sm font-medium text-foreground">Cotizaciones</h3>
                  <div className="space-y-1">
                    <p className="text-emerald-600 dark:text-emerald-400 text-sm">UVA {formatCurrency(uva, "ARS")}</p>
                    <p className="text-emerald-600 dark:text-emerald-400 text-sm">USD {formatCurrency(dolarValue, "ARS")}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 px-4 py-4 space-y-3">
                  <Select value={dollarType} onValueChange={(v) => setDollarType(v as "oficial" | "blue")}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oficial">USD Oficial</SelectItem>
                      <SelectItem value="blue">USD Blue</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={refetch} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" /> Actualizar
                  </Button>
                </div>

                {/* Footer */}
                <div className="px-4 py-4 border-t border-border dark:border-slate-800 space-y-3 mt-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tema</span>
                    <ThemeToggle variant="compact" />
                  </div>
                  <Button variant="outline" onClick={openConfigModal} className="w-full">
                    <Settings className="w-4 h-4 mr-2" /> Configurar
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Main Value Card */}
        <div className="bg-gradient-to-br from-muted to-card dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 border border-border dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">Cuota Mensual</span>
            <span className="text-xs text-muted-foreground sm:hidden">UVA {formatCurrency(uva, "ARS")}</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{formatCurrency(monthlyPaymentUVA * uva, "ARS")}</div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{formatUVA(monthlyPaymentUVA)}</span>
            <span>{formatCurrency((monthlyPaymentUVA * uva) / dolarValue, "USD")}</span>
          </div>
        </div>

        {/* Stats Grid - 2x2 on mobile */}
        <div className="grid grid-cols-2 gap-2">
          <MetricCard
            label="Capital Pagado"
            value={formatCurrency(paidUVA * uva, "ARS")}
            uvaValue={formatUVA(paidUVA)}
            usdValue={formatCurrency((paidUVA * uva) / dolarValue, "USD")}
            change={percentagePaid}
            positive
          />
          <MetricCard
            label="Deuda Pendiente"
            value={formatCurrency(remainingUVA * uva, "ARS")}
            uvaValue={formatUVA(remainingUVA)}
            usdValue={formatCurrency((remainingUVA * uva) / dolarValue, "USD")}
            change={100 - percentagePaid}
            positive={false}
          />
          <MetricCard
            label="Intereses Pagados"
            value={formatCurrency(paidInterestUVA * uva, "ARS")}
            uvaValue={formatUVA(paidInterestUVA)}
            usdValue={formatCurrency((paidInterestUVA * uva) / dolarValue, "USD")}
          />
          <MetricCard
            label="Tiempo Restante"
            value={`${remainingYears} años`}
            uvaValue={`${paidInstallments}/${totalInstallments} cuotas`}
          />
        </div>

        {/* Charts */}
        <div className="space-y-4">
          {/* Evolution Chart */}
          <div className="bg-card dark:bg-slate-900 rounded-xl p-4 border border-border dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-sm">Evolución del Préstamo</h3>
                <p className="text-[10px] text-muted-foreground">Pagado vs Pendiente</p>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">Pagado</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-muted-foreground">Pendiente</span>
                </div>
              </div>
            </div>
            <div className="h-40 sm:h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 9 }} tickFormatter={(v) => `${v}`} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 9 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: 11 }}
                    formatter={(value: number) => [formatUVA(value), ""]}
                  />
                  <defs>
                    <linearGradient id="portEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="portDebt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="equity" stroke="#22c55e" strokeWidth={2} fill="url(#portEquity)" name="Pagado" />
                  <Area type="monotone" dataKey="debt" stroke="#f59e0b" strokeWidth={2} fill="url(#portDebt)" name="Pendiente" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Composition Chart */}
          <div className="bg-card dark:bg-slate-900 rounded-xl p-4 border border-border dark:border-slate-800">
            <div className="mb-3">
              <h3 className="font-semibold text-sm">Composición de Cuota</h3>
              <p className="text-[10px] text-muted-foreground">Capital vs Interés (UVA)</p>
            </div>
            <div className="h-36 sm:h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compositionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 9 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 9 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: 11 }}
                    formatter={(value: number) => [formatUVA(value), ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="capital" stackId="a" fill="#22c55e" name="Capital" />
                  <Bar dataKey="interes" stackId="a" fill="#f43f5e" name="Interés" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Loan Summary */}
        <div className="bg-card dark:bg-slate-900 rounded-xl p-4 border border-border dark:border-slate-800">
          <h3 className="font-semibold text-sm mb-3">Resumen del Préstamo</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div className="py-1.5 border-b border-border dark:border-slate-800">
              <span className="text-muted-foreground">Monto Original</span>
              <div className="font-medium">{formatCurrency(loanConfig.totalLoanUVA * uva, "ARS")}</div>
              <div className="text-[10px] text-muted-foreground">{formatUVA(loanConfig.totalLoanUVA)} • {formatCurrency((loanConfig.totalLoanUVA * uva) / dolarValue, "USD")}</div>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border dark:border-slate-800">
              <span className="text-muted-foreground">Tasa Anual</span>
              <span className="font-medium">{loanConfig.annualInterestRate}%</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border dark:border-slate-800">
              <span className="text-muted-foreground">Fecha Inicio</span>
              <span className="font-medium">{new Date(startDate).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border dark:border-slate-800">
              <span className="text-muted-foreground">Cuotas Pagadas</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">{paidInstallments} / {totalInstallments}</span>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-card dark:bg-slate-900 rounded-xl p-4 border border-border dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Historial de Pagos</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage(p => Math.max(0, (p ?? activePage) - 1))}
                disabled={activePage === 0}
                className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-[10px] text-muted-foreground min-w-[60px] text-center">
                {startIndex + 1}-{Math.min(startIndex + PAYMENTS_PER_PAGE, totalInstallments)} de {totalInstallments}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, (p ?? activePage) + 1))}
                disabled={activePage >= totalPages - 1}
                className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            {paginatedPayments.map((payment) => {
              const actualIndex = payment.month - 1
              const isPaid = actualIndex < paidInstallments
              const isNext = actualIndex === paidInstallments
              const isLastPaid = actualIndex === paidInstallments - 1 && paidInstallments > 0

              const paymentDate = new Date(startDate)
              paymentDate.setMonth(paymentDate.getMonth() + payment.month - 1)
              const isInPast = paymentDate <= today
              const historicalUva = isInPast ? getUvaForDate(uvaHistory, paymentDate, configuredPaymentDay) : null
              const uvaToUse = historicalUva || uva
              const totalARS = payment.totalPayment * uvaToUse

              // Calculate percentage change vs previous installment
              let arsChangePercent: number | null = null
              // Calculate percentage change vs first installment
              let arsChangeSinceFirst: number | null = null
              if (payment.month > 1) {
                const prevPayment = amortizationSchedule[payment.month - 2]
                const prevDate = new Date(startDate)
                prevDate.setMonth(prevDate.getMonth() + prevPayment.month - 1)
                const prevIsInPast = prevDate <= today
                const prevHistoricalUva = prevIsInPast ? getUvaForDate(uvaHistory, prevDate, configuredPaymentDay) : null
                const prevUvaToUse = prevHistoricalUva || uva
                const prevTotalARS = prevPayment.totalPayment * prevUvaToUse
                if (prevTotalARS > 0) {
                  arsChangePercent = ((totalARS - prevTotalARS) / prevTotalARS) * 100
                }

                const firstPayment = amortizationSchedule[0]
                const firstDate = new Date(startDate)
                const firstIsInPast = firstDate <= today
                const firstHistoricalUva = firstIsInPast ? getUvaForDate(uvaHistory, firstDate, configuredPaymentDay) : null
                const firstUvaToUse = firstHistoricalUva || uva
                const firstTotalARS = firstPayment.totalPayment * firstUvaToUse
                if (firstTotalARS > 0) {
                  arsChangeSinceFirst = ((totalARS - firstTotalARS) / firstTotalARS) * 100
                }
              }

              return (
                <div key={payment.month} className={`rounded-lg text-xs ${isNext ? "bg-muted/50 dark:bg-slate-800/50 border border-emerald-600/50 dark:border-emerald-800/50" : isPaid ? "bg-muted/30 dark:bg-slate-800/30" : "bg-muted/20 dark:bg-slate-800/20"}`}>
                  {/* Header row */}
                  <div className="flex items-center justify-between p-3 pb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isPaid ? "bg-emerald-100 dark:bg-emerald-900/50" : isNext ? "bg-emerald-600" : "bg-muted dark:bg-slate-700"}`}>
                        {isPaid ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <span className="text-[10px] font-bold">{payment.month}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">Cuota {payment.month}</div>
                        <div className="text-[10px] text-muted-foreground">{paymentDate.toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {arsChangePercent !== null && (
                        <span className="text-[10px] text-muted-foreground">
                          <span className="font-medium">+{arsChangePercent.toFixed(1)}%</span>
                          {arsChangeSinceFirst !== null && (
                            <span className="ml-1 opacity-60">(+{arsChangeSinceFirst.toFixed(0)}% total)</span>
                          )}
                        </span>
                      )}
                      {isLastPaid && (
                        <Button size="sm" variant="ghost" onClick={unmarkPaymentAsPaid} className="h-7 w-7 p-0 text-muted-foreground hover:text-amber-500 dark:hover:text-amber-400">
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Amount details */}
                  <div className="px-3 pb-3 space-y-2">
                    {/* Total */}
                    <div className="flex justify-between items-baseline">
                      <span className="text-muted-foreground">Total</span>
                      <div className="text-right">
                        <span className="font-bold text-sm">{formatCurrency(totalARS, "ARS")}</span>
                        <div className="text-[10px] text-muted-foreground">{formatUVA(payment.totalPayment)} • {formatCurrency(totalARS / dolarValue, "USD")}</div>
                      </div>
                    </div>

                    {/* Capital & Interest breakdown */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50 dark:border-slate-700/50">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Capital</span>
                        <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(payment.principal * uvaToUse, "ARS")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Interés</span>
                        <span className="text-rose-600 dark:text-rose-400">{formatCurrency(payment.interest * uvaToUse, "ARS")}</span>
                      </div>
                    </div>

                    {/* Pay button for next payment */}
                    {isNext && (
                      <Button
                        onClick={markPaymentAsPaid}
                        className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Marcar como pagada
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}

function MetricCard({ label, value, uvaValue, usdValue, change, positive }: {
  label: string
  value: string
  uvaValue?: string
  usdValue?: string
  change?: number
  positive?: boolean
}) {
  return (
    <div className="bg-card dark:bg-slate-900 rounded-xl p-3 border border-border dark:border-slate-800">
      <div className="text-[10px] text-muted-foreground mb-1">{label}</div>
      <div className="text-base sm:text-lg font-bold truncate">{value}</div>
      {(uvaValue || usdValue) && (
        <div className="flex flex-col gap-0.5 mt-1">
          {uvaValue && <div className="text-[10px] text-muted-foreground truncate">{uvaValue}</div>}
          {usdValue && <div className="text-[10px] text-muted-foreground truncate">{usdValue}</div>}
        </div>
      )}
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-[10px] mt-1 ${positive ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
          {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change.toFixed(1)}%
        </div>
      )}
    </div>
  )
}
