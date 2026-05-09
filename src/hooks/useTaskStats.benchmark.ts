import { useTaskStats } from "./useTaskStats";
import { Task } from "./useTasks";
import { subDays } from "date-fns";
import { performance } from "perf_hooks";

// Mock React.useMemo to just execute the callback
// (The actual file imports useMemo but we can just call the hook function)
// Actually useTaskStats is a hook, it might need more mocking if it used more than useMemo.
// It only uses useMemo.

const createTask = (id: number, updatedAt: string): Task => ({
  id: id.toString(),
  text: `Task ${id}`,
  completed: true,
  createdAt: updatedAt,
  updatedAt: updatedAt,
  sortOrder: id,
});

const generateTasks = (count: number): Task[] => {
  const tasks: Task[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    // Distribute tasks over 100 days to have many unique dates and many duplicates
    const date = subDays(now, i % 100);
    tasks.push(createTask(i, date.toISOString()));
  }
  return tasks;
};

const runBenchmark = (taskCount: number, iterations: number) => {
  const tasks = generateTasks(taskCount);

  // Warm up
  for (let i = 0; i < 5; i++) {
    useTaskStats(tasks);
  }

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    useTaskStats(tasks);
  }
  const end = performance.now();

  console.log(`Task count: ${taskCount}`);
  console.log(`Iterations: ${iterations}`);
  console.log(`Total time: ${(end - start).toFixed(2)}ms`);
  console.log(`Average time: ${((end - start) / iterations).toFixed(4)}ms`);
};

console.log("Running baseline benchmark...");
runBenchmark(1000, 100);
runBenchmark(5000, 20);
