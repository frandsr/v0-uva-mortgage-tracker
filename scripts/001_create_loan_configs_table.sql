-- Create loan_configs table to store user's loan configuration
CREATE TABLE IF NOT EXISTS public.loan_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_loan_uva NUMERIC NOT NULL,
  annual_interest_rate NUMERIC NOT NULL,
  total_installments INTEGER NOT NULL,
  paid_installments INTEGER NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  bank TEXT NOT NULL,
  dollar_type TEXT NOT NULL DEFAULT 'oficial',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.loan_configs ENABLE ROW LEVEL SECURITY;

-- Policies for CRUD operations
CREATE POLICY "Users can view their own loan config"
  ON public.loan_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loan config"
  ON public.loan_configs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loan config"
  ON public.loan_configs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loan config"
  ON public.loan_configs FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_loan_configs_user_id ON public.loan_configs(user_id);
