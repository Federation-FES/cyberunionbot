# 🔧 Исправление конфликта при merge

## Проблема:
```
error: Your local changes to the following files would be overwritten by merge:
  FIX_GIT_FINAL.ps1 SETUP_GIT_DIRECT.ps1
```

## Решение:

### Шаг 1: Закоммитьте локальные изменения

Выполните в терминале:

```powershell
git add FIX_GIT_FINAL.ps1 SETUP_GIT_DIRECT.ps1
git commit -m "Add Git setup scripts"
```

### Шаг 2: Повторите pull

```powershell
git pull origin main --allow-unrelated-histories
```

### Шаг 3: Если все прошло успешно, отправьте изменения

```powershell
git push -u origin main
```

---

## Альтернатива: Использовать stash (если не хотите коммитить сейчас)

Если хотите временно сохранить изменения:

```powershell
# Сохранить изменения
git stash

# Сделать pull
git pull origin main --allow-unrelated-histories

# Вернуть изменения
git stash pop
```

Но лучше просто закоммитить - эти файлы нужны в репозитории.
