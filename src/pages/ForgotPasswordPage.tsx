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
 <div className="tg-app bg-gradient-gaming min-h-screen pb-safe-area-bottom">
 <Header />
 <div className="px-4 py-8 max-w-md mx-auto">
 <div className="gaming-card p-6 space-y-6">
 <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold" style={{ color: '#2222E9' }}>Восстановление пароля</h1>
 <p className="text-muted-foreground">Введите логин для восстановления доступа</p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4">
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

 <Button
 type="submit"
 disabled={isLoading}
 className="w-full"
 size="lg"
 >
 {isLoading ? (
 <Loader2 className="h-4 w-4 animate-spin" />
 ) : null}
 Восстановить пароль
 </Button>
 </form>

    <div className="text-center pt-4">
      <Link to="/login" className="text-primary hover:underline text-sm">
        Вернуться к входу
      </Link>
    </div>
    </div>
    </div>
    </div>
    );
}
