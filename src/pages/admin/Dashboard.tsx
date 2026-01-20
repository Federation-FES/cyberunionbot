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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg">GameZone Admin</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Выйти
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <StatsCards />

        {/* Tabs */}
        <Tabs defaultValue="sessions" className="mt-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="sessions" className="gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Сессии</span>
            </TabsTrigger>
            <TabsTrigger value="computers" className="gap-2">
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Компьютеры</span>
            </TabsTrigger>
            <TabsTrigger value="tariffs" className="gap-2">
              <Tag className="w-4 h-4" />
              <span className="hidden sm:inline">Тарифы</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Платежи</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="mt-6">
            <SessionsTab />
          </TabsContent>

          <TabsContent value="computers" className="mt-6">
            <ComputersTab />
          </TabsContent>

          <TabsContent value="tariffs" className="mt-6">
            <TariffsTab />
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <PaymentsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}