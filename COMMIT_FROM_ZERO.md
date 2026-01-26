# 🚀 Коммит с нуля - Пошаговая инструкция

## Шаг 1: Откройте Source Control
- Нажмите `Ctrl + Shift + G`
- Или кликните на иконку Git слева

## Шаг 2: Добавьте ВСЕ файлы
- Нажмите кнопку **"Stage All Changes"** (или "+" рядом с "Changes")
- Или правый клик на "Changes" → "Stage All Changes"

**Проверьте:** Должны появиться все файлы проекта (не только скрипты!)

## Шаг 3: Проверьте, что `.env.local` НЕТ в списке
- Прокрутите список файлов
- Убедитесь, что `.env.local` отсутствует
- Если он есть - удалите его из списка (правый клик → Discard Changes)

## Шаг 4: Введите сообщение коммита
В поле "Message" введите:
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

## Шаг 5: Нажмите Commit
- Нажмите кнопку **"Commit"** (галочка ✓)
- Или `Ctrl + Enter`

## Шаг 6: Готово! ✅
Коммит создан! Если нужно отправить в удаленный репозиторий:
- Нажмите "..." (три точки) → "Push"
- Или сначала добавьте remote: `git remote add origin <URL>`

---

## ⚠️ Если что-то не работает:

### Если не видно всех файлов:
1. Откройте терминал VS Code (`Ctrl + ~`)
2. Выполните:
   ```powershell
   cd c:\Users\admin\cyberunionbot
   git add .
   git status
   ```
3. Обновите панель Source Control

### Если ошибка "Author identity unknown":
1. Выполните в терминале:
   ```powershell
   git config --global user.name "George"
   git config --global user.email "delovoygeorgy64@mail.ru"
   ```
2. Перезагрузите VS Code (`Ctrl + Shift + P` → `Developer: Reload Window`)
