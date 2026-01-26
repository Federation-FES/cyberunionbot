import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, CreditCard, Clock, Users } from 'lucide-react';
import { formatPrice } from '@/lib/formatters';

export function StatsCards() {
 const { data: stats } = useQuery({
 queryKey: ['admin-stats'],
 queryFn: async () => {
 const [computers, sessions, payments] = await Promise.all([
 supabase.from('computers').select('status'),
 supabase.from('sessions').select('id').is('end_time', null),
 supabase.from('payments').select('amount, status').eq('status', 'succeeded'),
 ]);

 const occupiedCount = computers.data?.filter(c => c.status === 'occupied').length || 0;
 const totalComputers = computers.data?.length || 0;
 const activeSessions = sessions.data?.length || 0;
 const totalRevenue = payments.data?.reduce((sum, p) => sum + p.amount, 0) || 0;

 return { occupiedCount, totalComputers, activeSessions, totalRevenue };
 },
 });

 return (
 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Занято ПК</CardTitle>
 <Monitor className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{stats?.occupiedCount || 0}/{stats?.totalComputers || 0}</div>
 </CardContent>
 </Card>
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Активные сессии</CardTitle>
 <Clock className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{stats?.activeSessions || 0}</div>
 </CardContent>
 </Card>
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Выручка</CardTitle>
 <CreditCard className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{formatPrice(stats?.totalRevenue || 0)}</div>
 </CardContent>
 </Card>
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Сегодня</CardTitle>
 <Users className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">—</div>
 </CardContent>
 </Card>
 </div>
 );
}
