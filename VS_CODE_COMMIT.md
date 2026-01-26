# 📝 Коммит через VS Code - Быстрая инструкция

## Шаги:

1. **Откройте Source Control** (Ctrl+Shift+G или иконка Git слева)

2. **Проверьте список изменений** - убедитесь, что `.env.local` НЕТ в списке!

3. **Если видите `.env.local`:**
   - Правый клик → "Discard Changes"
   - Или удалите его из списка

4. **Добавьте файлы:**
   - Нажмите "+" рядом с файлами
   - Или "Stage All Changes" (добавить все)

5. **Введите сообщение коммита:**
   ```
   Fix syntax errors and update UI design
   
   - Fix JSX syntax errors in multiple pages
   - Update UI: remove neon highlights, change colors to #2222E9
   - Add logo to header
   - Improve checkbox design and alignment
   - Update button styles with hover effects
   - Fix tariff price display issues
   - Update VIP day price to 1000 rubles
   - Improve time calculation (purchase time + duration)
   - Add ErrorBoundary component
   - Update gamepad icon size
   - Improve spacing and layout
   ```

6. **Нажмите Commit** (галочка ✓ или Ctrl+Enter)

7. **Отправьте в репозиторий:**
   - Нажмите "..." (три точки) в панели Source Control
   - Выберите "Push"
   - Или используйте иконку синхронизации (↻)

## ⚠️ ВАЖНО:

Перед коммитом обязательно проверьте, что `.env.local` НЕ в списке изменений!
<!--  -->