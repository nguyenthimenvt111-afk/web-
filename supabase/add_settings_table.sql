-- Thêm bảng settings cho auto_approve và các cấu hình global
-- Chạy trong Supabase SQL Editor

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Giá trị mặc định: auto_approve = false
INSERT INTO settings (key, value)
VALUES ('auto_approve', 'false')
ON CONFLICT (key) DO NOTHING;
