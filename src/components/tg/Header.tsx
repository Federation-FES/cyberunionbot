import { useNavigate } from 'react-router-dom';
import { useTelegram } from '@/hooks/useTelegram';
import { useSession } from '@/hooks/use-session';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = "CyberUnion", subtitle }: HeaderProps) {
  const { user } = useTelegram();
  const { session, clearSession } = useSession();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

 return (
 <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border/50 safe-area-top">
 <div className="flex items-center justify-between" style={{ paddingLeft: '15px', paddingTop: '15px', paddingRight: '16px', paddingBottom: '12px' }}>
 <div className="flex items-center gap-3">
 {/* Логотип */}
 <img 
   src="/Frame_1-removebg-preview (1) 1.svg" 
   alt="CyberUnion Logo" 
   className="h-12 w-12 flex-shrink-0"
 />
 <div>
 <h1 className="text-lg font-bold text-foreground leading-tight">{title}</h1>
 <p className="text-sm text-muted-foreground leading-tight">Компьютерный клуб</p>
 </div>
 </div>
 
 {session && (
 <div className="flex items-center gap-2">
 <div className="text-right text-sm">
 <div className="font-medium">{session.name || 'Пользователь'}</div>
 {session.login && (
 <div className="text-muted-foreground">@{session.login}</div>
 )}
 </div>
 <Button
 onClick={handleLogout}
 variant="ghost"
 size="sm"
 className="h-8 text-white"
 style={{ backgroundColor: '#2222E9', borderColor: '#2222E9' }}
 >
 <LogOut className="h-4 w-4" />
 Выйти
 </Button>
 </div>
 )}
 </div>
 </header>
 );
}
