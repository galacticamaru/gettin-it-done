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
import { BottomNav } from './BottomNav';
import { useTasks } from '@/hooks/useTasks';
import { User } from 'lucide-react';
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
    addTask,
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
  } = useTaskCreation(addTask);

  const [filter, setFilter] = useState<Filter>('active');
  const [navTab, setNavTab] = useState<'home' | 'tasks' | 'completed' | 'profile'>('home');
  const [celebratingTaskId, setCelebratingTaskId] = useState<string | null>(null);

  // Sync nav tab with filter
  const handleNavTabChange = (tab: 'home' | 'tasks' | 'completed' | 'profile') => {
    setNavTab(tab);
    if (tab === 'home') setFilter('all');
    if (tab === 'tasks') setFilter('active');
    if (tab === 'completed') setFilter('completed');
    if (tab === 'profile') {
      // Profile tab might show something else or we could prompt sign out.
      // For now we'll show all tasks but we can also trigger sign out or open a profile modal if requested later.
      // Will just act as 'all' for now until actual profile section is implemented.
    }
  };

  // Sync filter with nav tab (if filter tabs are still used on desktop/mobile)
  const handleFilterChange = (newFilter: Filter) => {
    setFilter(newFilter);
    if (newFilter === 'all') setNavTab('home');
    if (newFilter === 'active') setNavTab('tasks');
    if (newFilter === 'completed') setNavTab('completed');
  };

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
      <div className={`min-h-screen bg-background ${isMobile ? 'mobile-scroll pb-24' : ''}`}>
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
          {!isMobile && <FilterTabs filter={filter} onFilterChange={handleFilterChange} />}

          {isMobile && navTab === 'profile' ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                <User size={40} className="opacity-50" />
              </div>
              <p className="text-lg font-medium">{user?.email}</p>
              <Button onClick={signOut} variant="outline" className="mt-4">
                Sign Out
              </Button>
            </div>
          ) : (
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
          )}

          {tasks.length > 0 && navTab !== 'profile' && (
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

        </div>
        
        {isMobile && navTab !== 'profile' && (
          <MobileTaskCreator
            newTask={newTask} setNewTask={setNewTask}
            dueDate={dueDate} setDueDate={setDueDate}
            repeatOption={repeatOption} setRepeatOption={setRepeatOption}
            reminder={reminder} setReminder={setReminder}
            selectedEmoji={selectedEmoji} setSelectedEmoji={setSelectedEmoji}
            onAddTask={handleAddTask}
          />
        )}

        {isMobile && (
          <BottomNav currentTab={navTab} onTabChange={handleNavTabChange} />
        )}
      </div>
    </DragDropContext>
  );
};
