import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/tg/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
      // Check if user exists in USER_DATA
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('login', login)
        .eq('password', password)
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

      // Store user session (simple localStorage for now)
      localStorage.setItem('user_session', JSON.stringify({
        id: data.id,
        name: data.name,
        login: data.login,
        phone: data.phone,
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
    <div className="tg-app bg-gradient-gaming min-h-screen">
      <Header subtitle="Компьютерный клуб" />
      
      <main className="px-4 py-8">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2 neon-text">
            Добро пожаловать!
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Войдите в свой аккаунт для продолжения
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login" className="text-foreground">
                Логин
              </Label>
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
              <Label htmlFor="password" className="text-foreground">
                Пароль
              </Label>
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
              className="w-full btn-gradient-primary h-12 text-base mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : null}
              Войти
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-4 text-sm">
            <Link
              to="/register"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Зарегистрироваться
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              to="/forgot-password"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Забыли пароль?
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
