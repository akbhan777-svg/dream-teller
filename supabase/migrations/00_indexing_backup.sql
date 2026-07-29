-- =========================================================================================
-- [Dream Teller] Supabase Indexing DDL Backup
-- 목적: 주요 테이블의 쿼리 성능을 보장하기 위해 생성된 인덱스들의 형상 관리용 백업 파일입니다.
-- (실제 Supabase에는 이미 적용되어 있으며, PRD 11번 항목 검증 차원에서 작성되었습니다.)
-- =========================================================================================

-- 1. users 테이블 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS users_pkey ON public.users USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON public.users USING btree (email);
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON public.users USING btree (phone_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users USING btree (email);

-- 2. orders 테이블 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS orders_pkey ON public.orders USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_key ON public.orders USING btree (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders USING btree (order_number);

-- 3. payments 테이블 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS payments_pkey ON public.payments USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS payments_order_id_key ON public.payments USING btree (order_id);
CREATE UNIQUE INDEX IF NOT EXISTS payments_payment_key_key ON public.payments USING btree (payment_key);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments USING btree (order_id);

-- 4. dream_results 테이블 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS dream_results_pkey ON public.dream_results USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS dream_results_order_id_key ON public.dream_results USING btree (order_id);
CREATE INDEX IF NOT EXISTS idx_dream_results_public_feeds ON public.dream_results USING btree (created_at DESC) WHERE (is_public = true);

-- 5. pass_transactions 테이블 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS pass_transactions_pkey ON public.pass_transactions USING btree (id);
CREATE INDEX IF NOT EXISTS idx_pass_transactions_user_id ON public.pass_transactions USING btree (user_id);
