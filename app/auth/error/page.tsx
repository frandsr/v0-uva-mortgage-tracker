import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 bg-slate-950">
      <Card className="w-full max-w-sm bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Error de autenticación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-400">
            {params?.error ? `Código de error: ${params.error}` : "Ocurrió un error durante la autenticación."}
          </p>
          <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
