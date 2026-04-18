import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const now = new Date()
    const currentMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    
    console.log(`Reset recurring tasks triggered at ${now.toISOString()}`)

    // Get all completed tasks with repeat options
    const { data: completedTasks, error: fetchError } = await supabase
      .from('user_tasks')
      .select('*')
      .eq('completed', true)
      .not('repeat_option', 'is', null)

    if (fetchError) {
      console.error('Error fetching completed tasks:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch tasks' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!completedTasks || completedTasks.length === 0) {
      console.log('No completed recurring tasks found')
      return new Response(
        JSON.stringify({ message: 'No completed recurring tasks found', resetCount: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const tasksToDuplicate: Record<string, any>[] = []
    const oldTaskIdsToUpdate: string[] = []
    const userIds = new Set<string>()

    // Check each task to see if it should be reset (duplicated)
    for (const task of completedTasks) {
      const createdAtDate = new Date(task.created_at)
      const targetDate = new Date(Date.UTC(createdAtDate.getUTCFullYear(), createdAtDate.getUTCMonth(), createdAtDate.getUTCDate()))
      let shouldDuplicate = false

      switch (task.repeat_option) {
        case 'Daily':
          targetDate.setUTCDate(targetDate.getUTCDate() + 1)
          shouldDuplicate = currentMs >= targetDate.getTime()
          break
        
        case 'Weekly':
          targetDate.setUTCDate(targetDate.getUTCDate() + 7)
          shouldDuplicate = currentMs >= targetDate.getTime()
          break
        
        case 'Monthly':
          targetDate.setUTCMonth(targetDate.getUTCMonth() + 1)
          shouldDuplicate = currentMs >= targetDate.getTime()
          break
      }

      if (shouldDuplicate) {
        tasksToDuplicate.push(task)
        oldTaskIdsToUpdate.push(task.id)
        userIds.add(task.user_id)
        console.log(`Duplicating ${task.repeat_option} task: ${task.text} (ID: ${task.id})`)
      }
    }

    if (tasksToDuplicate.length === 0) {
      console.log('No tasks need to be duplicated at this time')
      return new Response(
        JSON.stringify({ message: 'No tasks need to be duplicated at this time', resetCount: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get min sort_order for each user
    const userMinSortOrders: Record<string, number> = {}

    for (const userId of userIds) {
        const { data: minTaskData, error: minTaskError } = await supabase
            .from('user_tasks')
            .select('sort_order')
            .eq('user_id', userId)
            .order('sort_order', { ascending: true })
            .limit(1)
            .maybeSingle()

        if (!minTaskError && minTaskData && typeof minTaskData.sort_order === 'number') {
            userMinSortOrders[userId] = minTaskData.sort_order - 1;
        } else {
            userMinSortOrders[userId] = 0;
        }
    }

    // Prepare new tasks for insertion
    const newTasksToInsert = []

    for (const task of tasksToDuplicate) {
        const currentMinSortOrder = userMinSortOrders[task.user_id];

        newTasksToInsert.push({
            user_id: task.user_id,
            text: task.text,
            due_date: task.due_date, // Keep due date
            emoji: task.emoji,
            reminder: task.reminder,
            repeat_option: task.repeat_option,
            completed: false,
            sort_order: currentMinSortOrder
        })

        // Decrement for the next task of this user
        userMinSortOrders[task.user_id] = currentMinSortOrder - 1;
    }

    // 1. Update old completed tasks to clear repeat_option
    const { error: updateError } = await supabase
      .from('user_tasks')
      .update({ 
        repeat_option: null,
        updated_at: new Date().toISOString()
      })
      .in('id', oldTaskIdsToUpdate)

    if (updateError) {
      console.error('Error updating old tasks:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update old tasks' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Insert new duplicated tasks
    const { error: insertError } = await supabase
        .from('user_tasks')
        .insert(newTasksToInsert)

    if (insertError) {
        console.error('Error inserting new tasks:', insertError)
        return new Response(
            JSON.stringify({ error: 'Failed to insert new tasks' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    console.log(`Successfully duplicated ${newTasksToInsert.length} recurring tasks`)

    return new Response(
      JSON.stringify({ 
        message: `Successfully duplicated ${newTasksToInsert.length} recurring tasks`,
        resetCount: newTasksToInsert.length,
        resetTaskIds: oldTaskIdsToUpdate
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in reset-recurring-tasks function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
