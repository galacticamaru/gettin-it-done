
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

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

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

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

    // Fetch tasks for all users at once
    const userIds = usersWithDigest.map(u => u.user_id);

    // Chunk userIds to avoid URL length limits if there are many users
    const chunkSize = 100;
    const allTasks = [];

    for (let i = 0; i < userIds.length; i += chunkSize) {
      const chunk = userIds.slice(i, i + chunkSize);
      const { data: tasks, error: tasksError } = await supabase
        .from('user_tasks')
        .select('user_id, text, completed, due_date, reminder')
        .in('user_id', chunk)
        .or(`due_date.gte.${today.toISOString()},due_date.lt.${tomorrow.toISOString()},due_date.is.null`)
        .order('completed', { ascending: true })
        .order('created_at', { ascending: false });

      if (tasksError) {
        console.error('Error fetching tasks batch:', tasksError);
        continue;
      }

      if (tasks) {
        allTasks.push(...tasks);
      }
    }

    // Group tasks by user
    const tasksByUser = allTasks.reduce((acc, task) => {
      if (!acc[task.user_id]) {
        acc[task.user_id] = [];
      }
      acc[task.user_id].push(task);
      return acc;
    }, {} as Record<string, { text: string; completed: boolean; due_date: string | null; reminder: string | null }[]>);

    // Process each user
    for (const userPref of usersWithDigest) {
      try {
        const tasks = tasksByUser[userPref.user_id] || [];

        if (tasks.length === 0) {
          console.log(`No tasks found for user ${userPref.user_id}, skipping digest`);
          continue;
        }

        // Create digest summary
        const activeTasks = [];
        const completedTasks = [];
        const dueTasks = [];

        for (const task of tasks) {
          if (task.completed) {
            completedTasks.push(task);
          } else {
            activeTasks.push(task);
          }

          if (task.due_date) {
            const dueDate = new Date(task.due_date);
            if (dueDate >= today && dueDate < tomorrow) {
              dueTasks.push(task);
            }
          }
        }

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

  } catch (error: unknown) {
    console.error('Error in send-daily-digest function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
