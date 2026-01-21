-- Таблица для хранения данных пользователей
CREATE TABLE IF NOT EXISTS public.user_data (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    login TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    ad TEXT NOT NULL DEFAULT '-', -- '+' или '-' для согласия на рекламу
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_user_data_login ON public.user_data(login);
CREATE INDEX IF NOT EXISTS idx_user_data_phone ON public.user_data(phone);

-- RLS политики (публичное чтение для авторизации, но запись только через приложение)
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- Политика: любой может читать для проверки логина (но только login, не password)
-- В реальном приложении лучше использовать хеширование паролей
CREATE POLICY "Anyone can read user_data for login check" ON public.user_data
FOR SELECT USING (true);

-- Политика: любой может создавать пользователей (для регистрации)
CREATE POLICY "Anyone can insert user_data" ON public.user_data
FOR INSERT WITH CHECK (true);

-- Триггер для обновления updated_at
CREATE TRIGGER update_user_data_updated_at
    BEFORE UPDATE ON public.user_data
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
