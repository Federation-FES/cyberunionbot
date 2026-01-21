import { useNavigate } from 'react-router-dom';
import { useTelegram } from '@/hooks/useTelegram';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import cyberUnionLogo from '@/assets/cyber-union-logo.svg';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = "CyberUnion", subtitle }: HeaderProps) {
  const { user } = useTelegram();
  const navigate = useNavigate();
  
  // Get user session from localStorage
  const getUserSession = () => {
    try {
      const session = localStorage.getItem('user_session');
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  };
  
  const session = getUserSession();

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    navigate('/login');
  };

  return (
    <header className="px-4 pt-[73px] pb-4 safe-area-top">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-neon-pink flex items-center justify-center animate-pulse-glow">
            <img
              src={cyberUnionLogo}
              alt="Cyber Union"
              className="w-7 h-7 object-contain"
            />
          </div>
          <div>
            <h1 className="font-bold text-lg neon-text">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        
        {session && (
          <div className="text-right flex flex-col items-end gap-1 mt-[18px]">
            <p className="text-sm font-medium">{session.name || 'Пользователь'}</p>
            {session.login && (
              <p className="text-xs text-muted-foreground">@{session.login}</p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="h-8 px-3 text-xs border-primary/60 text-primary hover:bg-primary/10 hover:border-primary hover:text-foreground group mt-1"
            >
              <LogOut className="w-3 h-3 mr-1.5 group-hover:text-foreground transition-colors" />
              Выйти
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}