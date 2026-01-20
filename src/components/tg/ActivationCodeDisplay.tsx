import { Copy, Check, Clock, Gamepad2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatDuration } from '@/lib/formatters';
import { useTelegram } from '@/hooks/useTelegram';

interface ActivationCodeDisplayProps {
  code: string;
  durationMinutes: number;
  expiresAt: string;
}

export function ActivationCodeDisplay({
  code,
  durationMinutes,
  expiresAt,
}: ActivationCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const { hapticFeedback } = useTelegram();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      hapticFeedback('success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      hapticFeedback('error');
    }
  };

  const expiresDate = new Date(expiresAt);
  const isExpired = expiresDate < new Date();

  return (
    <div className="gaming-card p-6 text-center animate-fade-in">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-neon-pink flex items-center justify-center">
        <Gamepad2 className="w-8 h-8 text-primary-foreground" />
      </div>

      <h2 className="text-xl font-bold mb-2">Ваш код активации</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Введите этот код на экране компьютера
      </p>

      <div className="relative mb-6">
        <div className="bg-muted/50 rounded-xl p-4 border border-primary/30 neon-border">
          <span className="text-3xl font-mono font-bold tracking-[0.3em] neon-text">
            {code}
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="absolute right-2 top-1/2 -translate-y-1/2"
        >
          {copied ? (
            <Check className="w-5 h-5 text-success" />
          ) : (
            <Copy className="w-5 h-5" />
          )}
        </Button>
      </div>

      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-secondary" />
          <span>{formatDuration(durationMinutes)}</span>
        </div>
        
        <div className={`flex items-center gap-2 ${isExpired ? 'text-destructive' : 'text-muted-foreground'}`}>
          <span>
            {isExpired ? 'Код истёк' : `Действителен до ${expiresDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`}
          </span>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/50">
        <p className="text-sm text-muted-foreground">
          💡 После ввода кода у вас будет <strong className="text-secondary">{formatDuration(durationMinutes)}</strong> игрового времени
        </p>
      </div>
    </div>
  );
}