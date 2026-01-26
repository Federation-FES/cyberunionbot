# Установка Node.js для запуска проекта

## Проблема
Команда `npm` не найдена, потому что Node.js не установлен или не добавлен в PATH.

## Решение: Установка Node.js

### Вариант 1: Официальная установка (Рекомендуется)

1. **Скачайте Node.js:**
   - Перейдите на https://nodejs.org/
   - Скачайте LTS версию (рекомендуется)
   - Выберите Windows Installer (.msi) для вашей системы (64-bit или 32-bit)

2. **Установите Node.js:**
   - Запустите скачанный установщик
   - Следуйте инструкциям установщика
   - **ВАЖНО**: Убедитесь, что отмечена опция "Add to PATH" (добавить в PATH)
   - Завершите установку

3. **Перезапустите терминал:**
   - Закройте все окна PowerShell/терминала
   - Откройте новый терминал
   - Проверьте установку:
     ```powershell
     node --version
     npm --version
     ```

4. **Запустите проект:**
   ```powershell
   cd c:\Users\admin\cyberunionbot
   npm run dev
   ```

### Вариант 2: Через Chocolatey (если установлен)

Если у вас установлен Chocolatey:
```powershell
choco install nodejs-lts
```

### Вариант 3: Через winget (Windows 10/11)

```powershell
winget install OpenJS.NodeJS.LTS
```

## Проверка установки

После установки выполните в новом терминале:

```powershell
node --version
npm --version
```

Должны отобразиться версии, например:
```
v20.11.0
10.2.4
```

## Если Node.js уже установлен, но не работает

### Проверка установки

1. Проверьте, установлен ли Node.js:
   - Откройте Проводник
   - Перейдите в `C:\Program Files\nodejs\`
   - Если папка существует, Node.js установлен

2. Добавьте в PATH вручную:
   - Нажмите `Win + R`
   - Введите `sysdm.cpl` и нажмите Enter
   - Перейдите на вкладку "Дополнительно"
   - Нажмите "Переменные среды"
   - В "Системные переменные" найдите `Path`
   - Нажмите "Изменить"
   - Добавьте: `C:\Program Files\nodejs\`
   - Нажмите OK везде
   - **Перезапустите терминал**

### Альтернатива: Использование полного пути

Если Node.js установлен, но не в PATH, можно использовать полный путь:

```powershell
& "C:\Program Files\nodejs\npm.cmd" run dev
```

Или для node:
```powershell
& "C:\Program Files\nodejs\node.exe" --version
```

## После установки Node.js

1. **Установите зависимости проекта** (если еще не установлены):
   ```powershell
   cd c:\Users\admin\cyberunionbot
   npm install
   ```

2. **Запустите dev-сервер:**
   ```powershell
   npm run dev
   ```

3. **Откройте браузер:**
   - Перейдите на `http://localhost:8080`
   - Или `https://localhost:8080` (для Web Crypto API)

## Быстрая проверка

Выполните эту команду для проверки всех компонентов:

```powershell
Write-Host "Node.js:" -NoNewline; node --version 2>$null || Write-Host " НЕ УСТАНОВЛЕН"
Write-Host "npm:" -NoNewline; npm --version 2>$null || Write-Host " НЕ УСТАНОВЛЕН"
Write-Host "Проект:" -NoNewline; Test-Path "c:\Users\admin\cyberunionbot\package.json" && Write-Host " Найден" || Write-Host " НЕ НАЙДЕН"
```

## Проблемы и решения

### Проблема: "npm не является внутренней или внешней командой"
**Решение**: Node.js не установлен или не в PATH. Следуйте инструкциям выше.

### Проблема: "EACCES: permission denied"
**Решение**: Запустите терминал от имени администратора или используйте другой способ установки пакетов.

### Проблема: Старая версия Node.js
**Решение**: Обновите Node.js до последней LTS версии с официального сайта.

## Дополнительная информация

- Официальный сайт: https://nodejs.org/
- Документация: https://nodejs.org/docs/
- Версии: Рекомендуется использовать LTS (Long Term Support) версию

---

**После установки Node.js вернитесь к проекту и выполните `npm run dev`**
