    # Финальное исправление Git настроек
# Запустите этот скрипт в терминале VS Code

Write-Host "=== Финальная настройка Git ===" -ForegroundColor Cyan

# Переходим в папку проекта
Set-Location "c:\Users\admin\cyberunionbot"

Write-Host "`n1. Настраиваем глобально..." -ForegroundColor Yellow
git config --global user.name "George"
git config --global user.email "delovoygeorgy64@mail.ru"

Write-Host "`n2. Настраиваем локально для репозитория..." -ForegroundColor Yellow
git config user.name "George"
git config user.email "delovoygeorgy64@mail.ru"

Write-Host "`n3. Проверяем настройки:" -ForegroundColor Yellow
Write-Host "Глобальное имя: " -NoNewline
git config --global user.name
Write-Host "Глобальный email: " -NoNewline
git config --global user.email
Write-Host "Локальное имя: " -NoNewline
git config user.name
Write-Host "Локальный email: " -NoNewline
git config user.email

Write-Host "`n✓ Настройки применены!" -ForegroundColor Green
Write-Host "`n⚠️ ВАЖНО: Перезагрузите VS Code (Ctrl+R или File → Reload Window)" -ForegroundColor Yellow
Write-Host "После перезагрузки попробуйте снова сделать коммит." -ForegroundColor Yellow
