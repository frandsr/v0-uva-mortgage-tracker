# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UVA Mortgage Tracker - A Next.js application for tracking Argentine UVA (Unidad de Valor Adquisitivo) mortgages. The UI is in Spanish for the Argentine market. Built with v0.app and deployed on Vercel.

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run start    # Start production server
```

## Architecture

### Tech Stack
- Next.js 16 with App Router
- React 19
- Supabase (Google OAuth + PostgreSQL)
- Zustand for client state (persisted to localStorage + synced to Supabase)
- Tailwind CSS v4 with shadcn/ui components
- SWR for data fetching
- Recharts for charts

### Directory Structure
- `app/` - Next.js App Router pages and API routes
- `components/` - React components (business logic components + `ui/` for shadcn primitives)
- `lib/` - Core utilities, Zustand store, Supabase clients, loan calculations
- `hooks/` - Custom React hooks

### Key Files
- [lib/loan-store.ts](lib/loan-store.ts) - Zustand store for loan configuration with Supabase sync
- [lib/loan-calculations.ts](lib/loan-calculations.ts) - French amortization calculation logic
- [hooks/use-loan-data.ts](hooks/use-loan-data.ts) - Main hook combining loan data with real-time rates
- [app/api/rates/route.ts](app/api/rates/route.ts) - API route fetching UVA and dollar rates from Argentine APIs

### Data Flow
1. Loan config stored in Zustand (`useLoanStore`) with localStorage persistence
2. When user is authenticated, config syncs bidirectionally with Supabase `loan_configs` table
3. Real-time rates (UVA, dolar blue, dolar oficial) fetched from external APIs via `/api/rates`
4. `useLoanData` hook combines loan config with rates for dashboard components

### External APIs
- ArgentinaDatos API: UVA historical values (`api.argentinadatos.com/v1/finanzas/indices/uva`)
- DolarAPI: Dollar exchange rates (`dolarapi.com/v1/dolares`)
- BCRA API: Fallback for UVA current value

## Environment Variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

Optional:
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` - Custom OAuth redirect for local development
