
interface Task {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
  repeatOption?: string;
  reminder?: string;
  emoji?: string;
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export const TaskItem = ({ task, onToggle, onDelete }: TaskItemProps) => {
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

  return (
    <div
      className={`flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md border ${
        task.completed ? 'bg-green-50 dark:bg-green-950/30' : ''
      }`}
    >
      <button
        onClick={() => onToggle(task.id)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          task.completed 
            ? 'bg-green-500 border-green-500' 
            : 'border-border hover:border-green-400'
        }`}
      >
        {task.completed && (
          <span className="text-white text-sm font-bold">✓</span>
        )}
      </button>
      
      <span className="text-xl">
        {task.emoji || getTaskEmoji(task.text)}
      </span>
      
      <div className="flex-1">
        <span className={`block ${
          task.completed 
            ? 'text-muted-foreground line-through' 
            : 'text-foreground'
        }`}>
          {task.text}
        </span>
        {(task.dueDate || task.repeatOption || task.reminder) && (
          <div className="text-xs text-muted-foreground mt-1">
            {task.dueDate && `Due ${new Date(task.dueDate).toLocaleDateString()}`}
            {task.dueDate && (task.repeatOption || task.reminder) && ' • '}
            {task.repeatOption && `Repeats ${task.repeatOption}`}
            {task.repeatOption && task.reminder && ' • '}
            {task.reminder && `Reminder ${task.reminder}`}
          </div>
        )}
      </div>
      
      <button
        onClick={() => onDelete(task.id)}
        className="text-muted-foreground hover:text-destructive transition-colors ml-2"
      >
        ×
      </button>
    </div>
  );
};
