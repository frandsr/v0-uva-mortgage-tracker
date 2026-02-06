"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLoanStore, type LoanConfig, BANKS } from "@/lib/loan-store"

export function LoanConfigModal() {
  const { isConfigModalOpen, closeConfigModal, loanConfig, setLoanConfig } = useLoanStore()

  const [formData, setFormData] = useState<LoanConfig>({
    totalLoanUVA: 50000,
    annualInterestRate: 4.9,
    totalInstallments: 360,
    paidInstallments: 12,
    startDate: new Date().toISOString().split("T")[0],
    bank: "nacion",
  })

  useEffect(() => {
    if (loanConfig) {
      setFormData(loanConfig)
    }
  }, [loanConfig])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoanConfig(formData)
    closeConfigModal()
  }

  return (
    <Dialog open={isConfigModalOpen} onOpenChange={closeConfigModal}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-white">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Configurar Crédito Hipotecario</DialogTitle>
            <DialogDescription className="text-slate-400">Ingresá los datos de tu crédito hipotecario UVA</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bank" className="text-slate-300">Banco</Label>
              <Select value={formData.bank} onValueChange={(value) => setFormData({ ...formData, bank: value })}>
                <SelectTrigger id="bank" className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Seleccionar banco" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {BANKS.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      <span className="flex items-center gap-2">
                        <span>{bank.logo}</span>
                        <span>{bank.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalLoanUVA" className="text-slate-300">Monto Total (UVA)</Label>
                <Input
                  id="totalLoanUVA"
                  type="number"
                  value={formData.totalLoanUVA}
                  onChange={(e) => setFormData({ ...formData, totalLoanUVA: Number(e.target.value) })}
                  placeholder="50000"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="annualInterestRate" className="text-slate-300">Tasa Anual (%)</Label>
                <Input
                  id="annualInterestRate"
                  type="number"
                  step="0.1"
                  value={formData.annualInterestRate}
                  onChange={(e) => setFormData({ ...formData, annualInterestRate: Number(e.target.value) })}
                  placeholder="4.9"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalInstallments" className="text-slate-300">Cantidad de Cuotas</Label>
                <Input
                  id="totalInstallments"
                  type="number"
                  value={formData.totalInstallments}
                  onChange={(e) => setFormData({ ...formData, totalInstallments: Number(e.target.value) })}
                  placeholder="360"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paidInstallments" className="text-slate-300">Cuotas Pagadas</Label>
                <Input
                  id="paidInstallments"
                  type="number"
                  value={formData.paidInstallments}
                  onChange={(e) => setFormData({ ...formData, paidInstallments: Number(e.target.value) })}
                  placeholder="12"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-slate-300">Fecha de Inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeConfigModal} className="border-slate-700 text-slate-300 hover:bg-slate-800">
              Cancelar
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
