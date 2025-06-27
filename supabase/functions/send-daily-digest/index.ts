
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting daily digest notification process...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users who have daily digest enabled AND have a valid OneSignal subscription
    const { data: usersWithDigest, error: usersError } = await supabase
      .from('user_preferences')
      .select('user_id, onesignal_subscription_id')
      .eq('daily_digest_enabled', true)
      .not('onesignal_subscription_id', 'is', null);

    if (usersError) {
      console.error('Error fetching users with digest enabled:', usersError);
      throw usersError;
    }

    console.log(`Found ${usersWithDigest?.length || 0} users with daily digest enabled and valid OneSignal subscriptions`);

    if (!usersWithDigest || usersWithDigest.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users with daily digest enabled and valid OneSignal subscriptions' }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let digestsSent = 0;

    // Process each user
    for (const userPref of usersWithDigest) {
      try {
        // Get user's tasks for today
        const { data: tasks, error: tasksError } = await supabase
          .from('user_tasks')
          .select('text, completed, due_date, reminder')
          .eq('user_id', userPref.user_id)
          .or(`due_date.gte.${today.toISOString()},due_date.lt.${tomorrow.toISOString()},due_date.is.null`)
          .order('completed', { ascending: true })
          .order('created_at', { ascending: false });

        if (tasksError) {
          console.error(`Error fetching tasks for user ${userPref.user_id}:`, tasksError);
          continue;
        }

        if (!tasks || tasks.length === 0) {
          console.log(`No tasks found for user ${userPref.user_id}, skipping digest`);
          continue;
        }

        // Create digest summary
        const activeTasks = tasks.filter(task => !task.completed);
        const completedTasks = tasks.filter(task => task.completed);
        const dueTasks = tasks.filter(task => 
          task.due_date && 
          new Date(task.due_date) >= today && 
          new Date(task.due_date) < tomorrow
        );

        let digestMessage = '📋 Your Daily Task Digest:\n\n';
        
        if (activeTasks.length > 0) {
          digestMessage += `📝 Active Tasks (${activeTasks.length}):\n`;
          activeTasks.slice(0, 5).forEach(task => {
            digestMessage += `• ${task.text}\n`;
          });
          if (activeTasks.length > 5) {
            digestMessage += `...and ${activeTasks.length - 5} more\n`;
          }
          digestMessage += '\n';
        }

        if (dueTasks.length > 0) {
          digestMessage += `⏰ Due Today (${dueTasks.length}):\n`;
          dueTasks.forEach(task => {
            digestMessage += `• ${task.text}\n`;
          });
          digestMessage += '\n';
        }

        if (completedTasks.length > 0) {
          digestMessage += `✅ Completed (${completedTasks.length}):\n`;
          completedTasks.slice(0, 3).forEach(task => {
            digestMessage += `• ${task.text}\n`;
          });
          if (completedTasks.length > 3) {
            digestMessage += `...and ${completedTasks.length - 3} more\n`;
          }
        }

        // Send digest notification using the real OneSignal subscription ID
        const notificationResponse = await fetch('https://gdopicetwkrzihvwikwu.supabase.co/functions/v1/send-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'Daily Task Digest 📋',
            message: digestMessage,
            userSubscriptionId: userPref.onesignal_subscription_id
          }),
        });

        if (notificationResponse.ok) {
          digestsSent++;
          console.log(`Digest sent successfully to user ${userPref.user_id} with subscription ${userPref.onesignal_subscription_id}`);
        } else {
          const errorData = await notificationResponse.text();
          console.error(`Failed to send digest to user ${userPref.user_id}:`, errorData);
        }

      } catch (error) {
        console.error(`Error processing digest for user ${userPref.user_id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Daily digest sent to ${digestsSent} users`,
        usersProcessed: usersWithDigest.length,
        digestsSent 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in send-daily-digest function:', error);
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
