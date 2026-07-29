CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT,
    category TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS 보안 정책 활성화
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- 백엔드 API 서버액션(Service Role) 등에서의 접근을 위해 RLS 정책 설정 (선택적)
-- Service Role 키를 사용하는 서버 쿼리는 RLS를 자동 우회하므로 Public 접근은 모두 차단상태 유지
