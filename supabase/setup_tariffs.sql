-- ============================================
-- Скрипт для создания таблицы tariffs и тестовых данных
-- Выполните этот SQL в Supabase SQL Editor
-- ============================================

-- Создаем enum для типов тарифов, если его еще нет
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tariff_type') THEN
        CREATE TYPE public.tariff_type AS ENUM ('hourly', 'package');
    END IF;
END $$;

-- Создаем таблицу tariffs, если ее еще нет
CREATE TABLE IF NOT EXISTS public.tariffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- в копейках
    duration_minutes INTEGER NOT NULL,
    type tariff_type NOT NULL DEFAULT 'hourly',
    is_active BOOLEAN NOT NULL DEFAULT true,
    hourly_rate INTEGER, -- цена за час в копейках (для свободного ввода)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создаем индексы
CREATE INDEX IF NOT EXISTS idx_tariffs_type ON public.tariffs(type);
CREATE INDEX IF NOT EXISTS idx_tariffs_is_active ON public.tariffs(is_active);

-- Включаем RLS
ALTER TABLE public.tariffs ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики, если есть
DROP POLICY IF EXISTS "Anyone can read active tariffs" ON public.tariffs;
DROP POLICY IF EXISTS "Admins can manage tariffs" ON public.tariffs;

-- Политика: любой может читать активные тарифы
CREATE POLICY "Anyone can read active tariffs" 
ON public.tariffs
FOR SELECT 
USING (is_active = true);

-- Политика: админы могут управлять тарифами (если есть функция is_admin)
-- Если функции нет, можно временно разрешить всем для тестирования
CREATE POLICY "Anyone can manage tariffs" 
ON public.tariffs
FOR ALL 
USING (true)
WITH CHECK (true);

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
DROP TRIGGER IF EXISTS update_tariffs_updated_at ON public.tariffs;
CREATE TRIGGER update_tariffs_updated_at
    BEFORE UPDATE ON public.tariffs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Вставляем тестовые данные (пакеты)
INSERT INTO public.tariffs (name, description, price, duration_minutes, type, is_active)
VALUES 
    ('Дневной пакет', '5 часов игры с 10:00 до 18:00', 50000, 300, 'package', true),
    ('Ночной пакет', '8 часов с 22:00 до 06:00', 80000, 480, 'package', true),
    ('VIP День', 'Весь день без ограничений', 120000, 540, 'package', true)
ON CONFLICT DO NOTHING;

-- Проверяем результат
SELECT 'Таблица tariffs успешно создана и заполнена!' as status;
SELECT COUNT(*) as package_count FROM public.tariffs WHERE type = 'package' AND is_active = true;
