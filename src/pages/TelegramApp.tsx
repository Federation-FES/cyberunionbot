import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/tg/Header';
import { TariffCard } from '@/components/tg/TariffCard';
import { CustomHoursInput } from '@/components/tg/CustomHoursInput';
import { PaymentPending } from '@/components/tg/PaymentPending';
import { ActivationCodeDisplay } from '@/components/tg/ActivationCodeDisplay';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTelegram } from '@/hooks/useTelegram';
import { formatPrice } from '@/lib/formatters';
import { Loader2, Sparkles } from 'lucide-react';

type PaymentState = 'selecting' | 'processing' | 'pending' | 'success';

interface Tariff {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  type: 'hourly' | 'package';
  hourly_rate: number | null;
}

interface PaymentData {
  paymentId: string;
  confirmationUrl: string;
  amount: number;
}

interface ActivationData {
  code: string;
  durationMinutes: number;
  expiresAt: string;
}

export default function TelegramApp() {
  const { user, hapticFeedback, isReady } = useTelegram();
  const [selectedTariffId, setSelectedTariffId] = useState<string | null>(null);
  const [customHours, setCustomHours] = useState(1);
  const [isCustomSelected, setIsCustomSelected] = useState(false);
  const [paymentState, setPaymentState] = useState<PaymentState>('selecting');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [activationData, setActivationData] = useState<ActivationData | null>(null);

  // Fetch tariffs
  const { data: tariffs, isLoading: tariffsLoading } = useQuery({
    queryKey: ['tariffs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tariffs')
        .select('*')
        .eq('is_active', true)
        .order('type', { ascending: true })
        .order('duration_minutes', { ascending: true });
      
      if (error) throw error;
      return data as Tariff[];
    },
  });

  // Get hourly rate for custom input
  const hourlyRate = tariffs?.find(t => t.hourly_rate)?.hourly_rate || 15000;

  // Selected tariff
  const selectedTariff = tariffs?.find(t => t.id === selectedTariffId);

  // Calculate total price
  const totalPrice = isCustomSelected
    ? customHours * hourlyRate
    : selectedTariff?.price || 0;

  const totalDuration = isCustomSelected
    ? customHours * 60
    : selectedTariff?.duration_minutes || 0;

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Пользователь не найден');

      const response = await supabase.functions.invoke('create-payment', {
        body: {
          telegramUserId: String(user.id),
          tariffId: isCustomSelected ? null : selectedTariffId,
          customHours: isCustomSelected ? customHours : null,
          amount: totalPrice,
          durationMinutes: totalDuration,
        },
      });

      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data) => {
      setPaymentData({
        paymentId: data.paymentId,
        confirmationUrl: data.confirmationUrl,
        amount: totalPrice,
      });
      setPaymentState('pending');
      hapticFeedback('success');
    },
    onError: () => {
      hapticFeedback('error');
    },
  });

  // Poll for payment status
  useEffect(() => {
    if (paymentState !== 'pending' || !paymentData?.paymentId) return;

    const interval = setInterval(async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('status')
        .eq('id', paymentData.paymentId)
        .single();

      if (error) return;

      if (data.status === 'succeeded') {
        // Fetch activation code
        const { data: codeData } = await supabase
          .from('activation_codes')
          .select('code, duration_minutes, expires_at')
          .eq('payment_id', paymentData.paymentId)
          .single();

        if (codeData) {
          setActivationData({
            code: codeData.code,
            durationMinutes: codeData.duration_minutes,
            expiresAt: codeData.expires_at,
          });
          setPaymentState('success');
          hapticFeedback('success');
        }
      } else if (data.status === 'failed' || data.status === 'cancelled') {
        setPaymentState('selecting');
        setPaymentData(null);
        hapticFeedback('error');
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [paymentState, paymentData, hapticFeedback]);

  const handleTariffSelect = (tariffId: string) => {
    setSelectedTariffId(tariffId);
    setIsCustomSelected(false);
    hapticFeedback('selection');
  };

  const handleCustomSelect = () => {
    setIsCustomSelected(true);
    setSelectedTariffId(null);
    hapticFeedback('selection');
  };

  const handleProceedToPayment = () => {
    hapticFeedback('medium');
    setPaymentState('processing');
    createPaymentMutation.mutate();
  };

  const handleCancelPayment = () => {
    setPaymentState('selecting');
    setPaymentData(null);
    hapticFeedback('light');
  };

  const handleNewSession = () => {
    setPaymentState('selecting');
    setPaymentData(null);
    setActivationData(null);
    setSelectedTariffId(null);
    setIsCustomSelected(false);
    hapticFeedback('light');
  };

  if (!isReady) {
    return (
      <div className="tg-app bg-gradient-gaming min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Success state - show activation code
  if (paymentState === 'success' && activationData) {
    return (
      <div className="tg-app bg-gradient-gaming min-h-screen">
        <Header subtitle="Оплата успешна!" />
        <main className="px-4 py-6">
          <ActivationCodeDisplay
            code={activationData.code}
            durationMinutes={activationData.durationMinutes}
            expiresAt={activationData.expiresAt}
          />
          <Button
            onClick={handleNewSession}
            variant="outline"
            className="w-full mt-6"
          >
            Купить ещё время
          </Button>
        </main>
      </div>
    );
  }

  // Pending payment state
  if (paymentState === 'pending' && paymentData) {
    return (
      <div className="tg-app bg-gradient-gaming min-h-screen">
        <Header subtitle="Ожидание оплаты" />
        <main className="px-4 py-6">
          <PaymentPending
            amount={paymentData.amount}
            paymentUrl={paymentData.confirmationUrl}
            onCancel={handleCancelPayment}
          />
        </main>
      </div>
    );
  }

  // Processing state
  if (paymentState === 'processing') {
    return (
      <div className="tg-app bg-gradient-gaming min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Создание платежа...</p>
        </div>
      </div>
    );
  }

  // Tariff selection state
  return (
    <div className="tg-app bg-gradient-gaming min-h-screen pb-32">
      <Header subtitle="Компьютерный клуб" />
      
      <main className="px-4 py-2">
        {/* Package tariffs */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Пакеты
          </h2>
          
          {tariffsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
          ) : (
            <div className="space-y-3">
              {tariffs
                ?.filter(t => t.type === 'package')
                .map(tariff => (
                  <TariffCard
                    key={tariff.id}
                    id={tariff.id}
                    name={tariff.name}
                    description={tariff.description}
                    price={tariff.price}
                    durationMinutes={tariff.duration_minutes}
                    type={tariff.type}
                    isSelected={selectedTariffId === tariff.id}
                    onClick={() => handleTariffSelect(tariff.id)}
                  />
                ))}
            </div>
          )}
        </section>

        {/* Hourly tariffs */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Почасовые тарифы
          </h2>
          
          {tariffsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
          ) : (
            <div className="space-y-3">
              {tariffs
                ?.filter(t => t.type === 'hourly')
                .map(tariff => (
                  <TariffCard
                    key={tariff.id}
                    id={tariff.id}
                    name={tariff.name}
                    description={tariff.description}
                    price={tariff.price}
                    durationMinutes={tariff.duration_minutes}
                    type={tariff.type}
                    isSelected={selectedTariffId === tariff.id}
                    onClick={() => handleTariffSelect(tariff.id)}
                  />
                ))}
            </div>
          )}
        </section>

        {/* Custom hours input */}
        <section>
          <CustomHoursInput
            hours={customHours}
            onHoursChange={setCustomHours}
            hourlyRate={hourlyRate}
            isSelected={isCustomSelected}
            onSelect={handleCustomSelect}
          />
        </section>
      </main>

      {/* Bottom payment button */}
      {(selectedTariffId || isCustomSelected) && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent safe-area-bottom">
          <Button
            onClick={handleProceedToPayment}
            disabled={createPaymentMutation.isPending}
            className="w-full btn-gradient-primary h-14 text-lg gap-2"
          >
            {createPaymentMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Оплатить {formatPrice(totalPrice)}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}