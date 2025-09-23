
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
import { MobileTaskCreator } from './MobileTaskCreator';
import { MobileTaskItem } from './MobileTaskItem';
import { PullToRefresh } from './PullToRefresh';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useIsMobile } from '@/hooks/use-mobile';

type Filter = 'all' | 'completed' | 'active';

export const TodoApp = () => {
  const isMobile = useIsMobile();
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
    reorderTasks,
    refetch: fetchTasks
  } = useTasks();
  const {
    scheduleTaskReminder,
    scheduleDueDateNotification,
    cancelTaskReminder
  } = useNotifications();
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [celebratingTaskId, setCelebratingTaskId] = useState<string | null>(null);

  // Task options state - using string format for mobile compatibility
  const [dueDate, setDueDate] = useState('');
  const [repeatOption, setRepeatOption] = useState('');
  const [reminder, setReminder] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('');

  const handleAddTask = async () => {
    if (newTask.trim()) {
      const taskData = {
        text: newTask.trim(),
        dueDate: dueDate ? new Date(dueDate) : undefined,
        repeatOption: repeatOption || undefined,
        reminder: reminder || undefined,
        emoji: selectedEmoji || undefined,
      };

      try {
        const taskId = await addTask(taskData);
        if (taskId) {
          // Schedule notifications if due date or reminder is set
          if (taskData.dueDate) {
            await scheduleDueDateNotification(taskId, taskData.text, taskData.dueDate);
          }

          if (taskData.reminder && taskData.reminder !== '') {
            await scheduleTaskReminder(taskId, taskData.text, taskData.dueDate, taskData.reminder);
          }
        }

        setNewTask('');
        setDueDate('');
        setRepeatOption('');
        setReminder('');
        setSelectedEmoji('');
      } catch (error) {
        console.error('Error adding task:', error);
      }
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
      <div className={`min-h-screen bg-background ${isMobile ? 'mobile-scroll' : ''}`}>
        <div className={`${isMobile ? 'px-4 py-4' : 'max-w-md mx-auto px-6 py-8'}`}>
          <div className={`flex justify-between items-start ${isMobile ? 'mb-6' : 'mb-8'}`}>
            <div className="text-center flex-1">
              <h1 className={`font-bold text-foreground mb-2 text-left ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                Getting it Done!
              </h1>
              <p className={`text-muted-foreground text-left ${isMobile ? 'text-sm' : ''}`}>
                Today is {today}. Anything new you wanna get done?
              </p>
            </div>
            <div className="flex items-center gap-2">
              <SettingsDrawer />
              <ThemeToggle />
              {!isMobile && (
                <Button onClick={signOut} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Sign Out
                </Button>
              )}
            </div>
          </div>

          {/* Desktop Task Input */}
          {!isMobile && (
            <>
              <div className="flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm mb-4 border">
                <EmojiPicker selectedEmoji={selectedEmoji} onEmojiSelect={setSelectedEmoji} />
                <Input placeholder="Add a new task" value={newTask} onChange={e => setNewTask(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAddTask()} className="border-0 bg-transparent focus-visible:ring-0" />
                <Button onClick={handleAddTask} size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium px-4 py-2 rounded-full dark:bg-yellow-500 dark:hover:bg-yellow-600">
                  Add
                </Button>
              </div>

              {/* Task Options */}
              <TaskOptionsModal dueDate={dueDate ? new Date(dueDate) : undefined} onDueDateChange={(date) => setDueDate(date ? date.toISOString() : '')} repeatOption={repeatOption} onRepeatChange={setRepeatOption} reminder={reminder} onReminderChange={setReminder} />
            </>
          )}

          {/* Filter Tabs */}
          <FilterTabs filter={filter} onFilterChange={setFilter} />

          {/* Task List with Pull-to-Refresh on Mobile */}
          {isMobile ? (
            <PullToRefresh onRefresh={async () => { await fetchTasks(); }}>
              <div className="space-y-3 relative pb-24">
                {/* Confetti overlay */}
                <ConfettiAnimation isVisible={celebratingTaskId !== null} />
                
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-2 text-sm px-4">
                      {filter === 'all' ? "Your tasks will appear here. Try adding a task above so you can track gettin it done." : filter === 'completed' ? "No completed tasks yet. Get started on completing some tasks!" : "No active tasks. Add a new task to get started!"}
                    </p>
                  </div>
                ) : (
                  filteredTasks.map(task => (
                    <MobileTaskItem 
                      key={task.id} 
                      task={task}
                      onToggle={handleToggleTask} 
                      onDelete={handleDeleteTask}
                      onReorder={reorderTasks}
                    />
                  ))
                )}
              </div>
            </PullToRefresh>
          ) : (
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
                    task={task}
                    onToggle={handleToggleTask} 
                    onDelete={handleDeleteTask}
                    onReorder={reorderTasks}
                  />
                ))
              )}
            </div>
          )}

          {/* Stats */}
          {tasks.length > 0 && <div className={`text-center text-sm text-muted-foreground ${isMobile ? 'mt-6 pb-4' : 'mt-8'}`}>
              <p>
                {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
              </p>
              {tasks.filter(t => t.completed).length === tasks.length && tasks.length > 0 && <p className="text-green-600 font-medium mt-2 dark:text-green-400">
                🎉 Amazing! You've completed all your tasks!
              </p>}
            </div>}

          {/* Mobile sign out button */}
          {isMobile && (
            <div className="fixed bottom-20 left-4 right-4 flex justify-center">
              <Button onClick={signOut} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground bg-card border shadow-sm">
                Sign Out
              </Button>
            </div>
          )}
        </div>
        
        {/* Mobile Task Creator */}
        {isMobile && (
          <MobileTaskCreator
            newTask={newTask}
            setNewTask={setNewTask}
            dueDate={dueDate}
            setDueDate={setDueDate}
            repeatOption={repeatOption}
            setRepeatOption={setRepeatOption}
            reminder={reminder}
            setReminder={setReminder}
            selectedEmoji={selectedEmoji}
            setSelectedEmoji={setSelectedEmoji}
            onAddTask={handleAddTask}
          />
        )}
      </div>
    </DragDropContext>
  );
};
