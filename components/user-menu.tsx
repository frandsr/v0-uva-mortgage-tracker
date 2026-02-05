"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Cloud, CloudOff } from "lucide-react"

export function UserMenu() {
  const { user, isLoading, signInWithGoogle, signOut } = useAuth()

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Cloud className="w-4 h-4 mr-2 animate-pulse" />
        Cargando...
      </Button>
    )
  }

  if (!user) {
    return (
      <Button variant="outline" size="sm" onClick={signInWithGoogle}>
        <CloudOff className="w-4 h-4 mr-2" />
        Iniciar sesión
      </Button>
    )
  }

  const initials = user.email?.slice(0, 2).toUpperCase() || "U"
  const avatarUrl = user.user_metadata?.avatar_url

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={user.email || "Usuario"} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <Cloud className="w-4 h-4 text-emerald-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || "Usuario"}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-emerald-600">
          <Cloud className="w-4 h-4 mr-2" />
          Datos sincronizados
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
