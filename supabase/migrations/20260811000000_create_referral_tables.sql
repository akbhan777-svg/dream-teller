-- Create referral_links table
CREATE TABLE public.referral_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    channel_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.referral_links ENABLE ROW LEVEL SECURITY;

-- Policies for referral_links
CREATE POLICY "Users can view their own referral links" 
    ON public.referral_links FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own referral links" 
    ON public.referral_links FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Create referral_transactions table
CREATE TYPE public.referral_status AS ENUM ('holding', 'available', 'paid');

CREATE TABLE public.referral_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_id TEXT NOT NULL,
    product_type TEXT,
    payment_amount DECIMAL(10,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    status public.referral_status DEFAULT 'holding'::public.referral_status NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    holding_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + interval '7 days') NOT NULL
);

-- Enable RLS
ALTER TABLE public.referral_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for referral_transactions
CREATE POLICY "Users can view their own commissions" 
    ON public.referral_transactions FOR SELECT 
    USING (auth.uid() = referrer_id);
