# Список файлов для коммита

## ✅ Все измененные файлы (безопасно коммитить):

### Основной код:
1. `src/pages/admin/Dashboard.tsx` - исправлены синтаксические ошибки
2. `src/pages/LoginPage.tsx` - UI изменения, цвет заголовка
3. `src/pages/RegisterPage.tsx` - UI изменения, выравнивание чекбоксов
4. `src/pages/ForgotPasswordPage.tsx` - UI изменения
5. `src/pages/TelegramApp.tsx` - исправления, изменения цен, расчет времени
6. `src/components/tg/Header.tsx` - добавлен логотип, изменения кнопки
7. `src/components/tg/CustomHoursInput.tsx` - изменения дизайна
8. `src/components/tg/TariffCard.tsx` - изменения дизайна
9. `src/components/tg/ActivationCodeDisplay.tsx` - изменения дизайна
10. `src/components/tg/PaymentPending.tsx` - изменения кнопки
11. `src/components/ui/checkbox.tsx` - новый дизайн чекбоксов
12. `src/components/ErrorBoundary.tsx` - новый компонент
13. `src/App.tsx` - добавлен ErrorBoundary
14. `src/main.tsx` - улучшена обработка ошибок
15. `src/integrations/supabase/client.ts` - улучшена обработка ошибок
16. `src/lib/formatters.ts` - улучшена валидация
17. `src/index.css` - улучшена анимация

### Новые файлы:
18. `Frame_1-removebg-preview (1) 1.svg` - новый логотип
19. `SECURITY_GIT.md` - документация
20. `COMMIT_INSTRUCTIONS.md` - инструкции
21. `FILES_TO_COMMIT.md` - этот файл

## ❌ НЕ коммитить:
- `.env.local` - содержит секретные ключи (уже в .gitignore)

## Команды для выполнения:

```bash
# 1. Инициализируйте git (если еще не сделано)
git init

# 2. Добавьте удаленный репозиторий (если есть)
# git remote add origin <URL_ВАШЕГО_РЕПОЗИТОРИЯ>

# 3. Проверьте статус
git status

# 4. Убедитесь, что .env.local НЕ в списке!
# Если видите .env.local - выполните:
# git reset HEAD .env.local

# 5. Добавьте все файлы
git add .

# 6. Проверьте еще раз
git status

# 7. Создайте коммит
git commit -m "Fix syntax errors and update UI design

- Fix JSX syntax errors in multiple pages
- Update UI: remove neon highlights, change colors to #2222E9
- Add logo to header (Frame_1-removebg-preview)
- Improve checkbox design and alignment
- Update button styles with hover effects
- Fix tariff price display issues
- Update VIP day price to 1000 rubles
- Improve time calculation (purchase time + duration)
- Add ErrorBoundary component
- Update gamepad icon size
- Improve spacing and layout"

# 8. Отправьте в репозиторий
git push origin main
# или
git push origin master
```

## ⚠️ КРИТИЧЕСКИ ВАЖНО:

Перед `git add .` обязательно проверьте:
```bash
git status
```

Если увидите `.env.local` в списке - НЕ добавляйте его! Выполните:
```bash
git reset HEAD .env.local
```
