-- جدول المدفوعات
CREATE TABLE user_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'AED',
  paid_at TIMESTAMP WITH TIME ZONE,
  trip_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهرس للبحث السريع
CREATE INDEX idx_user_payments_user_id ON user_payments(user_id);
CREATE INDEX idx_user_payments_status ON user_payments(status);

-- سياسة RLS
ALTER TABLE user_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON user_payments FOR SELECT
  USING (auth.uid() = user_id);
