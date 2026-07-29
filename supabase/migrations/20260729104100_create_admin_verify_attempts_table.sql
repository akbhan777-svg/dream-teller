CREATE TABLE IF NOT EXISTS admin_verify_attempts (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE admin_verify_attempts ENABLE ROW LEVEL SECURITY;

-- Service Role (서버 액션) 기반에서만 업데이트하므로 RLS는 모두 닫힌 채로 둡니다.
