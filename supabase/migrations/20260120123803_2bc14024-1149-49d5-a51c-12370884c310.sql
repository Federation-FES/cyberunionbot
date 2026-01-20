-- Enum для типов тарифов
CREATE TYPE public.tariff_type AS ENUM ('hourly', 'package');

-- Enum для статусов платежей
CREATE TYPE public.payment_status AS ENUM ('pending', 'succeeded', 'failed', 'cancelled');

-- Enum для статусов компьютеров
CREATE TYPE public.computer_status AS ENUM ('available', 'occupied', 'maintenance');

-- Enum для ролей
CREATE TYPE public.app_role AS ENUM ('admin', 'service_account');

-- Таблица ролей пользователей
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Таблица тарифов
CREATE TABLE public.tariffs (
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

-- Таблица компьютеров
CREATE TABLE public.computers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status computer_status NOT NULL DEFAULT 'available',
    ip_address TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Таблица платежей
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_user_id TEXT NOT NULL,
    tariff_id UUID REFERENCES public.tariffs(id),
    custom_hours INTEGER, -- для свободного ввода часов
    amount INTEGER NOT NULL, -- в копейках
    status payment_status NOT NULL DEFAULT 'pending',
    payment_method TEXT DEFAULT 'sbp',
    external_payment_id TEXT, -- ID платежа в ЮKassa
    confirmation_url TEXT, -- ссылка на оплату
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Таблица кодов активации
CREATE TABLE public.activation_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE NOT NULL,
    duration_minutes INTEGER NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Таблица сессий
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activation_code_id UUID REFERENCES public.activation_codes(id) ON DELETE CASCADE NOT NULL,
    computer_id UUID REFERENCES public.computers(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включаем RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.computers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Функция проверки роли
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Функция проверки админа
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Функция проверки сервисного аккаунта
CREATE OR REPLACE FUNCTION public.is_service_account()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'service_account')
$$;

-- RLS политики для user_roles
CREATE POLICY "Admins can manage roles" ON public.user_roles
FOR ALL USING (public.is_admin());

-- RLS политики для tariffs (публичное чтение)
CREATE POLICY "Anyone can read active tariffs" ON public.tariffs
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage tariffs" ON public.tariffs
FOR ALL USING (public.is_admin());

-- RLS политики для computers
CREATE POLICY "Admins and service accounts can read computers" ON public.computers
FOR SELECT USING (public.is_admin() OR public.is_service_account());

CREATE POLICY "Admins can manage computers" ON public.computers
FOR ALL USING (public.is_admin());

-- RLS политики для payments
CREATE POLICY "Admins can manage payments" ON public.payments
FOR ALL USING (public.is_admin());

CREATE POLICY "Service accounts can read payments" ON public.payments
FOR SELECT USING (public.is_service_account());

-- RLS политики для activation_codes
CREATE POLICY "Admins can manage activation codes" ON public.activation_codes
FOR ALL USING (public.is_admin());

CREATE POLICY "Service accounts can read activation codes" ON public.activation_codes
FOR SELECT USING (public.is_service_account());

-- RLS политики для sessions
CREATE POLICY "Admins can manage sessions" ON public.sessions
FOR ALL USING (public.is_admin());

CREATE POLICY "Service accounts can manage sessions" ON public.sessions
FOR ALL USING (public.is_service_account());

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_tariffs_updated_at
    BEFORE UPDATE ON public.tariffs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_computers_updated_at
    BEFORE UPDATE ON public.computers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Функция генерации кода активации
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

-- Индексы для производительности
CREATE INDEX idx_payments_telegram_user_id ON public.payments(telegram_user_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_activation_codes_code ON public.activation_codes(code);
CREATE INDEX idx_activation_codes_payment_id ON public.activation_codes(payment_id);
CREATE INDEX idx_sessions_computer_id ON public.sessions(computer_id);
CREATE INDEX idx_sessions_activation_code_id ON public.sessions(activation_code_id);