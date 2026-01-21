import { Loader2, CreditCard, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/formatters';
import { useTelegram } from '@/hooks/useTelegram';

interface PaymentPendingProps {
  amount: number;
  paymentUrl: string;
  onCancel?: () => void;
}

export function PaymentPending({ amount, paymentUrl, onCancel }: PaymentPendingProps) {
  const { openLink } = useTelegram();

  const handleOpenPayment = () => {
    openLink(paymentUrl);
  };

  return (
    <div className="gaming-card p-6 text-center animate-fade-in">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-[hsl(200_100%_60%)] flex items-center justify-center shadow-[0_0_20px_rgba(35,35,255,0.35)]">
        <CreditCard className="w-8 h-8 text-primary-foreground" />
      </div>

      <h2 className="text-xl font-bold mb-2">Оплата через СБП</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Нажмите кнопку ниже для перехода к оплате
      </p>

      <div className="mb-6 p-4 rounded-xl bg-muted/30 border border-border/50">
        <span className="text-sm text-muted-foreground">К оплате:</span>
        <div className="price-tag text-3xl mt-1">{formatPrice(amount)}</div>
      </div>

      <Button
        onClick={handleOpenPayment}
        className="w-full btn-gradient-primary h-12 text-base gap-2"
      >
        Перейти к оплате
        <ArrowRight className="w-5 h-5" />
      </Button>

      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Ожидание подтверждения оплаты...</span>
      </div>

      {onCancel && (
        <Button
          variant="ghost"
          onClick={onCancel}
          className="mt-4 text-muted-foreground"
        >
          Отменить
        </Button>
      )}

      <div className="mt-6 p-3 rounded-lg bg-info/10 border border-info/20">
        <p className="text-xs text-info">
          После успешной оплаты вы автоматически получите код активации
        </p>
      </div>
    </div>
  );
}