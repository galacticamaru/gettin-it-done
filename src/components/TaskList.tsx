import { ConfettiAnimation } from './ConfettiAnimation';
import { MobileTaskItem } from './MobileTaskItem';
import { TaskItem } from './TaskItem';
import { ListTodo, CircleCheck, List } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
  repeatOption?: string;
  reminder?: string;
  emoji?: string;
}

interface TaskListProps {
  tasks: Task[];
  isMobile: boolean;
  filter: 'all' | 'completed' | 'active';
  celebratingTaskId: string | null;
  handleToggleTask: (id: string) => Promise<void>;
  handleDeleteTask: (id: string) => Promise<void>;
  reorderTasks: (dragId: string, hoverId: string) => void;
  fetchTasks: () => Promise<void>;
}

export const TaskList = ({
  tasks,
  isMobile,
  filter,
  celebratingTaskId,
  handleToggleTask,
  handleDeleteTask,
  reorderTasks,
  fetchTasks
}: TaskListProps) => {
  const getEmptyStateTitle = () => {
    if (filter === 'all') return "No tasks yet";
    if (filter === 'completed') return "No completed tasks";
    return "No active tasks";
  };

  const getEmptyStateMessage = () => {
    if (filter === 'all') return "Your tasks will appear here. Try adding a task above to start gettin' it done.";
    if (filter === 'completed') return "You haven't completed any tasks yet. Get started on checking things off!";
    return "You have no active tasks at the moment. Add a new task to get started!";
  };

  const getEmptyStateIcon = () => {
    if (filter === 'all') return <ListTodo className="w-10 h-10 text-muted-foreground/50" aria-hidden="true" />;
    if (filter === 'completed') return <CircleCheck className="w-10 h-10 text-muted-foreground/50" aria-hidden="true" />;
    return <List className="w-10 h-10 text-muted-foreground/50" aria-hidden="true" />;
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-secondary/10 border-2 border-dashed border-border rounded-2xl mx-4 my-8">
      <div className="bg-background w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm border">
        {getEmptyStateIcon()}
      </div>
      <h3 className="text-xl font-semibold mb-2">{getEmptyStateTitle()}</h3>
      <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-base'} max-w-sm mx-auto`}>
        {getEmptyStateMessage()}
      </p>
    </div>
  );

  if (isMobile) {
    return (
      <div className="space-y-3 relative pb-24">
        <ConfettiAnimation isVisible={celebratingTaskId !== null} />

        {tasks.length === 0 ? (
          <EmptyState />
        ) : (
          tasks.map(task => (
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
    );
  }

  return (
    <div className="space-y-3 relative">
      <ConfettiAnimation isVisible={celebratingTaskId !== null} />

      {tasks.length === 0 ? (
        <EmptyState />
      ) : (
        tasks.map(task => (
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
  );
};
