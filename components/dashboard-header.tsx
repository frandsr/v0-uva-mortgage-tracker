"use client"

import { Home, Settings, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLoanStore, BANKS } from "@/lib/loan-store"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/user-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DashboardHeader() {
  const { openConfigModal, loanConfig } = useLoanStore()

  const selectedBank = BANKS.find((b) => b.id === loanConfig?.bank) || BANKS[0]

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
        {/* Logo y título - siempre visible */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Home className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-1.5">
              <span className="hidden xs:inline">Mi Crédito UVA</span>
              <span className="xs:hidden">UVA</span>
              <span className="text-base sm:text-lg shrink-0">{selectedBank.logo}</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{selectedBank.name}</p>
          </div>
        </div>

        {/* Desktop buttons */}
        <div className="hidden md:flex items-center gap-2">
          <UserMenu />
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={openConfigModal}>
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
        </div>

        {/* Mobile/Tablet menu */}
        <div className="flex md:hidden items-center gap-1">
          <UserMenu />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <ThemeToggle variant="menuItem" />
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={openConfigModal}>
                <Settings className="w-4 h-4 mr-2" />
                Configurar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
