import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/tg/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { hashPassword, encryptData } from '@/lib/security';

export default function RegisterPage() {
 const [name, setName] = useState('');
 const [phone, setPhone] = useState('');
 const [login, setLogin] = useState('');
 const [password, setPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [notifications, setNotifications] = useState(false);
 const [privacy, setPrivacy] = useState(false);
 const [rememberMe, setRememberMe] = useState(false);
 const [isLoading, setIsLoading] = useState(false);
 const [errors, setErrors] = useState<Record<string, string>>({});
 const navigate = useNavigate();
 const { toast } = useToast();

 const validatePassword = (pwd: string): string | null => {
 if (pwd.length < 6) {
 return 'Пароль должен содержать минимум 6 символов';
 }
 // Только латинские буквы (заглавные и строчные) и цифры
 if (!/^[a-zA-Z0-9]+$/.test(pwd)) {
 return 'Пароль должен содержать только латинские буквы и цифры';
 }
 if (!/[a-z]/.test(pwd)) {
 return 'Пароль должен содержать минимум одну строчную букву';
 }
 if (!/[A-Z]/.test(pwd)) {
 return 'Пароль должен содержать минимум одну заглавную букву';
 }
 return null;
 };

 const handleRegister = async (e: React.FormEvent) => {
 e.preventDefault();
 setErrors({});

 // Validation
 const passwordError = validatePassword(password);
 if (passwordError) {
 setErrors({ password: passwordError });
 return;
 }

 if (password !== confirmPassword) {
 setErrors({ confirmPassword: 'Пароли не совпадают' });
 return;
 }

 if (!privacy) {
 setErrors({ privacy: 'Необходимо согласие с политикой конфиденциальности' });
 return;
 }

 setIsLoading(true);

 try {
 // Check if login already exists
 const { data: existingUser } = await supabase
 .from('user_data')
 .select('id')
 .eq('login', login)
 .maybeSingle();

 if (existingUser) {
 setErrors({ login: 'Логин уже занят' });
 setIsLoading(false);
 return;
 }

    // Хешируем пароль и шифруем персональные данные
    const hashedPassword = await hashPassword(password);
    const encryptedName = await encryptData(name);
    const encryptedPhone = await encryptData(phone);
    
    // Insert new user с зашифрованными данными
    const { data, error } = await supabase
      .from('user_data')
      .insert({
        name: encryptedName, // Зашифрованное имя
        phone: encryptedPhone, // Зашифрованный телефон
        login,
        password: hashedPassword, // Хешированный пароль
        ad: notifications ? '+' : '-',
      })
      .select()
      .single();

 if (error) {
 console.error('Registration error:', error);
 throw new Error(error.message || `Ошибка базы данных: ${error.code || 'unknown'}`);
 }

 toast({
 title: 'Регистрация успешна!',
 description: 'Вы можете войти в систему',
 });

 navigate('/login');
 } catch (error: any) {
 console.error('Registration error details:', error);
 let errorMessage = 'Неизвестная ошибка';
 
 if (error?.message) {
 errorMessage = error.message;
 } else if (typeof error === 'string') {
 errorMessage = error;
 } else if (error?.code) {
 errorMessage = `Ошибка ${error.code}: ${error.message || 'Проверьте подключение к базе данных'}`;
 }
 
 toast({
 title: 'Ошибка регистрации',
 description: errorMessage,
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
        <h1 className="text-2xl font-bold" style={{ color: '#2222E9' }}>Регистрация</h1>
        <p className="text-muted-foreground">Создайте аккаунт для доступа к услугам клуба</p>
      </div>

 <form onSubmit={handleRegister} className="space-y-4">
 <div className="space-y-2">
 <Label htmlFor="name">Имя</Label>
 <Input
 id="name"
 type="text"
 value={name}
 onChange={(e) => setName(e.target.value)}
 placeholder="Введите ваше имя"
 required
 className="bg-card border-border/50 focus:border-primary"
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="phone">Номер телефона</Label>
 <Input
 id="phone"
 type="tel"
 value={phone}
 onChange={(e) => setPhone(e.target.value)}
 placeholder="+7 (999) 123-45-67"
 required
 className="bg-card border-border/50 focus:border-primary"
 />
 </div>

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
 {errors.login && (
 <p className="text-sm text-destructive">{errors.login}</p>
 )}
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
 {errors.password && (
 <p className="text-sm text-destructive">{errors.password}</p>
 )}
 <p className="text-xs text-muted-foreground">
 Минимум 6 символов, только латинские буквы (заглавные и строчные) и цифры
 </p>
 </div>

 <div className="space-y-2">
 <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
 <Input
 id="confirmPassword"
 type="password"
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 placeholder="Повторите пароль"
 required
 className="bg-card border-border/50 focus:border-primary"
 />
 {errors.confirmPassword && (
 <p className="text-sm text-destructive">{errors.confirmPassword}</p>
 )}
 </div>

 <div className="flex items-start space-x-2">
 <Checkbox
 id="notifications"
 checked={notifications}
 onCheckedChange={(checked) => setNotifications(checked === true)}
 />
 <Label htmlFor="notifications" className="text-sm cursor-pointer flex-1">
 Уведомлять меня о новых акциях клуба
 </Label>
 </div>

 <div className="space-y-1">
 <div className="flex items-start space-x-2">
 <Checkbox
 id="privacy"
 checked={privacy}
 onCheckedChange={(checked) => setPrivacy(checked === true)}
 />
 <Label htmlFor="privacy" className="text-sm cursor-pointer flex-1">
 Я согласен с политикой конфиденциальности и обработкой персональных данных
 </Label>
 </div>
 {errors.privacy && (
 <p className="text-sm text-destructive ml-6">{errors.privacy}</p>
 )}

 <div className="flex items-start space-x-2 mt-2">
 <Checkbox
 id="remember"
 checked={rememberMe}
 onCheckedChange={(checked) => setRememberMe(checked === true)}
 />
 <Label htmlFor="remember" className="text-sm cursor-pointer flex-1">
 Запомнить меня
 </Label>
 </div>
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
 Зарегистрироваться
 </Button>
 </form>

    <div className="text-center pt-4">
      <Link to="/login" className="text-primary hover:underline text-sm">
        Уже есть аккаунт? Войти
      </Link>
    </div>
    </div>
    </div>
    </div>
    );
}
