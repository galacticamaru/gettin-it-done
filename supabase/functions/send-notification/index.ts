
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const ALLOWED_ORIGINS = [
  "https://gettin-it-done.lovable.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  };
};

interface NotificationRequest {
  title: string;
  message: string;
  userSubscriptionId: string;
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, message, userSubscriptionId }: NotificationRequest = await req.json();

    console.log('Sending notification:', { title, message, userSubscriptionId });

    const oneSignalAppId = "7077f97d-b852-4680-af6f-d0d77f9134aa";
    const oneSignalRestApiKey = Deno.env.get("ONESIGNAL_REST_API_KEY");

    if (!oneSignalRestApiKey) {
      console.error('OneSignal REST API key not found');
      return new Response(
        JSON.stringify({ error: 'OneSignal REST API key not configured' }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    if (!userSubscriptionId) {
      console.error('User subscription ID is required');
      return new Response(
        JSON.stringify({ error: 'User subscription ID is required' }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Send notification via OneSignal REST API
    const notificationPayload = {
      app_id: oneSignalAppId,
      include_subscription_ids: [userSubscriptionId],
      headings: { en: title },
      contents: { en: message },
      web_url: origin || 'https://gettin-it-done.lovable.app/',
      chrome_web_icon: '/favicon.ico',
      chrome_web_badge: '/favicon.ico',
      data: {
        source: 'getting-it-done-app',
        timestamp: new Date().toISOString()
      }
    };

    console.log('Sending to OneSignal:', notificationPayload);

    const oneSignalResponse = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${oneSignalRestApiKey}`,
      },
      body: JSON.stringify(notificationPayload),
    });

    const responseData = await oneSignalResponse.json();
    console.log('OneSignal response:', responseData);

    if (!oneSignalResponse.ok) {
      console.error('OneSignal API error:', responseData);
      return new Response(
        JSON.stringify({ error: 'Failed to send notification', details: responseData }),
        { 
          status: oneSignalResponse.status, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationId: responseData.id,
        recipients: responseData.recipients 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in send-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
