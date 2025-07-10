import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
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
    const currentDay = now.getUTCDay() // 0 = Sunday, 1 = Monday, etc.
    const currentDate = now.getUTCDate()
    
    console.log(`Reset recurring tasks triggered at ${now.toISOString()}`)
    console.log(`Current day: ${currentDay}, Current date: ${currentDate}`)

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

    const tasksToReset: string[] = []

    // Check each task to see if it should be reset
    for (const task of completedTasks) {
      let shouldReset = false

      switch (task.repeat_option) {
        case 'Daily':
          // Reset daily tasks every day at 14 UTC
          shouldReset = true
          break
        
        case 'Weekly':
          // Reset weekly tasks every Monday (day 1) at 14 UTC
          shouldReset = currentDay === 1
          break
        
        case 'Monthly':
          // Reset monthly tasks on the 1st of each month at 14 UTC
          shouldReset = currentDate === 1
          break
      }

      if (shouldReset) {
        tasksToReset.push(task.id)
        console.log(`Resetting ${task.repeat_option} task: ${task.text} (ID: ${task.id})`)
      }
    }

    if (tasksToReset.length === 0) {
      console.log('No tasks need to be reset at this time')
      return new Response(
        JSON.stringify({ message: 'No tasks need to be reset at this time', resetCount: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Reset the tasks back to active (completed = false)
    const { error: updateError } = await supabase
      .from('user_tasks')
      .update({ 
        completed: false,
        updated_at: new Date().toISOString()
      })
      .in('id', tasksToReset)

    if (updateError) {
      console.error('Error resetting tasks:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to reset tasks' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Successfully reset ${tasksToReset.length} recurring tasks`)

    return new Response(
      JSON.stringify({ 
        message: `Successfully reset ${tasksToReset.length} recurring tasks`,
        resetCount: tasksToReset.length,
        resetTaskIds: tasksToReset
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