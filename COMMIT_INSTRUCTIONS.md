# Инструкции для коммита изменений

## Файлы, которые нужно закоммитить:

### Основные изменения:
- `src/pages/admin/Dashboard.tsx` - исправлены синтаксические ошибки
- `src/pages/LoginPage.tsx` - убрана подсветка, изменен цвет заголовка
- `src/pages/RegisterPage.tsx` - убрана подсветка, изменен цвет заголовка, выровнены чекбоксы
- `src/pages/ForgotPasswordPage.tsx` - убрана подсветка, изменен цвет заголовка
- `src/pages/TelegramApp.tsx` - исправлены ошибки, изменены цены, кнопки, расчет времени
- `src/components/tg/Header.tsx` - добавлен логотип, изменена кнопка "Выйти"
- `src/components/tg/CustomHoursInput.tsx` - изменен дизайн, компактность
- `src/components/tg/TariffCard.tsx` - изменен дизайн, убран кружок, изменен цвет "ПАКЕТ"
- `src/components/tg/ActivationCodeDisplay.tsx` - изменен размер иконки, кнопка, отступы
- `src/components/tg/PaymentPending.tsx` - изменена кнопка "Отменить"
- `src/components/ui/checkbox.tsx` - изменен дизайн чекбоксов
- `src/components/ErrorBoundary.tsx` - новый компонент для обработки ошибок
- `src/App.tsx` - добавлен ErrorBoundary, тестовый маршрут
- `src/main.tsx` - улучшена обработка ошибок
- `src/integrations/supabase/client.ts` - улучшена обработка ошибок
- `src/lib/formatters.ts` - улучшена валидация
- `src/index.css` - улучшена анимация наведения

### Новые файлы:
- `Frame_1-removebg-preview (1) 1.svg` - новый логотип
- `SECURITY_GIT.md` - документация по безопасности
- `COMMIT_INSTRUCTIONS.md` - этот файл

## Команды для коммита:

```bash
# 1. Проверьте статус (убедитесь, что .env.local НЕ в списке!)
git status

# 2. Добавьте все изменения
git add .

# 3. Проверьте еще раз, что .env.local не добавлен
git status

# 4. Если .env.local в списке - удалите его:
# git reset HEAD .env.local

# 5. Создайте коммит
git commit -m "Fix syntax errors, update UI design, improve security handling

- Fix JSX syntax errors in Dashboard, LoginPage, RegisterPage, ForgotPasswordPage, TelegramApp
- Update UI: remove neon highlights, change colors to #2222E9
- Add logo to header
- Improve checkbox design and alignment
- Update button styles with hover effects
- Fix tariff price display (NaN issues)
- Update VIP day price to 1000 rubles
- Improve time calculation (purchase time + tariff duration)
- Add ErrorBoundary for better error handling
- Update gamepad icon size to match card icon
- Improve spacing and layout"

# 6. Отправьте в репозиторий
git push
```

## ⚠️ ВАЖНО - Проверьте перед коммитом:

```bash
# Убедитесь, что .env.local НЕ будет закоммичен:
git status | Select-String ".env"

# Если увидите .env.local - НЕ коммитьте!
```
