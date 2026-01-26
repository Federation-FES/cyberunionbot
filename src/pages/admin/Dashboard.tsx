import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TariffsTab } from '@/components/admin/TariffsTab';
import { ComputersTab } from '@/components/admin/ComputersTab';
import { SessionsTab } from '@/components/admin/SessionsTab';
import { PaymentsTab } from '@/components/admin/PaymentsTab';
import { StatsCards } from '@/components/admin/StatsCards';
import { 
 Gamepad2, 
 LogOut, 
 Monitor, 
 CreditCard, 
 Clock, 
 Tag,
 Loader2
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';

export default function AdminDashboard() {
 const [user, setUser] = useState<User | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const navigate = useNavigate();

 useEffect(() => {
 const checkAuth = async () => {
 const { data: { session } } = await supabase.auth.getSession();
 
 if (!session) {
 navigate('/admin/login');
 return;
 }

 // Check admin role
 const { data: roleData } = await supabase
 .from('user_roles')
 .select('role')
 .eq('user_id', session.user.id)
 .eq('role', 'admin')
 .maybeSingle();

 if (!roleData) {
 await supabase.auth.signOut();
 navigate('/admin/login');
 return;
 }

 setUser(session.user);
 setIsLoading(false);
 };

 checkAuth();

 const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
 if (event === 'SIGNED_OUT' || !session) {
 navigate('/admin/login');
 }
 });

 return () => subscription.unsubscribe();
 }, [navigate]);

 const handleLogout = async () => {
 await supabase.auth.signOut();
 navigate('/admin/login');
 };

 if (isLoading) {
 return (
 <div className="flex items-center justify-center min-h-screen">
 <Loader2 className="h-8 w-8 animate-spin" />
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-background">
 {/* Header */}
 <header className="border-b bg-card">
 <div className="container mx-auto px-4 py-4 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Gamepad2 className="h-6 w-6 text-primary" />
 <h1 className="text-xl font-bold">GameZone Admin</h1>
 </div>
 <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground">{user?.email}</span>
      <Button onClick={handleLogout} variant="outline" size="sm">
        <LogOut className="h-4 w-4 mr-2" />
        Выйти
      </Button>
    </div>
    </div>
    </header>

 {/* Main content */}
 <main className="container mx-auto px-4 py-8">
 {/* Stats */}
 <StatsCards />

 {/* Tabs */}
 <Tabs defaultValue="sessions" className="mt-8">
 <TabsList className="grid w-full grid-cols-4">
 <TabsTrigger value="sessions">
 <Clock className="h-4 w-4 mr-2" />
 Сессии
 </TabsTrigger>
 <TabsTrigger value="computers">
 <Monitor className="h-4 w-4 mr-2" />
 Компьютеры
 </TabsTrigger>
 <TabsTrigger value="tariffs">
 <Tag className="h-4 w-4 mr-2" />
 Тарифы
 </TabsTrigger>
 <TabsTrigger value="payments">
 <CreditCard className="h-4 w-4 mr-2" />
 Платежи
 </TabsTrigger>
 </TabsList>

 <TabsContent value="sessions">
 <SessionsTab />
 </TabsContent>

 <TabsContent value="computers">
 <ComputersTab />
 </TabsContent>

 <TabsContent value="tariffs">
 <TariffsTab />
 </TabsContent>

 <TabsContent value="payments">
 <PaymentsTab />
 </TabsContent>
 </Tabs>
 </main>
 </div>
 );
}
