import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/tg/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { verifyPassword, decryptData, createSessionToken } from '@/lib/security';

export default function LoginPage() {
 const [login, setLogin] = useState('');
 const [password, setPassword] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const navigate = useNavigate();
 const { toast } = useToast();

 const handleLogin = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsLoading(true);

    try {
      // Check if user exists in USER_DATA (получаем только по логину)
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('login', login)
        .maybeSingle();

      if (error) {
        console.error('Login error:', error);
        throw new Error(error.message || `Ошибка базы данных: ${error.code || 'unknown'}`);
      }

      if (!data) {
        toast({
          title: 'Ошибка входа',
          description: 'Неверный логин или пароль',
          variant: 'destructive',
        });
        return;
      }

      // Проверяем пароль
      // Поддержка старых паролей (в открытом виде) и новых (хешированных)
      let isPasswordValid = false;
      
      if (data.password.includes(':')) {
        // Новый формат - хешированный пароль
        isPasswordValid = await verifyPassword(password, data.password);
      } else {
        // Старый формат - открытый пароль (для обратной совместимости)
        isPasswordValid = data.password === password;
        
        // Если пароль верный, перехешируем его для безопасности
        if (isPasswordValid) {
          try {
            const { hashPassword } = await import('@/lib/security');
            const hashedPassword = await hashPassword(password);
            
            // Обновляем пароль в БД (в фоне, не блокируем вход)
            supabase
              .from('user_data')
              .update({ password: hashedPassword })
              .eq('id', data.id)
              .then(() => {
                console.log('Password migrated to hashed format');
              })
              .catch((err) => {
                console.error('Failed to migrate password:', err);
              });
          } catch (migrationError) {
            console.error('Password migration error:', migrationError);
            // Продолжаем работу даже если миграция не удалась
          }
        }
      }
      
      if (!isPasswordValid) {
        toast({
          title: 'Ошибка входа',
          description: 'Неверный логин или пароль',
          variant: 'destructive',
        });
        return;
      }

      // Расшифровываем персональные данные
      // Поддержка старых (незашифрованных) и новых (зашифрованных) данных
      let decryptedName = data.name;
      let decryptedPhone = data.phone;
      
      // Проверяем, зашифрованы ли данные (формат: iv:encrypted)
      const isEncrypted = (value: string) => value.includes(':') && value.split(':').length === 2;
      
      if (isEncrypted(data.name)) {
        try {
          decryptedName = await decryptData(data.name);
        } catch (decryptError) {
          console.warn('Failed to decrypt name, using as-is:', decryptError);
          // Используем как есть, если расшифровка не удалась
        }
      }
      
      if (isEncrypted(data.phone)) {
        try {
          decryptedPhone = await decryptData(data.phone);
        } catch (decryptError) {
          console.warn('Failed to decrypt phone, using as-is:', decryptError);
          // Используем как есть, если расшифровка не удалась
        }
      }
      
      // Если данные не были зашифрованы, шифруем их при следующем обновлении профиля
      // (опционально, можно добавить миграцию здесь)

      // Создаем безопасный токен сессии
      const sessionToken = createSessionToken({
        userId: data.id,
        login: data.login,
      });

      // Store user session с токеном
      localStorage.setItem('user_session', JSON.stringify({
        token: sessionToken,
        id: data.id,
        name: decryptedName,
        login: data.login,
        phone: decryptedPhone,
      }));

 toast({
 title: 'Добро пожаловать!',
 description: 'Вы успешно вошли в систему',
 });
 
 navigate('/');
 } catch (error) {
 toast({
 title: 'Ошибка входа',
 description: error instanceof Error ? error.message : 'Неизвестная ошибка',
 variant: 'destructive',
 });
 } finally {
 setIsLoading(false);
 }
 };

 return (
 <div className="tg-app bg-gradient-gaming min-h-screen pb-safe-area-bottom">
 <Header />
 <div className="px-4 py-8 max-w-md mx-auto">
 <div className="gaming-card p-6 space-y-6">
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#2222E9' }}>Добро пожаловать!</h1>
        <p className="text-muted-foreground">Войдите в свой аккаунт для продолжения</p>
      </div>

 <form onSubmit={handleLogin} className="space-y-4">
 <div className="space-y-2">
 <Label htmlFor="login">Логин</Label>
 <Input
 id="login"
 type="text"
 value={login}
 onChange={(e) => setLogin(e.target.value)}
 placeholder="Введите логин"
 required
 className="bg-card border-border/50 focus:border-primary"
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="password">Пароль</Label>
 <Input
 id="password"
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="Введите пароль"
 required
 className="bg-card border-border/50 focus:border-primary"
 />
 </div>

 <Button
 type="submit"
 disabled={isLoading}
 className="w-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,34,233,0.5)]"
 style={{ backgroundColor: '#2222E9' }}
 size="lg"
 >
 {isLoading ? (
 <Loader2 className="h-4 w-4 animate-spin" />
 ) : null}
 Войти
 </Button>
 </form>

    <div className="text-center space-y-2 pt-4">
      <Link to="/register" className="text-primary hover:underline text-sm">
        Зарегистрироваться
      </Link>
      <span className="text-muted-foreground"> • </span>
      <Link to="/forgot-password" className="text-primary hover:underline text-sm">
        Забыли пароль?
      </Link>
    </div>
    </div>
    </div>
    </div>
    );
}
