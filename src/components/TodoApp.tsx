import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FilterTabs } from './FilterTabs';
import { ThemeToggle } from './ThemeToggle';
import { SettingsDrawer } from './SettingsDrawer';
import { ProductivityStats } from './ProductivityStats';
import { DragDropContext } from './DragDropContext';
import { MobileTaskCreator } from './MobileTaskCreator';
import { DesktopTaskInput } from './DesktopTaskInput';
import { TaskList } from './TaskList';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTaskCreation } from '@/hooks/useTaskCreation';

type Filter = 'all' | 'completed' | 'active';

export const TodoApp = () => {
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const {
    tasks,
    loading,
    toggleTask,
    deleteTask,
    reorderTasks,
    refetch: fetchTasks
  } = useTasks();
  const { cancelTaskReminder } = useNotifications();
  const {
    newTask, setNewTask,
    dueDate, setDueDate,
    repeatOption, setRepeatOption,
    reminder, setReminder,
    selectedEmoji, setSelectedEmoji,
    handleAddTask
  } = useTaskCreation();

  const [filter, setFilter] = useState<Filter>('all');
  const [celebratingTaskId, setCelebratingTaskId] = useState<string | null>(null);

  const handleToggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      setCelebratingTaskId(id);
      setTimeout(() => setCelebratingTaskId(null), 2000);
    }

    if (task && !task.completed) {
      cancelTaskReminder(id);
    }
    await toggleTask(id);
  };

  const handleDeleteTask = async (id: string) => {
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading your tasks...</div>
      </div>
    );
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

          {!isMobile && (
            <DesktopTaskInput
              newTask={newTask} setNewTask={setNewTask}
              dueDate={dueDate} setDueDate={setDueDate}
              repeatOption={repeatOption} setRepeatOption={setRepeatOption}
              reminder={reminder} setReminder={setReminder}
              selectedEmoji={selectedEmoji} setSelectedEmoji={setSelectedEmoji}
              handleAddTask={handleAddTask}
            />
          )}

          <ProductivityStats tasks={tasks} />
          <FilterTabs filter={filter} onFilterChange={setFilter} />

          <TaskList
            tasks={filteredTasks}
            isMobile={isMobile}
            filter={filter}
            celebratingTaskId={celebratingTaskId}
            handleToggleTask={handleToggleTask}
            handleDeleteTask={handleDeleteTask}
            reorderTasks={reorderTasks}
            fetchTasks={fetchTasks}
          />

          {tasks.length > 0 && (
            <div className={`text-center text-sm text-muted-foreground ${isMobile ? 'mt-6 pb-4' : 'mt-8'}`}>
              <p>
                {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
              </p>
              {tasks.filter(t => t.completed).length === tasks.length && tasks.length > 0 && (
                <p className="text-green-600 font-medium mt-2 dark:text-green-400">
                  🎉 Amazing! You've completed all your tasks!
                </p>
              )}
            </div>
          )}

          {isMobile && (
            <div className="fixed bottom-20 left-4 right-4 flex justify-center">
              <Button onClick={signOut} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground bg-card border shadow-sm">
                Sign Out
              </Button>
            </div>
          )}
        </div>
        
        {isMobile && (
          <MobileTaskCreator
            newTask={newTask} setNewTask={setNewTask}
            dueDate={dueDate} setDueDate={setDueDate}
            repeatOption={repeatOption} setRepeatOption={setRepeatOption}
            reminder={reminder} setReminder={setReminder}
            selectedEmoji={selectedEmoji} setSelectedEmoji={setSelectedEmoji}
            onAddTask={handleAddTask}
          />
        )}
      </div>
    </DragDropContext>
  );
};
