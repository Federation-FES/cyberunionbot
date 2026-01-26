-- Добавляем столбец name в таблицу user_data, если его еще нет
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_data' 
        AND column_name = 'name'
    ) THEN
        ALTER TABLE public.user_data 
        ADD COLUMN name TEXT;
        
        -- Обновляем существующие записи (если есть)
        UPDATE public.user_data 
        SET name = 'Пользователь' 
        WHERE name IS NULL;
        
        -- Делаем поле обязательным
        ALTER TABLE public.user_data 
        ALTER COLUMN name SET NOT NULL;
    END IF;
END $$;
