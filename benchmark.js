import { performance } from 'perf_hooks';

// Mock Supabase client
class MockSupabaseClient {
  constructor() {
    this.queryCount = 0;
  }

  from(table) {
    return this;
  }

  select(columns) {
    return this;
  }

  eq(column, value) {
    return this;
  }

  or(query) {
    return this;
  }

  order(column, options) {
    return this;
  }

  in(column, values) {
      return this;
  }

  async then(resolve, reject) {
    this.queryCount++;
    // Simulate network latency of 50ms per query
    await new Promise(r => setTimeout(r, 50));

    // Return dummy data
    resolve({ data: [{ text: 'Task 1', completed: false, due_date: new Date().toISOString(), reminder: null }], error: null });
  }
}

async function runBenchmarkBaseline() {
  console.log('--- Running Baseline N+1 Benchmark ---');
  const supabase = new MockSupabaseClient();

  // Simulate 100 users
  const usersWithDigest = Array.from({ length: 100 }, (_, i) => ({ user_id: `user_${i}`, onesignal_subscription_id: `sub_${i}` }));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const startTime = performance.now();

  // N+1 behavior
  for (const userPref of usersWithDigest) {
    const { data: tasks, error: tasksError } = await supabase
      .from('user_tasks')
      .select('text, completed, due_date, reminder')
      .eq('user_id', userPref.user_id)
      .or(`due_date.gte.${today.toISOString()},due_date.lt.${tomorrow.toISOString()},due_date.is.null`)
      .order('completed', { ascending: true })
      .order('created_at', { ascending: false });
  }

  const endTime = performance.now();
  console.log(`Baseline executed ${supabase.queryCount} queries in ${endTime - startTime}ms`);
}

async function runBenchmarkOptimized() {
  console.log('--- Running Optimized Batch Benchmark ---');
  const supabase = new MockSupabaseClient();

  // Simulate 100 users
  const usersWithDigest = Array.from({ length: 100 }, (_, i) => ({ user_id: `user_${i}`, onesignal_subscription_id: `sub_${i}` }));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const startTime = performance.now();

  // Optimized behavior: fetch all tasks in one query
  const userIds = usersWithDigest.map(u => u.user_id);

  const { data: tasks, error: tasksError } = await supabase
      .from('user_tasks')
      .select('user_id, text, completed, due_date, reminder')
      .in('user_id', userIds)
      .or(`due_date.gte.${today.toISOString()},due_date.lt.${tomorrow.toISOString()},due_date.is.null`)
      .order('completed', { ascending: true })
      .order('created_at', { ascending: false });

  // Group tasks by user_id
  const tasksByUser = {};
  if (tasks) {
      for (const task of tasks) {
          if (!tasksByUser[task.user_id]) {
              tasksByUser[task.user_id] = [];
          }
          tasksByUser[task.user_id].push(task);
      }
  }

  for (const userPref of usersWithDigest) {
      const userTasks = tasksByUser[userPref.user_id] || [];
  }

  const endTime = performance.now();
  console.log(`Optimized executed ${supabase.queryCount} queries in ${endTime - startTime}ms`);
}

async function main() {
    await runBenchmarkBaseline();
    await runBenchmarkOptimized();
}

main().catch(console.error);