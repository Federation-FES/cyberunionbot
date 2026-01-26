# Настройка Git пользователя напрямую
# Запустите этот скрипт в терминале VS Code

Write-Host "=== Настройка Git пользователя ===" -ForegroundColor Cyan

# Переходим в папку проекта
Set-Location "c:\Users\admin\cyberunionbot"

# Настраиваем имя и email (используем значения из settings.json)
Write-Host "`nНастраиваем Git пользователя..." -ForegroundColor Yellow

# Используем значения, которые вы добавили в settings.json
git config --global user.name "George"
git config --global user.email "delovoygeorgy64@mail.ru"

Write-Host "`nПроверяем настройки:" -ForegroundColor Yellow
Write-Host "Имя: " -NoNewline
git config --global user.name
Write-Host "Email: " -NoNewline
git config --global user.email

Write-Host "`n✓ Готово! Теперь попробуйте снова сделать коммит." -ForegroundColor Green
