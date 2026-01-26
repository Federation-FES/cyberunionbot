# Инструкция по настройке переменных окружения

## Локальная разработка

1. Скопируйте файл `.env.example` в `.env`:
   ```bash
   cp .env.example .env
   ```

2. Откройте `.env` и заполните значениями из вашего Supabase проекта:
   - Откройте [Supabase Dashboard](https://supabase.com/dashboard)
   - Выберите ваш проект
   - Перейдите в **Settings → API**
   - Скопируйте:
     - **Project URL** → `VITE_SUPABASE_URL`
     - **anon public key** → `VITE_SUPABASE_PUBLISHABLE_KEY`
     - **Project ID** (из URL) → `VITE_SUPABASE_PROJECT_ID`

3. Пример заполненного `.env`:
   ```
   VITE_SUPABASE_PROJECT_ID="eohgbmlqihxklmlwtmrm"
   VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   VITE_SUPABASE_URL="https://eohgbmlqihxklmlwtmrm.supabase.co"
   ```

## Деплой на Vercel

1. Перейдите на [Vercel Dashboard](https://vercel.com/dashboard)
2. Импортируйте ваш GitHub репозиторий
3. В настройках проекта перейдите в **Settings → Environment Variables**
4. Добавьте переменные:
   - `VITE_SUPABASE_PROJECT_ID` = `eohgbmlqihxklmlwtmrm`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = ваш anon key
   - `VITE_SUPABASE_URL` = `https://eohgbmlqihxklmlwtmrm.supabase.co`
5. Нажмите **Save** и пересоберите проект

## Деплой на Netlify

1. Перейдите на [Netlify Dashboard](https://app.netlify.com)
2. Импортируйте ваш GitHub репозиторий
3. В настройках проекта перейдите в **Site configuration → Environment variables**
4. Добавьте переменные (как в Vercel)
5. Сохраните и пересоберите проект

## Деплой на другие платформы

### Railway
1. Settings → Variables → Add Variable
2. Добавьте все три переменные

### Render
1. Environment → Add Environment Variable
2. Добавьте все три переменные

### Cloudflare Pages
1. Settings → Environment Variables
2. Добавьте все три переменные для Production

## Важно!

⚠️ **НИКОГДА не коммитьте файл `.env` в Git!**
- Файл `.env` уже в `.gitignore`
- Используйте `.env.example` как шаблон
- На продакшене используйте переменные окружения платформы

## Проверка

После настройки переменных проверьте, что они доступны:
1. Пересоберите проект: `npm run build`
2. Запустите: `npm run preview`
3. Откройте консоль браузера (F12) и проверьте, нет ли ошибок подключения к Supabase
