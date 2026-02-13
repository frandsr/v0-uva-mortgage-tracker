"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Clock, Plus, Undo2, Info } from "lucide-react"
import { useLoanData, getUvaForDate } from "@/hooks/use-loan-data"
import { useLoanStore } from "@/lib/loan-store"
import { formatCurrency, formatUVA } from "@/lib/formatters"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function PaymentHistory() {
  const { loanData, rates, isLoading, paymentDay } = useLoanData()
  const { markPaymentAsPaid, unmarkPaymentAsPaid } = useLoanStore()

  if (isLoading || !loanData || !rates) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Cuotas</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">Cargando historial...</p>
        </CardContent>
      </Card>
    )
  }

  const { amortizationSchedule, paidInstallments, startDate } = loanData
  const { uva, uvaHistory } = rates

  // Show last 5 paid + next 5 pending
  const relevantPayments = amortizationSchedule.slice(
    Math.max(0, paidInstallments - 3),
    Math.min(amortizationSchedule.length, paidInstallments + 5),
  )

  const startDateObj = new Date(startDate)
  const configuredPaymentDay = paymentDay || startDateObj.getDate()
  const today = new Date()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Historial de Cuotas</CardTitle>
        <Badge variant="outline">
          {paidInstallments} de {loanData.totalInstallments} cuotas pagas
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cuota</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fecha</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Capital (UVA)</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Interés (UVA)</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total (UVA)</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center justify-end gap-1 cursor-help">
                          Total (ARS)
                          <Info className="w-3 h-3" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-[200px]">
                          Cuotas pasadas: calculado con el UVA del día {configuredPaymentDay} de cada mes. Cuotas
                          futuras: estimado con UVA actual.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center justify-end gap-1 cursor-help">
                          UVA
                          <Info className="w-3 h-3" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-[200px]">
                          Valor del UVA del día {configuredPaymentDay} de cada mes (o el más cercano disponible).
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Var. ARS</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {relevantPayments.map((payment, index) => {
                const actualIndex = Math.max(0, paidInstallments - 3) + index
                const isPaid = actualIndex < paidInstallments
                const isNext = actualIndex === paidInstallments
                const isLastPaid = actualIndex === paidInstallments - 1 && paidInstallments > 0

                const paymentDate = new Date(startDate)
                paymentDate.setMonth(paymentDate.getMonth() + payment.month - 1)
                // Ensure we use the same day of month as configured
                paymentDate.setDate(
                  Math.min(
                    configuredPaymentDay,
                    new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 0).getDate(),
                  ),
                )

                const isInPast = paymentDate <= today
                const historicalUva = isInPast ? getUvaForDate(uvaHistory, paymentDate, configuredPaymentDay) : null
                const uvaToUse = historicalUva || uva
                const totalARS = payment.totalPayment * uvaToUse
                const isHistorical = isInPast && historicalUva !== null

                // Calculate percentage change vs previous installment
                let arsChangePercent: number | null = null
                if (payment.month > 1) {
                  const prevPayment = amortizationSchedule[payment.month - 2]
                  const prevDate = new Date(startDate)
                  prevDate.setMonth(prevDate.getMonth() + prevPayment.month - 1)
                  prevDate.setDate(
                    Math.min(
                      configuredPaymentDay,
                      new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 0).getDate(),
                    ),
                  )
                  const prevIsInPast = prevDate <= today
                  const prevHistoricalUva = prevIsInPast ? getUvaForDate(uvaHistory, prevDate, configuredPaymentDay) : null
                  const prevUvaToUse = prevHistoricalUva || uva
                  const prevTotalARS = prevPayment.totalPayment * prevUvaToUse
                  if (prevTotalARS > 0) {
                    arsChangePercent = ((totalARS - prevTotalARS) / prevTotalARS) * 100
                  }
                }

                return (
                  <tr
                    key={payment.month}
                    className={`border-b border-border last:border-0 ${isNext ? "bg-primary/5" : ""}`}
                  >
                    <td className="py-3 px-4 text-sm font-medium">{payment.month}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {paymentDate.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">{formatUVA(payment.principal)}</td>
                    <td className="py-3 px-4 text-sm text-right">{formatUVA(payment.interest)}</td>
                    <td className="py-3 px-4 text-sm text-right font-medium">{formatUVA(payment.totalPayment)}</td>
                    <td className="py-3 px-4 text-sm text-right font-medium">
                      <span className={isHistorical ? "" : "text-muted-foreground"}>
                        {!isHistorical && "~"}
                        {formatCurrency(totalARS, "ARS")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              className={`cursor-help ${isHistorical ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground"}`}
                            >
                              {!isHistorical && "~"}${uvaToUse.toLocaleString("es-AR", { maximumFractionDigits: 2 })}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              {isHistorical
                                ? `UVA histórico del ${paymentDate.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}`
                                : "UVA actual (estimado para cuotas futuras)"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      {arsChangePercent !== null ? (
                        <span className={`font-medium ${arsChangePercent > 0 ? "text-rose-600 dark:text-rose-400" : arsChangePercent < 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                          {arsChangePercent > 0 ? "+" : ""}{arsChangePercent.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isPaid ? (
                        isLastPaid ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => unmarkPaymentAsPaid()}
                            className="h-7 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-800 dark:hover:bg-emerald-900 dark:text-emerald-400"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Pagada
                            <Undo2 className="w-3 h-3 ml-1 opacity-50" />
                          </Button>
                        ) : (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400">
                            <Check className="w-3 h-3 mr-1" />
                            Pagada
                          </Badge>
                        )
                      ) : isNext ? (
                        <Button size="sm" variant="outline" onClick={() => markPaymentAsPaid()} className="h-7">
                          <Plus className="w-3 h-3 mr-1" />
                          Marcar pagada
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          Pendiente
                        </Badge>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
