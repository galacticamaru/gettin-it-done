import { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Move, Check, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Task {
  id: string; // Changed from number to string
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
  onToggle: (id: string) => void; // Changed from number to string
  onDelete: (id: string) => void; // Changed from number to string
  onReorder?: (dragId: string, hoverId: string) => void;
}

const TASK_TYPE = 'task';

export const TaskItem = ({ task, onToggle, onDelete, onReorder }: TaskItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [{ isDragging }, drag] = useDrag({
    type: TASK_TYPE,
    item: () => ({ id: task.id.toString() }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: TASK_TYPE,
    hover: (draggedItem: { id: string }) => {
      if (!ref.current) return;
      
      const dragId = draggedItem.id;
      const hoverId = task.id.toString();
      
      if (dragId === hoverId) return;
      
      onReorder?.(dragId, hoverId);
    },
  });

  // Connect both drag and drop to the ref
  drag(drop(ref));

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
    <TooltipProvider delayDuration={500}>
      <div
        ref={ref}
        className={`flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md border ${
          task.completed ? 'bg-green-50 dark:bg-green-950/30' : ''
        } ${isDragging ? 'opacity-50' : ''}`}
      >
        <div className="flex items-center gap-3 flex-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                role="checkbox"
                aria-checked={task.completed}
                onClick={() => onToggle(task.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  task.completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-border hover:border-green-400'
                }`}
                aria-label={task.completed ? `Mark task "${task.text}" as incomplete` : `Mark task "${task.text}" as complete`}
              >
                {task.completed && (
                  <Check className="w-4 h-4 text-white" aria-hidden="true" strokeWidth={3} />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{task.completed ? "Mark task as incomplete" : "Mark task as complete"}</p>
            </TooltipContent>
          </Tooltip>

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
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="drag-handle text-muted-foreground hover:text-foreground transition-colors cursor-grab active:cursor-grabbing"
                aria-label={`Drag to reorder task "${task.text}"`}
              >
                <Move className="h-4 w-4" aria-hidden="true" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Drag to reorder task</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="text-muted-foreground hover:text-destructive transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 rounded-sm p-1 -mr-1"
                aria-label={`Delete task "${task.text}"`}
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete task</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task "{task.text}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(task.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
};
