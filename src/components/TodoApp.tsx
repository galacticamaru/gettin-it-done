
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { TaskOptionsModal } from './TaskOptionsModal';

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

  const getTaskEmoji = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('medication') || lower.includes('medicine')) return '💊';
    if (lower.includes('exercise') || lower.includes('workout')) return '💪';
    if (lower.includes('book') || lower.includes('read')) return '📚';
    if (lower.includes('shop') || lower.includes('buy')) return '🛒';
    if (lower.includes('call') || lower.includes('phone')) return '📞';
    if (lower.includes('email') || lower.includes('mail')) return '📧';
    if (lower.includes('clean')) return '🧹';
    if (lower.includes('cook') || lower.includes('food')) return '🍳';
    return '📝';
  };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  });

  const createConfetti = () => {
    const colors = ['#FDE047', '#84CC16', '#10B981', '#06B6D4', '#8B5CF6', '#F59E0B', '#EF4444'];
    const confettiElements = [];
    
    for (let i = 0; i < 50; i++) {
      const delay = Math.random() * 0.3;
      const duration = 1.5 + Math.random() * 1;
      const xMovement = (Math.random() - 0.5) * 300;
      const yMovement = -200 - Math.random() * 100;
      
      confettiElements.push(
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full opacity-0"
          style={{
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            left: `${45 + Math.random() * 10}%`,
            top: `${40 + Math.random() * 20}%`,
            animation: `confetti-fall ${duration}s ease-out ${delay}s forwards`,
            transform: `translate(${xMovement}px, ${yMovement}px) rotate(${Math.random() * 360}deg)`
          }}
        />
      );
    }
    return confettiElements;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            opacity: 1;
            transform: translate(0, 0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translate(var(--x-movement, 0), var(--y-movement, 200px)) rotate(720deg);
          }
        }
      `}</style>
      
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
        <div className="flex justify-center gap-8 text-sm mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`pb-2 transition-colors ${
              filter === 'all' 
                ? 'text-yellow-600 border-b-2 border-yellow-400' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`pb-2 transition-colors ${
              filter === 'completed' 
                ? 'text-yellow-600 border-b-2 border-yellow-400' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`pb-2 transition-colors ${
              filter === 'active' 
                ? 'text-yellow-600 border-b-2 border-yellow-400' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Active
          </button>
        </div>

        {/* Task List */}
        <div className="space-y-3 relative">
          {/* Confetti overlay */}
          {celebratingTaskId && (
            <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
              {createConfetti()}
            </div>
          )}
          
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
              <div
                key={task.id}
                className={`flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                  task.completed ? 'bg-green-50' : ''
                }`}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.completed 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {task.completed && (
                    <span className="text-white text-sm font-bold">✓</span>
                  )}
                </button>
                
                <span className="text-xl">{getTaskEmoji(task.text)}</span>
                
                <div className="flex-1">
                  <span className={`block ${
                    task.completed 
                      ? 'text-gray-500 line-through' 
                      : 'text-gray-700'
                  }`}>
                    {task.text}
                  </span>
                  {(task.dueDate || task.repeatOption || task.reminder) && (
                    <div className="text-xs text-gray-400 mt-1">
                      {task.dueDate && `Due ${new Date(task.dueDate).toLocaleDateString()}`}
                      {task.dueDate && (task.repeatOption || task.reminder) && ' • '}
                      {task.repeatOption && `Repeats ${task.repeatOption}`}
                      {task.repeatOption && task.reminder && ' • '}
                      {task.reminder && `Reminder ${task.reminder}`}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                >
                  ×
                </button>
              </div>
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
