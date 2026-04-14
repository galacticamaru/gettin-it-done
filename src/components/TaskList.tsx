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
  const getEmptyStateContent = () => {
    if (filter === 'all') {
      return {
        title: "No tasks yet",
        description: "Your tasks will appear here. Try adding a task above so you can track gettin it done.",
        icon: <ListTodo className="w-8 h-8 text-muted-foreground/50" aria-hidden="true" />
      };
    }
    if (filter === 'completed') {
      return {
        title: "Nothing completed yet",
        description: "No completed tasks yet. Get started on completing some tasks!",
        icon: <CircleCheck className="w-8 h-8 text-muted-foreground/50" aria-hidden="true" />
      };
    }
    return {
      title: "All caught up!",
      description: "No active tasks. Add a new task to get started!",
      icon: <List className="w-8 h-8 text-muted-foreground/50" aria-hidden="true" />
    };
  };

  const EmptyState = () => {
    const content = getEmptyStateContent();

    return (
      <div className="text-center py-12 flex flex-col items-center justify-center border-2 border-dashed border-border/60 bg-secondary/10 rounded-2xl mx-2 my-4">
        <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
          {content.icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{content.title}</h3>
        <p className={`text-muted-foreground max-w-[250px] ${isMobile ? 'text-sm' : ''}`}>
          {content.description}
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
