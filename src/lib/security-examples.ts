/**
 * Примеры использования утилит безопасности
 * 
 * Этот файл содержит примеры кода для демонстрации использования
 * функций безопасности. Не импортируйте этот файл в production код.
 */

import {
  hashPassword,
  verifyPassword,
  encryptData,
  decryptData,
  createSessionToken,
  verifySessionToken,
  createPaymentSignature,
  verifyPaymentSignature,
  validatePaymentData,
} from './security';

// ============================================
// Пример 1: Регистрация пользователя
// ============================================
export async function exampleRegistration() {
  const password = 'MySecurePassword123';
  const name = 'Иван Иванов';
  const phone = '+7 (999) 123-45-67';

  // Хешируем пароль
  const hashedPassword = await hashPassword(password);
  console.log('Hashed password:', hashedPassword);
  // Вывод: "salt:hash" (оба в base64)

  // Шифруем персональные данные
  const encryptedName = await encryptData(name);
  const encryptedPhone = await encryptData(phone);
  console.log('Encrypted name:', encryptedName);
  console.log('Encrypted phone:', encryptedPhone);

  // Сохраняем в базу данных
  // await supabase.from('user_data').insert({
  //   login: 'user123',
  //   password: hashedPassword,
  //   name: encryptedName,
  //   phone: encryptedPhone,
  // });
}

// ============================================
// Пример 2: Авторизация пользователя
// ============================================
export async function exampleLogin() {
  const login = 'user123';
  const password = 'MySecurePassword123';

  // Получаем пользователя из БД
  // const { data: user } = await supabase
  //   .from('user_data')
  //   .select('*')
  //   .eq('login', login)
  //   .single();

  // Проверяем пароль
  // const isValid = await verifyPassword(password, user.password);
  // if (!isValid) {
  //   throw new Error('Неверный пароль');
  // }

  // Расшифровываем данные
  // const decryptedName = await decryptData(user.name);
  // const decryptedPhone = await decryptData(user.phone);

  // Создаем токен сессии
  // const sessionToken = createSessionToken({
  //   userId: user.id,
  //   login: user.login,
  // });

  // Сохраняем сессию
  // localStorage.setItem('user_session', JSON.stringify({
  //   token: sessionToken,
  //   id: user.id,
  //   name: decryptedName,
  //   login: user.login,
  //   phone: decryptedPhone,
  // }));
}

// ============================================
// Пример 3: Проверка сессии
// ============================================
export function exampleSessionVerification() {
  // Получаем токен из localStorage
  // const session = JSON.parse(localStorage.getItem('user_session') || '{}');
  // const token = session.token;

  // Проверяем токен
  // const verified = verifySessionToken(token);
  // if (!verified || verified.expired) {
  //   // Токен истек или невалиден
  //   localStorage.removeItem('user_session');
  //   // Перенаправляем на страницу входа
  // } else {
  //   // Токен валиден, используем данные сессии
  //   console.log('User ID:', verified.userId);
  //   console.log('Login:', verified.login);
  // }
}

// ============================================
// Пример 4: Создание защищенного платежа
// ============================================
export async function exampleSecurePayment() {
  const userId = 'user-123';
  const amount = 12000; // 120 рублей в копейках
  const tariffId = 'tariff-456';
  const timestamp = Date.now();

  // Валидация данных
  const validation = validatePaymentData({
    amount,
    tariffId,
  });

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Создаем подпись
  const signature = await createPaymentSignature({
    userId,
    amount,
    tariffId,
    timestamp,
  });

  // Отправляем запрос с подписью
  // const response = await supabase.functions.invoke('create-payment', {
  //   body: {
  //     userId,
  //     amount,
  //     tariffId,
  //     timestamp,
  //     signature, // Подпись для проверки на сервере
  //   },
  // });
}

// ============================================
// Пример 5: Проверка подписи платежа (на сервере)
// ============================================
export async function exampleVerifyPaymentSignature() {
  const requestData = {
    userId: 'user-123',
    amount: 12000,
    tariffId: 'tariff-456',
    timestamp: 1234567890,
  };
  const receivedSignature = 'signature-from-client';

  // Проверяем подпись
  const isValid = await verifyPaymentSignature(
    requestData,
    receivedSignature
  );

  if (!isValid) {
    throw new Error('Неверная подпись платежа');
  }

  // Продолжаем обработку платежа
}

// ============================================
// Пример 6: Миграция старых паролей
// ============================================
export async function examplePasswordMigration() {
  // При входе пользователя со старым паролем (в открытом виде)
  // const { data: user } = await supabase
  //   .from('user_data')
  //   .select('*')
  //   .eq('login', login)
  //   .single();

  // Проверяем формат пароля
  // if (!user.password.includes(':')) {
  //   // Старый формат (открытый пароль)
  //   if (user.password === password) {
  //     // Пароль верный, хешируем и обновляем
  //     const hashedPassword = await hashPassword(password);
  //     await supabase
  //       .from('user_data')
  //       .update({ password: hashedPassword })
  //       .eq('id', user.id);
  //   }
  // } else {
  //   // Новый формат (хеш)
  //   const isValid = await verifyPassword(password, user.password);
  //   if (!isValid) {
  //     throw new Error('Неверный пароль');
  //   }
  // }
}
