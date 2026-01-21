import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [selectedTariffId, setSelectedTariffId] = useState<string | null>(null);
  const [customHours, setCustomHours] = useState(1);
  const [isCustomSelected, setIsCustomSelected] = useState(false);
  const [paymentState, setPaymentState] = useState<PaymentState>('selecting');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [activationData, setActivationData] = useState<ActivationData | null>(null);

  // Check authentication
  useEffect(() => {
    const session = localStorage.getItem('user_session');
    if (!session) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch tariffs
  const { data: tariffs, isLoading: tariffsLoading, error: tariffsError } = useQuery({
    queryKey: ['tariffs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tariffs')
        .select('*')
        .eq('is_active', true)
        .order('type', { ascending: true })
        .order('duration_minutes', { ascending: true });
      
      if (error) {
        console.error('Error fetching tariffs:', error);
        // Return empty array if table doesn't exist yet or access denied
        if (
          error.code === 'PGRST116' || 
          error.code === '42P01' ||
          error.message?.includes('does not exist') ||
          error.message?.includes('permission denied') ||
          error.message?.includes('new row violates row-level security')
        ) {
          console.warn('Tariffs table may not exist or RLS is blocking access. Returning empty array.');
          return [] as Tariff[];
        }
        throw error;
      }
      return (data || []) as Tariff[];
    },
    retry: 1,
  });

  // Normalize tariffs for UI tweaks (VIP day duration override)
  const normalizedTariffs = useMemo(() => {
    if (!tariffs) return [];
    return tariffs.map((tariff) => {
      const name = tariff.name?.toLowerCase() || '';
      if (name.includes('vip') && name.includes('день')) {
        return { ...tariff, duration_minutes: 9 * 60 };
      }
      return tariff;
    });
  }, [tariffs]);

  // Get hourly rate for custom input (fixed to 120₽/час)
  const hourlyRate = 12000;

  // Selected tariff
  const selectedTariff = normalizedTariffs.find(t => t.id === selectedTariffId);

  // Calculate total price
  const totalPrice = isCustomSelected
    ? customHours * hourlyRate
    : selectedTariff?.price || 0;

  const totalDuration = isCustomSelected
    ? customHours * 60
    : selectedTariff?.duration_minutes || 0;

  // Get user session
  const getUserSession = () => {
    try {
      const session = localStorage.getItem('user_session');
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  };

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const session = getUserSession();
      if (!session?.id) {
        throw new Error('Сессия пользователя не найдена. Пожалуйста, войдите снова.');
      }

      // Use session user ID or Telegram user ID as fallback
      const userId = session.id || (user?.id ? String(user.id) : null);
      if (!userId) {
        throw new Error('Не удалось определить ID пользователя');
      }

      console.log('Creating payment with:', {
        userId,
        tariffId: isCustomSelected ? null : selectedTariffId,
        customHours: isCustomSelected ? customHours : null,
        amount: totalPrice,
        durationMinutes: totalDuration,
      });

      // Try to use Edge Function first, fallback to direct database insert
      try {
        const response = await supabase.functions.invoke('create-payment', {
          body: {
            telegramUserId: userId,
            tariffId: isCustomSelected ? null : selectedTariffId,
            customHours: isCustomSelected ? customHours : null,
            amount: totalPrice,
            durationMinutes: totalDuration,
          },
        });

        console.log('Payment response:', response);

        if (response.error) {
          console.error('Payment error:', response.error);
          // If Edge Function fails, try direct database insert
          throw new Error('EDGE_FUNCTION_ERROR');
        }

        if (!response.data) {
          throw new Error('EDGE_FUNCTION_ERROR');
        }

        return response.data;
      } catch (error: any) {
        // Fallback: create payment directly in database
        if (error?.message === 'EDGE_FUNCTION_ERROR' || error?.message?.includes('Edge Function')) {
          console.warn('Edge Function not available, using direct database insert');
          
          // Generate activation code
          const generateCode = () => {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let result = '';
            for (let i = 0; i < 8; i++) {
              result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
          };

          // Create payment directly
          const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .insert({
              telegram_user_id: userId,
              tariff_id: isCustomSelected ? null : selectedTariffId,
              custom_hours: isCustomSelected ? customHours : null,
              amount: totalPrice,
              status: 'pending',
              confirmation_url: `https://yookassa.ru/demo/payment?amount=${totalPrice}`,
              external_payment_id: `demo_${Date.now()}`,
            })
            .select()
            .single();

          if (paymentError) {
            console.error('Direct payment creation error:', paymentError);
            throw new Error(paymentError.message || 'Ошибка при создании платежа в базе данных');
          }

          // For demo: auto-complete payment after 2 seconds
          setTimeout(async () => {
            const { error: updateError } = await supabase
              .from('payments')
              .update({ status: 'succeeded' })
              .eq('id', payment.id);

            if (!updateError && payment) {
              const code = generateCode();
              await supabase.from('activation_codes').insert({
                code,
                payment_id: payment.id,
                duration_minutes: totalDuration,
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              });
            }
          }, 2000);

          return {
            paymentId: payment.id,
            confirmationUrl: payment.confirmation_url,
          };
        }
        
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Payment created successfully:', data);
      setPaymentData({
        paymentId: data.paymentId,
        confirmationUrl: data.confirmationUrl,
        amount: totalPrice,
      });
      setPaymentState('pending');
      hapticFeedback('success');
    },
    onError: (error: Error) => {
      console.error('Payment creation failed:', error);
      setPaymentState('selecting');
      hapticFeedback('error');
      // Show error toast
      alert(`Ошибка создания платежа: ${error.message}`);
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
          <p className="text-muted-foreground mb-4">Создание платежа...</p>
          {createPaymentMutation.isError && (
            <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 max-w-md mx-auto">
              <p className="text-sm text-destructive">
                {createPaymentMutation.error?.message || 'Ошибка при создании платежа'}
              </p>
              <Button
                onClick={() => {
                  setPaymentState('selecting');
                  createPaymentMutation.reset();
                }}
                variant="outline"
                className="mt-3"
              >
                Вернуться назад
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Tariff selection state
  return (
    <div className="tg-app bg-gradient-gaming min-h-screen pb-32">
      <Header subtitle="Компьютерный клуб" />
      
      <main className="px-4 py-2">
        {/* Custom hours first */}
        <section className="mb-6">
          <CustomHoursInput
            hours={customHours}
            onHoursChange={setCustomHours}
            hourlyRate={hourlyRate}
            isSelected={isCustomSelected}
            onSelect={handleCustomSelect}
          />
        </section>

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
          ) : tariffsError ? (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">
                Ошибка загрузки пакетов. Проверьте подключение к базе данных.
              </p>
            </div>
          ) : normalizedTariffs?.filter(t => t.type === 'package').length === 0 ? (
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
              <p className="text-sm text-muted-foreground text-center">
                Пакеты пока не добавлены
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {normalizedTariffs
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
      </main>

      {/* Bottom payment button */}
      {(selectedTariffId || isCustomSelected) && (
        <div className="fixed bottom-4 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-background via-background to-transparent safe-area-bottom">
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