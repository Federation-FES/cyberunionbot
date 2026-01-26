import { Loader2, CreditCard, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/formatters';
import { useTelegram } from '@/hooks/useTelegram';

interface PaymentPendingProps {
 paymentId: string;
 confirmationUrl: string;
 amount?: number;
 onCancel?: () => void;
}

export function PaymentPending({ paymentId, confirmationUrl, amount, onCancel }: PaymentPendingProps) {
 const { openLink } = useTelegram();

 const handleOpenPayment = () => {
 openLink(confirmationUrl);
 };

 return (
 <div className="px-4 py-8">
 <div className="gaming-card p-6 space-y-6 text-center">
 <div className="space-y-4">
 <div className="flex justify-center">
 <CreditCard className="h-16 w-16 text-primary" />
 </div>
 <div>
 <h2 className="text-xl font-bold mb-2">Оплата через СБП</h2>
 <p className="text-muted-foreground">Нажмите кнопку ниже для перехода к оплате</p>
 </div>

 {amount && (
 <div className="py-4">
 <div className="text-sm text-muted-foreground mb-2">К оплате:</div>
 <div className="text-3xl font-bold text-primary">{formatPrice(amount)}</div>
 </div>
 )}

 <Button
 onClick={handleOpenPayment}
 size="lg"
 className="w-full"
 >
 Перейти к оплате
 <ArrowRight className="ml-2 h-4 w-4" />
 </Button>
 </div>

 <div className="pt-6 border-t border-border/50">
 <div className="flex items-center justify-center gap-2 text-muted-foreground">
 <Loader2 className="h-4 w-4 animate-spin" />
 <span className="text-sm">Ожидание подтверждения оплаты...</span>
 </div>

        {onCancel && (
          <Button
            onClick={onCancel}
            variant="outline"
            className="w-full mt-4 transition-all duration-300 hover:text-white hover:shadow-[0_0_20px_rgba(34,34,233,0.5)]"
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
            Отменить
          </Button>
        )}
 </div>

 <p className="text-xs text-center text-muted-foreground mt-4">
 После успешной оплаты вы автоматически получите код активации
 </p>
 </div>
 </div>
 );
}
