-- ============================================
-- Скрипт для создания таблиц payments и activation_codes
-- Выполните этот SQL в Supabase SQL Editor
-- ============================================

-- Создаем enum для статусов платежей, если его еще нет
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE public.payment_status AS ENUM ('pending', 'succeeded', 'failed', 'cancelled');
    END IF;
END $$;

-- Создаем таблицу payments, если ее еще нет
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_user_id TEXT NOT NULL,
    tariff_id UUID REFERENCES public.tariffs(id),
    custom_hours INTEGER,
    amount INTEGER NOT NULL, -- в копейках
    status payment_status NOT NULL DEFAULT 'pending',
    payment_method TEXT DEFAULT 'sbp',
    external_payment_id TEXT,
    confirmation_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создаем таблицу activation_codes, если ее еще нет
CREATE TABLE IF NOT EXISTS public.activation_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE NOT NULL,
    duration_minutes INTEGER NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создаем индексы
CREATE INDEX IF NOT EXISTS idx_payments_telegram_user_id ON public.payments(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_activation_codes_code ON public.activation_codes(code);
CREATE INDEX IF NOT EXISTS idx_activation_codes_payment_id ON public.activation_codes(payment_id);

-- Включаем RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики, если есть
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;
DROP POLICY IF EXISTS "Service accounts can read payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can manage activation codes" ON public.activation_codes;
DROP POLICY IF EXISTS "Service accounts can read activation codes" ON public.activation_codes;

-- Политика: любой может создавать платежи
CREATE POLICY "Anyone can insert payments" 
ON public.payments
FOR INSERT 
WITH CHECK (true);

-- Политика: пользователи могут читать свои платежи
CREATE POLICY "Users can read own payments" 
ON public.payments
FOR SELECT 
USING (true);

-- Политика: сервисные аккаунты могут обновлять платежи
CREATE POLICY "Service accounts can update payments" 
ON public.payments
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Политика: любой может создавать коды активации
CREATE POLICY "Anyone can insert activation codes" 
ON public.activation_codes
FOR INSERT 
WITH CHECK (true);

-- Политика: любой может читать коды активации
CREATE POLICY "Anyone can read activation codes" 
ON public.activation_codes
FOR SELECT 
USING (true);

-- Убеждаемся, что функция generate_activation_code существует
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'generate_activation_code'
    ) THEN
        CREATE OR REPLACE FUNCTION public.generate_activation_code()
        RETURNS TEXT
        LANGUAGE plpgsql
        AS $$
        DECLARE
            chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            result TEXT := '';
            i INTEGER;
        BEGIN
            FOR i IN 1..8 LOOP
                result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
            END LOOP;
            RETURN result;
        END;
        $$;
    END IF;
END $$;

-- Убеждаемся, что функция update_updated_at_column существует
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'update_updated_at_column'
    ) THEN
        CREATE OR REPLACE FUNCTION public.update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    END IF;
END $$;

-- Создаем триггер для обновления updated_at
DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Проверяем результат
SELECT 'Таблицы payments и activation_codes успешно созданы!' as status;
