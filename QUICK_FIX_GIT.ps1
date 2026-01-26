# Быстрое исправление Git репозитория
# Запустите этот скрипт в терминале VS Code (PowerShell)

Write-Host "=== Исправление Git репозитория ===" -ForegroundColor Cyan

# Переходим в папку проекта
Set-Location "c:\Users\admin\cyberunionbot"

Write-Host "`nТекущая папка: $(Get-Location)" -ForegroundColor Yellow

# Проверяем, есть ли .git в текущей папке
if (Test-Path ".git") {
    Write-Host "✓ .git найден в папке проекта" -ForegroundColor Green
    
    Write-Host "`nОчищаем индекс Git..." -ForegroundColor Yellow
    git rm -r --cached . 2>$null
    
    Write-Host "Добавляем файлы заново..." -ForegroundColor Yellow
    git add .
    
    Write-Host "`nПроверяем статус:" -ForegroundColor Yellow
    git status --short | Select-Object -First 20
    
    Write-Host "`n✓ Готово! Обновите панель Source Control в VS Code (Ctrl+Shift+G)" -ForegroundColor Green
} else {
    Write-Host "✗ .git НЕ найден в папке проекта" -ForegroundColor Red
    Write-Host "`nИнициализируем новый репозиторий..." -ForegroundColor Yellow
    git init
    git add .
    Write-Host "✓ Репозиторий создан! Обновите панель Source Control в VS Code" -ForegroundColor Green
}

Write-Host "`nНажмите любую клавишу для выхода..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
