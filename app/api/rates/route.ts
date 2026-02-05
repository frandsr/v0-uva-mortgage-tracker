import { NextResponse } from "next/server"

interface BCRAVariable {
  idVariable: number
  descripcion: string
  categoria: string
  fecha: string
  valor: number
}

interface BCRAResponse {
  status: number
  results: BCRAVariable[]
}

interface ArgentinaDatosUVA {
  fecha: string
  valor: number
}

export async function GET() {
  try {
    const uvaPromise = fetchUvaWithHistory()

    // Fetch dollar rates from DolarAPI
    const dolarPromise = fetch("https://dolarapi.com/v1/dolares", {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Dolar API error")
        const data = await res.json()
        const blue = data.find((d: any) => d.casa === "blue")
        const oficial = data.find((d: any) => d.casa === "oficial")
        return {
          dolarBlue: blue?.venta || 1200,
          dolarOficial: oficial?.venta || 1050,
        }
      })
      .catch(() => {
        return {
          dolarBlue: 1200,
          dolarOficial: 1050,
        }
      })

    const [uvaData, dolar] = await Promise.all([uvaPromise, dolarPromise])

    return NextResponse.json({
      uva: uvaData.current,
      uvaHistory: uvaData.history,
      dolarBlue: dolar.dolarBlue,
      dolarOficial: dolar.dolarOficial,
    })
  } catch (error) {
    console.error("Error fetching rates:", error)
    return NextResponse.json({
      uva: 1673.5,
      uvaHistory: [],
      dolarBlue: 1200,
      dolarOficial: 1050,
    })
  }
}

async function fetchUvaWithHistory(): Promise<{ current: number; history: { date: string; value: number }[] }> {
  // Try ArgentinaDatos API first (most reliable and includes full history)
  try {
    const response = await fetch("https://api.argentinadatos.com/v1/finanzas/indices/uva", {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    })

    if (response.ok) {
      const data: ArgentinaDatosUVA[] = await response.json()
      if (Array.isArray(data) && data.length > 0) {
        const history = data.map((item) => ({
          date: item.fecha,
          value: item.valor,
        }))
        const current = history[history.length - 1].value
        return { current, history }
      }
    }
  } catch (error) {
    console.error("ArgentinaDatos API error:", error)
  }

  // Fallback to BCRA current value only
  try {
    const response = await fetch("https://api.bcra.gob.ar/estadisticas/v3.0/Monetarias", {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    })

    if (response.ok) {
      const data: BCRAResponse = await response.json()
      // UVA idVariable in BCRA API is 31
      const uvaVariable = data.results?.find((v) => v.idVariable === 31)
      if (uvaVariable) {
        return {
          current: uvaVariable.valor,
          history: [{ date: uvaVariable.fecha, value: uvaVariable.valor }],
        }
      }
    }
  } catch (error) {
    console.error("BCRA API error:", error)
  }

  // Final fallback with hardcoded value
  return {
    current: 1673.5,
    history: [],
  }
}
