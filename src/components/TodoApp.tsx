
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskOptionsModal } from './TaskOptionsModal';
import { TaskItem } from './TaskItem';
import { FilterTabs } from './FilterTabs';
import { ConfettiAnimation } from './ConfettiAnimation';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
  repeatOption?: string;
  reminder?: string;
}

type Filter = 'all' | 'completed' | 'active';

export const TodoApp = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [celebratingTaskId, setCelebratingTaskId] = useState<number | null>(null);
  
  // Task options state
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [repeatOption, setRepeatOption] = useState('none');
  const [reminder, setReminder] = useState('none');

  useEffect(() => {
    const savedTasks = localStorage.getItem('gettinItDone_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gettinItDone_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now(),
        text: newTask.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: dueDate?.toISOString(),
        repeatOption: repeatOption !== 'none' ? repeatOption : undefined,
        reminder: reminder !== 'none' ? reminder : undefined
      };
      setTasks([task, ...tasks]);
      setNewTask('');
      // Clear options after adding task
      setDueDate(undefined);
      setRepeatOption('none');
      setReminder('none');
    }
  };

  const toggleTask = (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      // Trigger celebration animation
      setCelebratingTaskId(id);
      setTimeout(() => setCelebratingTaskId(null), 2000);
    }
    
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'active') return !task.completed;
    return true;
  });

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Getting it Done!
          </h1>
          <p className="text-gray-600">
            Today is {today}. Anything new you wanna get done?
          </p>
        </div>

        {/* Add Task Input */}
        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm mb-4">
          <Input
            placeholder="Add a new task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            className="border-0 bg-transparent focus-visible:ring-0"
          />
          <Button 
            onClick={addTask}
            size="sm" 
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium px-4 py-2 rounded-full"
          >
            Add
          </Button>
        </div>

        {/* Task Options */}
        <TaskOptionsModal
          dueDate={dueDate}
          onDueDateChange={setDueDate}
          repeatOption={repeatOption}
          onRepeatChange={setRepeatOption}
          reminder={reminder}
          onReminderChange={setReminder}
        />

        {/* Filter Tabs */}
        <FilterTabs filter={filter} onFilterChange={setFilter} />

        {/* Task List */}
        <div className="space-y-3 relative">
          {/* Confetti overlay */}
          <ConfettiAnimation isVisible={celebratingTaskId !== null} />
          
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-2">
                {filter === 'all' 
                  ? "Your tasks will appear here. Try adding a task above so you can track gettin it done."
                  : filter === 'completed'
                  ? "No completed tasks yet. Get started on completing some tasks!"
                  : "No active tasks. Add a new task to get started!"
                }
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
              />
            ))
          )}
        </div>

        {/* Stats */}
        {tasks.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
            </p>
            {tasks.filter(t => t.completed).length === tasks.length && tasks.length > 0 && (
              <p className="text-green-600 font-medium mt-2">
                🎉 Amazing! You've completed all your tasks!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
