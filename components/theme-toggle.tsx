"use client"

import type React from "react"

import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ThemeToggleProps {
  variant?: "default" | "menuItem"
}

export function ThemeToggle({ variant = "default" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  const icons: Record<string, React.ReactNode> = {
    light: <Sun className="h-4 w-4" />,
    dark: <Moon className="h-4 w-4" />,
    system: <Monitor className="h-4 w-4" />,
  }

  const themeLabels: Record<string, string> = {
    light: "Claro",
    dark: "Oscuro",
    system: "Sistema",
  }

  if (variant === "menuItem") {
    return (
      <div className="flex items-center justify-between w-full px-2 py-1.5">
        <span className="text-sm">Tema</span>
        <div className="flex items-center gap-1">
          <Button
            variant={theme === "light" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setTheme("light")}
          >
            <Sun className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={theme === "dark" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setTheme("dark")}
          >
            <Moon className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={theme === "system" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setTheme("system")}
          >
            <Monitor className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9 bg-transparent">
          {icons[theme || "system"]}
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Oscuro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
