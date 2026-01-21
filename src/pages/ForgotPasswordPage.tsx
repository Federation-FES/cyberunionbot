import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/tg/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
  const [login, setLogin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Implement password reset logic
    setTimeout(() => {
      toast({
        title: 'Инструкции отправлены',
        description: 'Проверьте вашу почту или телефон для восстановления пароля',
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="tg-app bg-gradient-gaming min-h-screen">
      <Header subtitle="Восстановление пароля" />
      
      <main className="px-4 py-8">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2 neon-text">
            Восстановление пароля
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Введите логин для восстановления доступа
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <Button
              type="submit"
              className="w-full btn-gradient-primary h-12 text-base mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : null}
              Восстановить пароль
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Вернуться к входу
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
