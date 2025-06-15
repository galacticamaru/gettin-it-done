
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskOptionsModal } from './TaskOptionsModal';
import { TaskItem } from './TaskItem';
import { FilterTabs } from './FilterTabs';
import { ConfettiAnimation } from './ConfettiAnimation';
import { EmojiPicker } from './EmojiPicker';
import { ThemeToggle } from './ThemeToggle';
import { SettingsDrawer } from './SettingsDrawer';
import { DragDropContext } from './DragDropContext';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';

type Filter = 'all' | 'completed' | 'active';

export const TodoApp = () => {
  const {
    user,
    signOut
  } = useAuth();
  const {
    tasks,
    loading,
    addTask,
    toggleTask,
    deleteTask,
    reorderTasks
  } = useTasks();
  const {
    scheduleTaskReminder,
    scheduleDueDateNotification,
    cancelTaskReminder
  } = useNotifications();
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [celebratingTaskId, setCelebratingTaskId] = useState<string | null>(null);

  // Task options state
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [repeatOption, setRepeatOption] = useState('none');
  const [reminder, setReminder] = useState('none');
  const [selectedEmoji, setSelectedEmoji] = useState('');

  const handleAddTask = async () => {
    if (newTask.trim()) {
      const taskData = {
        text: newTask.trim(),
        dueDate,
        repeatOption,
        reminder,
        emoji: selectedEmoji
      };
      const taskId = await addTask(taskData);
      if (taskId) {
        // Schedule reminder if one was set
        if (reminder !== 'none') {
          await scheduleTaskReminder(taskId, newTask.trim(), dueDate, reminder);
        }

        // Schedule due date notifications if due date is set
        if (dueDate) {
          await scheduleDueDateNotification(taskId, newTask.trim(), dueDate);
        }
      }
      setNewTask('');
      // Clear options after adding task
      setDueDate(undefined);
      setRepeatOption('none');
      setReminder('none');
      setSelectedEmoji('');
    }
  };
  const handleToggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      // Trigger celebration animation
      setCelebratingTaskId(id);
      setTimeout(() => setCelebratingTaskId(null), 2000);
    }

    // Cancel reminder when task is completed
    if (task && !task.completed) {
      cancelTaskReminder(id);
    }
    await toggleTask(id);
  };
  const handleDeleteTask = async (id: string) => {
    // Cancel reminder when task is deleted
    cancelTaskReminder(id);
    await deleteTask(id);
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
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading your tasks...</div>
      </div>;
  }
  return (
    <DragDropContext>
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto px-6 py-8">
          <div className="flex justify-between items-start mb-8">
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-2 text-left">
                Getting it Done!
              </h1>
              <p className="text-muted-foreground text-left">
                Today is {today}. Anything new you wanna get done?
              </p>
            </div>
            <div className="flex items-center gap-2">
              <SettingsDrawer />
              <ThemeToggle />
              <Button onClick={signOut} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Sign Out
              </Button>
            </div>
          </div>

          {/* Add Task Input */}
          <div className="flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm mb-4 border">
            <EmojiPicker selectedEmoji={selectedEmoji} onEmojiSelect={setSelectedEmoji} />
            <Input placeholder="Add a new task" value={newTask} onChange={e => setNewTask(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAddTask()} className="border-0 bg-transparent focus-visible:ring-0" />
            <Button onClick={handleAddTask} size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium px-4 py-2 rounded-full dark:bg-yellow-500 dark:hover:bg-yellow-600">
              Add
            </Button>
          </div>

          {/* Task Options */}
          <TaskOptionsModal dueDate={dueDate} onDueDateChange={setDueDate} repeatOption={repeatOption} onRepeatChange={setRepeatOption} reminder={reminder} onReminderChange={setReminder} />

          {/* Filter Tabs */}
          <FilterTabs filter={filter} onFilterChange={setFilter} />

          {/* Task List */}
          <div className="space-y-3 relative">
            {/* Confetti overlay */}
            <ConfettiAnimation isVisible={celebratingTaskId !== null} />
            
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-2">
                  {filter === 'all' ? "Your tasks will appear here. Try adding a task above so you can track gettin it done." : filter === 'completed' ? "No completed tasks yet. Get started on completing some tasks!" : "No active tasks. Add a new task to get started!"}
                </p>
              </div>
            ) : (
              filteredTasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} // Pass the task directly without converting ID
                  onToggle={handleToggleTask} 
                  onDelete={handleDeleteTask}
                  onReorder={reorderTasks}
                />
              ))
            )}
          </div>

          {/* Stats */}
          {tasks.length > 0 && <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>
                {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
              </p>
              {tasks.filter(t => t.completed).length === tasks.length && tasks.length > 0 && <p className="text-green-600 font-medium mt-2 dark:text-green-400">
                🎉 Amazing! You've completed all your tasks!
              </p>}
            </div>}
        </div>
      </div>
    </DragDropContext>
  );
};
