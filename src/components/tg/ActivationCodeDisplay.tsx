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
 <div className="px-4 py-8">
 <div className="gaming-card p-6 space-y-6 text-center">
 <div className="space-y-4">
 <div className="flex justify-center">
 <Gamepad2 className="h-16 w-16 text-primary" />
 </div>
 <div style={{ marginTop: '16px' }}>
 <h2 className="text-xl font-bold mb-2">Ваш код активации</h2>
 <p className="text-muted-foreground">Введите этот код на экране компьютера</p>
 </div>

 <div className="py-6">
 <div className="inline-block bg-card border-2 border-primary rounded-lg p-4 mb-4">
 <div className="text-4xl font-mono font-bold tracking-wider text-primary">
 {code}
 </div>
 </div>
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="w-full transition-all duration-300 hover:text-white hover:shadow-[0_0_20px_rgba(34,34,233,0.5)]"
          style={{ 
            backgroundColor: 'transparent', 
            borderColor: '#2222E9',
            color: '#2222E9'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2222E9';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#2222E9';
          }}
        >
 {copied ? (
 <>
 <Check className="mr-2 h-4 w-4" />
 Скопировано
 </>
 ) : (
 <>
 <Copy className="mr-2 h-4 w-4" />
 Копировать код
 </>
 )}
 </Button>
 </div>

 <div className="pt-4 border-t border-border/50 space-y-2">
 <div className="flex items-center justify-center gap-2 text-muted-foreground">
 <Clock className="h-4 w-4" style={{ color: '#2222E9' }} />
 <span className="text-sm">{formatDuration(durationMinutes)}</span>
 </div>
 <p className="text-xs text-muted-foreground">
 {isExpired ? 'Код истёк' : `Действителен до ${expiresDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`}
 </p>
 </div>
 </div>

 <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
 <p className="text-sm">
 💡 После ввода кода у вас будет {formatDuration(durationMinutes)} игрового времени
 </p>
 </div>
 </div>
 </div>
 );
}
