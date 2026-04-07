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
  const getEmptyStateMessage = () => {
    if (filter === 'all') return "Your tasks will appear here. Try adding a task above so you can track gettin it done.";
    if (filter === 'completed') return "No completed tasks yet. Get started on completing some tasks!";
    return "No active tasks. Add a new task to get started!";
  };

  const getEmptyStateIcon = () => {
    if (filter === 'all') return <ListTodo className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" aria-hidden="true" />;
    if (filter === 'completed') return <CircleCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" aria-hidden="true" />;
    return <List className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" aria-hidden="true" />;
  };

  const EmptyState = () => (
    <div className="text-center py-12 flex flex-col items-center justify-center">
      {getEmptyStateIcon()}
      <p className={`text-muted-foreground mb-2 ${isMobile ? 'text-sm px-4' : ''}`}>
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
