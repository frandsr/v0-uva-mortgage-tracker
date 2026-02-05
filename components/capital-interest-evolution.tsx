"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLoanData } from "@/hooks/use-loan-data"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

export function CapitalInterestEvolution() {
  const { loanData, isLoading } = useLoanData()

  if (isLoading || !loanData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolución Capital vs Interés</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">Cargando gráfico...</p>
        </CardContent>
      </Card>
    )
  }

  const { amortizationSchedule, paidInstallments } = loanData

  // Generar datos de evolución - muestrear cada 12 cuotas para no sobrecargar
  const chartData = amortizationSchedule
    .filter(
      (_, index) => index % 12 === 0 || index === paidInstallments - 1 || index === amortizationSchedule.length - 1,
    )
    .map((payment) => {
      const isPaid = payment.month <= paidInstallments
      return {
        month: payment.month,
        year: `Año ${Math.ceil(payment.month / 12)}`,
        capitalPercent: (payment.principal / payment.totalPayment) * 100,
        interestPercent: (payment.interest / payment.totalPayment) * 100,
        isPaid,
      }
    })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Composición de Cuota: Capital vs Interés</CardTitle>
        <p className="text-sm text-muted-foreground">
          Evolución del porcentaje de capital e interés en cada cuota a lo largo del préstamo
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <YAxis
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                domain={[0, 100]}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                        <p className="font-medium text-foreground mb-2">
                          {label} (Cuota {data.month})
                        </p>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span className="text-muted-foreground">Capital:</span>
                            <span className="font-medium text-foreground">{data.capitalPercent.toFixed(1)}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-rose-500" />
                            <span className="text-muted-foreground">Interés:</span>
                            <span className="font-medium text-foreground">{data.interestPercent.toFixed(1)}%</span>
                          </div>
                        </div>
                        {data.isPaid && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">Cuota pagada</p>
                        )}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend
                formatter={(value) => (
                  <span className="text-sm text-foreground">
                    {value === "capitalPercent" ? "% Capital" : "% Interés"}
                  </span>
                )}
              />
              <Area
                type="monotone"
                dataKey="capitalPercent"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="capitalPercent"
              />
              <Area
                type="monotone"
                dataKey="interestPercent"
                stackId="1"
                stroke="#f43f5e"
                fill="#f43f5e"
                fillOpacity={0.6}
                name="interestPercent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            En los créditos sistema francés, al inicio se pagan más intereses. Con el tiempo, la proporción de capital
            aumenta progresivamente.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
