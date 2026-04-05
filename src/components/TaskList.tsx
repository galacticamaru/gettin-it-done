import { ClipboardList } from 'lucide-react';
import { ConfettiAnimation } from './ConfettiAnimation';
import { MobileTaskItem } from './MobileTaskItem';
import { TaskItem } from './TaskItem';

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
    if (filter === 'all') return { title: "No tasks yet", description: "Your tasks will appear here. Try adding a task above so you can track gettin it done." };
    if (filter === 'completed') return { title: "No completed tasks", description: "No completed tasks yet. Get started on completing some tasks!" };
    return { title: "All caught up!", description: "No active tasks. Add a new task to get started!" };
  };

  const EmptyState = () => {
    const { title, description } = getEmptyStateMessage();
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-secondary/10 rounded-2xl border border-dashed border-border/50">
        <div className="bg-secondary/30 p-4 rounded-full mb-4">
          <ClipboardList className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="font-semibold text-lg mb-2 text-foreground">{title}</h3>
        <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-base max-w-sm'}`}>
          {description}
        </p>
      </div>
    );
  };

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
