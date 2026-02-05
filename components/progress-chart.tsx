"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLoanData } from "@/hooks/use-loan-data"
import { useLoanStore } from "@/lib/loan-store"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

export function ProgressChart() {
  const { loanData, isLoading } = useLoanData()
  const { loanConfig } = useLoanStore()

  if (isLoading || !loanData || !loanConfig) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-80 bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  const { paidUVA, remainingUVA, paidInterestUVA } = loanData
  const totalLoanUVA = loanConfig.totalLoanUVA

  const percentagePaid = (paidUVA / totalLoanUVA) * 100
  const percentageRemaining = 100 - percentagePaid

  const chartData = [
    { name: "Capital Pagado", value: paidUVA, color: "#10b981" },
    { name: "Saldo Pendiente", value: remainingUVA, color: "#e2e8f0" },
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm" style={{ color: data.color === "#e2e8f0" ? "#64748b" : data.color }}>
            {data.name}
          </p>
          <p className="text-sm text-slate-600">
            {data.value.toLocaleString("es-AR", { maximumFractionDigits: 2 })} UVA
          </p>
          <p className="text-xs text-slate-400">{((data.value / totalLoanUVA) * 100).toFixed(1)}% del préstamo</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Progreso del Capital</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col lg:flex-row items-center gap-4">
          {/* Gráfico circular */}
          <div className="relative w-full lg:w-1/2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Porcentaje central */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-bold text-emerald-600">{percentagePaid.toFixed(1)}%</span>
              <span className="text-xs text-slate-500">pagado</span>
            </div>
          </div>

          {/* Stats panel */}
          <div className="w-full lg:w-1/2 space-y-4">
            {/* Capital Pagado */}
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-emerald-800">Capital Pagado</span>
              </div>
              <p className="text-2xl font-bold text-emerald-700">
                {paidUVA.toLocaleString("es-AR", { maximumFractionDigits: 2 })} UVA
              </p>
              <p className="text-xs text-emerald-600">{percentagePaid.toFixed(1)}% del préstamo</p>
            </div>

            {/* Saldo Pendiente */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-slate-400" />
                <span className="text-sm font-medium text-slate-700">Saldo Pendiente</span>
              </div>
              <p className="text-2xl font-bold text-slate-700">
                {remainingUVA.toLocaleString("es-AR", { maximumFractionDigits: 2 })} UVA
              </p>
              <p className="text-xs text-slate-500">{percentageRemaining.toFixed(1)}% restante</p>
            </div>

            {/* Intereses */}
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm font-medium text-amber-800">Intereses Pagados</span>
              </div>
              <p className="text-2xl font-bold text-amber-700">
                {paidInterestUVA.toLocaleString("es-AR", { maximumFractionDigits: 2 })} UVA
              </p>
            </div>

            {/* Barra de cuotas */}
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-slate-600">Cuotas pagadas</span>
                <span className="font-semibold">
                  {loanConfig.paidInstallments} / {loanConfig.totalInstallments}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(loanConfig.paidInstallments / loanConfig.totalInstallments) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
