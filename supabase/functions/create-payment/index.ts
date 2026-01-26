import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { telegramUserId, tariffId, customHours, amount, durationMinutes } = await req.json();

    if (!telegramUserId || !amount || !durationMinutes) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        telegram_user_id: telegramUserId,
        tariff_id: tariffId || null,
        custom_hours: customHours || null,
        amount,
        status: 'pending',
        // Demo: simulating ЮKassa payment URL
        confirmation_url: `https://yookassa.ru/demo/payment?amount=${amount}`,
        external_payment_id: `demo_${Date.now()}`,
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // For demo: auto-complete payment after 5 seconds (in production, this would be a webhook)
    // Simulate successful payment
    setTimeout(async () => {
      const { error: updateError } = await supabase
        .from('payments')
        .update({ status: 'succeeded' })
        .eq('id', payment.id);

      if (!updateError) {
        // Generate activation code
        const { data: codeResult } = await supabase.rpc('generate_activation_code');
        const code = codeResult || `DEMO${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        await supabase.from('activation_codes').insert({
          code,
          payment_id: payment.id,
          duration_minutes: durationMinutes,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }, 5000);

    return new Response(JSON.stringify({
      paymentId: payment.id,
      confirmationUrl: payment.confirmation_url,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});