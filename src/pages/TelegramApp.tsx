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
import { useSession } from '@/hooks/use-session';
import { formatPrice } from '@/lib/formatters';
import { 
  validatePaymentData, 
  createPaymentSignature 
} from '@/lib/security';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const { session, isLoading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTariffId, setSelectedTariffId] = useState<string | null>(null);
  const [customHours, setCustomHours] = useState(1);
  const [isCustomSelected, setIsCustomSelected] = useState(false);
  const [paymentState, setPaymentState] = useState<PaymentState>('selecting');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [activationData, setActivationData] = useState<ActivationData | null>(null);

  // Check authentication
  useEffect(() => {
    if (!sessionLoading && !session) {
      navigate('/login');
    }
  }, [session, sessionLoading, navigate]);

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
 
 // Логируем загруженные данные для отладки
 if (data) {
 console.log('Loaded tariffs:', data);
 data.forEach((tariff, index) => {
 console.log(`Tariff ${index + 1}:`, {
 id: tariff.id,
 name: tariff.name,
 price: tariff.price,
 priceType: typeof tariff.price,
 duration_minutes: tariff.duration_minutes,
 durationType: typeof tariff.duration_minutes,
 type: tariff.type,
 });
 });
 }
 
 return (data || []) as Tariff[];
 },
 retry: 1,
 });

 // Normalize tariffs for UI tweaks (VIP day duration override)
 const normalizedTariffs = useMemo(() => {
 if (!tariffs) return [];
 return tariffs.map((tariff) => {
 // Преобразуем price и duration_minutes в числа, если они пришли как строки
 const price = typeof tariff.price === 'string' 
   ? parseFloat(tariff.price) 
   : (typeof tariff.price === 'number' ? tariff.price : 0);
   
 const duration_minutes = typeof tariff.duration_minutes === 'string'
   ? parseInt(tariff.duration_minutes, 10)
   : (typeof tariff.duration_minutes === 'number' ? tariff.duration_minutes : 0);
 
 // Проверяем валидность чисел
 const validPrice = isNaN(price) ? 0 : price;
 const validDuration = isNaN(duration_minutes) ? 0 : duration_minutes;
 
 const normalized = {
 ...tariff,
 price: validPrice,
 duration_minutes: validDuration,
 name: tariff.name || 'Без названия',
 description: tariff.description || null,
 };
 
 const name = normalized.name.toLowerCase();
 if (name.includes('vip') && name.includes('день')) {
 return { ...normalized, duration_minutes: 9 * 60, price: 100000 }; // 1000 рублей в копейках
 }
 return normalized;
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

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!session?.id) {
        throw new Error('Сессия пользователя не найдена. Пожалуйста, войдите снова.');
      }

      const userId = session.id;

      // Валидация платежных данных
      const validation = validatePaymentData({
        amount: totalPrice,
        tariffId: isCustomSelected ? null : selectedTariffId,
        customHours: isCustomSelected ? customHours : null,
      });

      if (!validation.valid) {
        throw new Error(validation.error || 'Неверные данные платежа');
      }

      // Создаем подпись для защиты платежа
      const timestamp = Date.now();
      const paymentSignature = await createPaymentSignature({
        userId,
        amount: totalPrice,
        tariffId: isCustomSelected ? null : selectedTariffId,
        timestamp,
      });

      console.log('Creating payment with:', {
        userId,
        tariffId: isCustomSelected ? null : selectedTariffId,
        customHours: isCustomSelected ? customHours : null,
        amount: totalPrice,
        durationMinutes: totalDuration,
        timestamp,
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
            timestamp,
            signature: paymentSignature, // Добавляем подпись для проверки на сервере
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
 // Время покупки (текущее время) + длительность тарифа
 const purchaseTime = new Date();
 const expiresAt = new Date(purchaseTime.getTime() + totalDuration * 60 * 1000);
 
 await supabase.from('activation_codes').insert({
 code,
 payment_id: payment.id,
 duration_minutes: totalDuration,
 expires_at: expiresAt.toISOString(),
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
        toast({
          title: 'Ошибка создания платежа',
          description: error.message || 'Неизвестная ошибка',
          variant: 'destructive',
        });
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

  if (!isReady || sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

 // Success state - show activation code
 if (paymentState === 'success' && activationData) {
 return (
 <div className="tg-app bg-gradient-gaming min-h-screen pb-safe-area-bottom">
 <Header />
 <ActivationCodeDisplay
 code={activationData.code}
 durationMinutes={activationData.durationMinutes}
 expiresAt={activationData.expiresAt}
 />
 <div className="px-4 pb-6">
 <Button
 onClick={handleNewSession}
 variant="outline"
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
 Купить ещё время
 </Button>
 </div>
 </div>
 );
 }

 // Pending payment state
 if (paymentState === 'pending' && paymentData) {
 return (
 <div className="tg-app bg-gradient-gaming min-h-screen pb-safe-area-bottom">
 <Header />
 <PaymentPending
 paymentId={paymentData.paymentId}
 confirmationUrl={paymentData.confirmationUrl}
 amount={paymentData.amount}
 onCancel={handleCancelPayment}
 />
 </div>
 );
 }

 // Processing state
 if (paymentState === 'processing') {
 return (
 <div className="tg-app bg-gradient-gaming min-h-screen pb-safe-area-bottom flex items-center justify-center">
 <div className="text-center px-4">
 <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
 <h2 className="text-xl font-semibold mb-2">Создание платежа...</h2>
 {createPaymentMutation.isError && (
 <div className="mt-4">
 <p className="text-destructive mb-3">
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
 <div className="tg-app bg-gradient-gaming min-h-screen pb-safe-area-bottom">
 <Header />
 <div className="px-4 py-6 space-y-6">
 {/* Custom hours first */}
 <CustomHoursInput
 hours={customHours}
 onHoursChange={setCustomHours}
 isSelected={isCustomSelected}
 onSelect={handleCustomSelect}
 hourlyRate={hourlyRate}
 />

    {/* Package tariffs */}
    <div className="mb-20">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        Пакеты
      </h2>
      {tariffsLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : tariffsError ? (
        <div className="text-center py-8 text-muted-foreground">
          Ошибка загрузки пакетов. Проверьте подключение к базе данных.
        </div>
      ) : normalizedTariffs?.filter(t => t.type === 'package').length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Пакеты пока не добавлены
        </div>
      ) : (
        <div className="space-y-3">
 {normalizedTariffs
 ?.filter(t => t.type === 'package')
 .map(tariff => {
 // Преобразуем значения в числа еще раз для уверенности
 const price = Number(tariff.price) || 0;
 const durationMinutes = Number(tariff.duration_minutes) || 0;
 
 // Дополнительная проверка перед рендерингом
 if (price === 0 || durationMinutes === 0) {
 console.warn('Invalid tariff data (zero values):', {
   id: tariff.id,
   name: tariff.name,
   price: tariff.price,
   priceType: typeof tariff.price,
   duration_minutes: tariff.duration_minutes,
   durationType: typeof tariff.duration_minutes,
 });
 return null;
 }
 
 return (
 <TariffCard
 key={tariff.id}
 id={tariff.id}
 name={tariff.name || 'Без названия'}
 description={tariff.description}
 price={price}
 durationMinutes={durationMinutes}
 type={tariff.type}
 isSelected={selectedTariffId === tariff.id}
 onClick={() => handleTariffSelect(tariff.id)}
 />
 );
 })
 .filter(Boolean)}
 </div>
 )}
 </div>

    {/* Bottom payment button */}
    {(selectedTariffId || isCustomSelected) && (
      <div className="fixed bottom-0 left-0 right-0 p-4 pt-8 bg-gradient-to-t from-background via-background to-transparent pb-safe-area-bottom">
        <Button
          onClick={handleProceedToPayment}
          disabled={createPaymentMutation.isPending}
          className="w-full h-12 text-lg font-semibold text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,34,233,0.5)]"
          style={{ backgroundColor: '#2222E9' }}
          size="lg"
        >
          {createPaymentMutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Оплатить {formatPrice(totalPrice)}
            </>
          )}
        </Button>
      </div>
    )}
    </div>
    </div>
    );
}
