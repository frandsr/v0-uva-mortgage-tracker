import type { LoanConfig } from "./loan-store"

export interface AmortizationItem {
  month: number
  principal: number
  interest: number
  totalPayment: number
  remainingBalance: number
  cumulativePaid: number
}

export interface LoanData extends LoanConfig {
  monthlyPaymentUVA: number
  remainingUVA: number
  paidUVA: number
  paidInterestUVA: number
  amortizationSchedule: AmortizationItem[]
}

export function calculateLoanData(config: LoanConfig): LoanData {
  const { totalLoanUVA, annualInterestRate, totalInstallments, paidInstallments } = config

  // Monthly interest rate
  const monthlyRate = annualInterestRate / 100 / 12

  // Calculate monthly payment using French amortization formula
  const monthlyPaymentUVA =
    (totalLoanUVA * (monthlyRate * Math.pow(1 + monthlyRate, totalInstallments))) /
    (Math.pow(1 + monthlyRate, totalInstallments) - 1)

  // Generate amortization schedule
  const amortizationSchedule: AmortizationItem[] = []
  let remainingBalance = totalLoanUVA
  let cumulativePaid = 0

  for (let month = 1; month <= totalInstallments; month++) {
    const interest = remainingBalance * monthlyRate
    const principal = monthlyPaymentUVA - interest
    remainingBalance -= principal
    cumulativePaid += principal

    amortizationSchedule.push({
      month,
      principal,
      interest,
      totalPayment: monthlyPaymentUVA,
      remainingBalance: Math.max(0, remainingBalance),
      cumulativePaid,
    })
  }

  // Calculate paid and remaining amounts
  const paidUVA = amortizationSchedule.slice(0, paidInstallments).reduce((sum, item) => sum + item.principal, 0)
  const paidInterestUVA = amortizationSchedule.slice(0, paidInstallments).reduce((sum, item) => sum + item.interest, 0)

  const remainingUVA = totalLoanUVA - paidUVA

  return {
    ...config,
    monthlyPaymentUVA,
    remainingUVA,
    paidUVA,
    paidInterestUVA,
    amortizationSchedule,
  }
}
