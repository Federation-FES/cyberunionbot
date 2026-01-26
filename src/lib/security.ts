/**
 * Утилиты безопасности для защиты паролей и персональных данных
 * 
 * ВАЖНО: Для production рекомендуется использовать Edge Functions в Supabase
 * для хеширования паролей на сервере. Клиентское хеширование - это дополнительный
 * слой защиты, но не должен быть единственным.
 */

/**
 * Хеширование пароля с использованием Web Crypto API (PBKDF2)
 * Это безопасный способ хеширования паролей на клиенте
 */
export async function hashPassword(password: string): Promise<string> {
  // Конвертируем пароль в ArrayBuffer
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  // Генерируем случайную соль для каждого пароля
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Используем PBKDF2 для хеширования (100,000 итераций - безопасное значение)
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    data,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256 // 256 бит = 32 байта
  );
  
  // Конвертируем хеш и соль в base64 для хранения
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const saltArray = Array.from(salt);
  
  // Формат: salt:hash (оба в base64)
  const saltBase64 = btoa(String.fromCharCode(...saltArray));
  const hashBase64 = btoa(String.fromCharCode(...hashArray));
  
  return `${saltBase64}:${hashBase64}`;
}

/**
 * Проверка пароля против хеша
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    const [saltBase64, hashBase64] = hashedPassword.split(':');
    
    if (!saltBase64 || !hashBase64) {
      return false;
    }
    
    // Декодируем соль и хеш
    const salt = Uint8Array.from(
      atob(saltBase64),
      c => c.charCodeAt(0)
    );
    const expectedHash = Uint8Array.from(
      atob(hashBase64),
      c => c.charCodeAt(0)
    );
    
    // Хешируем введенный пароль с той же солью
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      data,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );
    
    const hashArray = new Uint8Array(hashBuffer);
    
    // Сравниваем хеши (постоянное время для защиты от timing attacks)
    if (hashArray.length !== expectedHash.length) {
      return false;
    }
    
    let isEqual = true;
    for (let i = 0; i < hashArray.length; i++) {
      if (hashArray[i] !== expectedHash[i]) {
        isEqual = false;
      }
    }
    
    return isEqual;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Шифрование персональных данных (AES-GCM)
 * Использует ключ из переменной окружения или генерирует его
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  // В production используйте ключ из переменных окружения Supabase
  // Для демонстрации используем фиксированный ключ (в реальности - из env)
  const keyString = import.meta.env.VITE_ENCRYPTION_KEY || 'default-encryption-key-change-in-production-32-chars!!';
  
  // Создаем ключ из строки используя PBKDF2
  const encoder = new TextEncoder();
  const keyData = encoder.encode(keyString);
  const salt = encoder.encode('cyberunion-salt'); // В production используйте уникальную соль
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Шифрование текстовых данных
 */
export async function encryptData(data: string): Promise<string> {
  try {
    const key = await getEncryptionKey();
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    // Генерируем случайный IV (initialization vector) для каждого шифрования
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      dataBuffer
    );
    
    // Формат: iv:encrypted_data (оба в base64)
    const ivBase64 = btoa(String.fromCharCode(...iv));
    const encryptedBase64 = btoa(
      String.fromCharCode(...new Uint8Array(encryptedBuffer))
    );
    
    return `${ivBase64}:${encryptedBase64}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Ошибка шифрования данных');
  }
}

/**
 * Расшифровка данных
 */
export async function decryptData(encryptedData: string): Promise<string> {
  try {
    const [ivBase64, encryptedBase64] = encryptedData.split(':');
    
    if (!ivBase64 || !encryptedBase64) {
      throw new Error('Неверный формат зашифрованных данных');
    }
    
    const key = await getEncryptionKey();
    const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
    const encrypted = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Ошибка расшифровки данных');
  }
}

/**
 * Генерация безопасного токена для сессий
 */
export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Создание JWT-подобного токена (упрощенная версия)
 * В production используйте библиотеку jsonwebtoken или jose
 */
export function createSessionToken(payload: {
  userId: string;
  login: string;
  expiresIn?: number; // в секундах, по умолчанию 7 дней
}): string {
  const expiresIn = payload.expiresIn || 7 * 24 * 60 * 60; // 7 дней
  const expiresAt = Date.now() + expiresIn * 1000;
  
  const tokenData = {
    userId: payload.userId,
    login: payload.login,
    exp: expiresAt,
    iat: Date.now(),
  };
  
  // В production используйте подпись токена
  // Для простоты используем base64 (в реальности нужна подпись!)
  const tokenString = JSON.stringify(tokenData);
  const token = btoa(tokenString);
  
  return token;
}

/**
 * Проверка и декодирование токена сессии
 */
export function verifySessionToken(token: string): {
  userId: string;
  login: string;
  expired: boolean;
} | null {
  try {
    const tokenString = atob(token);
    const tokenData = JSON.parse(tokenString);
    
    // Проверяем срок действия
    if (Date.now() > tokenData.exp) {
      return { ...tokenData, expired: true };
    }
    
    return {
      userId: tokenData.userId,
      login: tokenData.login,
      expired: false,
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Создание подписи для платежных запросов (HMAC)
 */
export async function createPaymentSignature(
  data: {
    userId: string;
    amount: number;
    tariffId: string | null;
    timestamp: number;
  }
): Promise<string> {
  const secret = import.meta.env.VITE_PAYMENT_SECRET || 'default-payment-secret-change-in-production';
  const message = `${data.userId}:${data.amount}:${data.tariffId || 'custom'}:${data.timestamp}`;
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const signatureArray = Array.from(new Uint8Array(signature));
  return btoa(String.fromCharCode(...signatureArray));
}

/**
 * Проверка подписи платежного запроса
 */
export async function verifyPaymentSignature(
  data: {
    userId: string;
    amount: number;
    tariffId: string | null;
    timestamp: number;
  },
  signature: string
): Promise<boolean> {
  try {
    const expectedSignature = await createPaymentSignature(data);
    return expectedSignature === signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Валидация платежных данных
 */
export function validatePaymentData(data: {
  amount: number;
  tariffId?: string | null;
  customHours?: number | null;
}): { valid: boolean; error?: string } {
  // Проверка суммы
  if (!data.amount || data.amount <= 0) {
    return { valid: false, error: 'Неверная сумма платежа' };
  }
  
  // Проверка максимальной суммы (защита от переполнения)
  if (data.amount > 10000000) { // 100,000 рублей в копейках
    return { valid: false, error: 'Сумма платежа слишком большая' };
  }
  
  // Проверка кастомных часов
  if (data.customHours !== undefined && data.customHours !== null) {
    if (data.customHours <= 0 || data.customHours > 24) {
      return { valid: false, error: 'Неверное количество часов' };
    }
  }
  
  return { valid: true };
}
