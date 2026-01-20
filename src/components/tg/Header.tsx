import { Gamepad2 } from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = "GameZone", subtitle }: HeaderProps) {
  const { user } = useTelegram();

  return (
    <header className="px-4 py-4 safe-area-top">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-neon-pink flex items-center justify-center animate-pulse-glow">
            <Gamepad2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg neon-text">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        
        {user && (
          <div className="text-right">
            <p className="text-sm font-medium">{user.first_name}</p>
            {user.username && (
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            )}
          </div>
        )}
      </div>
    </header>
  );
}