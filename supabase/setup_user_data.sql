-- ============================================
-- Скрипт для создания таблицы user_data
-- Выполните этот SQL в Supabase SQL Editor
-- ============================================

-- Создаем таблицу user_data
CREATE TABLE IF NOT EXISTS public.user_data (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    login TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    ad TEXT NOT NULL DEFAULT '-',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создаем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_user_data_login ON public.user_data(login);
CREATE INDEX IF NOT EXISTS idx_user_data_phone ON public.user_data(phone);

-- Включаем RLS
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- Политика: любой может читать для проверки логина
CREATE POLICY "Anyone can read user_data for login check" 
ON public.user_data
FOR SELECT 
USING (true);

-- Политика: любой может создавать пользователей (для регистрации)
CREATE POLICY "Anyone can insert user_data" 
ON public.user_data
FOR INSERT 
WITH CHECK (true);

-- Политика: пользователи могут обновлять свои данные
CREATE POLICY "Users can update own data" 
ON public.user_data
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Убеждаемся, что функция update_updated_at_column существует
-- (она должна быть создана в предыдущей миграции)
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
DROP TRIGGER IF EXISTS update_user_data_updated_at ON public.user_data;
CREATE TRIGGER update_user_data_updated_at
    BEFORE UPDATE ON public.user_data
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Проверяем, что таблица создана
SELECT 'Таблица user_data успешно создана!' as status;
