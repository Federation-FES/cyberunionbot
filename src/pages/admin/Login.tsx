import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield } from 'lucide-react';

export default function AdminLogin() {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const navigate = useNavigate();
 const { toast } = useToast();

 const handleLogin = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsLoading(true);

 try {
 const { data, error } = await supabase.auth.signInWithPassword({
 email,
 password,
 });

 if (error) throw error;

 if (data.user) {
 // Check if user is admin
 const { data: roleData, error: roleError } = await supabase
 .from('user_roles')
 .select('role')
 .eq('user_id', data.user.id)
 .eq('role', 'admin')
 .maybeSingle();

 if (roleError) throw roleError;

 if (!roleData) {
 await supabase.auth.signOut();
 toast({
 title: 'Доступ запрещён',
 description: 'У вас нет прав администратора',
 variant: 'destructive',
 });
 return;
 }

 toast({
 title: 'Добро пожаловать!',
 description: 'Вы успешно вошли в систему',
 });
 navigate('/admin');
 }
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
 <div className="min-h-screen flex items-center justify-center bg-background p-4">
 <Card className="w-full max-w-md">
 <CardHeader className="text-center">
 <div className="flex justify-center mb-4">
 <Shield className="h-12 w-12 text-primary" />
 </div>
 <CardTitle className="text-2xl">Вход в админ-панель</CardTitle>
 <CardDescription>Введите данные для входа в систему управления</CardDescription>
 </CardHeader>
 <CardContent>
 <form onSubmit={handleLogin} className="space-y-4">
 <div className="space-y-2">
 <Label htmlFor="email">Email</Label>
 <Input
 id="email"
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="admin@example.com"
 required
 />
 </div>
 <div className="space-y-2">
 <Label htmlFor="password">Пароль</Label>
 <Input
 id="password"
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="••••••••"
 required
 />
 </div>
 <Button type="submit" disabled={isLoading} className="w-full">
 {isLoading ? (
 <Loader2 className="h-4 w-4 animate-spin" />
 ) : null}
 Войти
 </Button>
 </form>
 </CardContent>
 </Card>
 </div>
 );
}
