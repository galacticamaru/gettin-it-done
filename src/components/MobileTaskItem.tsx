import { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useSpring, animated } from 'react-spring';
import { useDrag as useGestureDrag } from '@use-gesture/react';
import { Move, Check, X } from 'lucide-react';
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
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
  repeatOption?: string;
  reminder?: string;
  emoji?: string;
}

interface MobileTaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder?: (dragId: string, hoverId: string) => void;
}

const TASK_TYPE = 'task';
const SWIPE_THRESHOLD = 60;

export const MobileTaskItem = ({ task, onToggle, onDelete, onReorder }: MobileTaskItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [swiped, setSwiped] = useState<'complete' | 'delete' | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [{ isDragging }, drag, dragPreview] = useDrag({
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

  // Spring animation for swipe actions
  const [springs, api] = useSpring(() => ({
    x: 0,
    scale: 1,
    config: { tension: 300, friction: 30 },
  }));

  const bind = useGestureDrag(
    ({ active, movement: [mx], direction: [xDir], velocity: [vx] }) => {
      const trigger = Math.abs(mx) > SWIPE_THRESHOLD;
      
      if (active) {
        // While dragging
        let swipeDirection: 'complete' | 'delete' | null = null;
        
        if (mx > SWIPE_THRESHOLD) {
          swipeDirection = 'complete';
        } else if (mx < -SWIPE_THRESHOLD) {
          swipeDirection = 'delete';
        }
        
        setSwiped(swipeDirection);
        
        api.start({
          x: mx,
          scale: trigger ? 1.02 : 1,
        });
      } else {
        // On release
        if (trigger && Math.abs(vx) > 0.2) {
          if (xDir > 0) {
            // Swipe right - complete task
            handleSwipeComplete();
          } else {
            // Swipe left - delete task
            handleSwipeDelete();
          }
        }
        
        // Reset position
        api.start({ x: 0, scale: 1 });
        setSwiped(null);
      }
    },
    {
      axis: 'x',
      filterTaps: true,
    }
  );

  const handleSwipeComplete = () => {
    // Add haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    onToggle(task.id);
  };

  const handleSwipeDelete = () => {
    // Add haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
    setShowDeleteDialog(true);
  };

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

  // Only connect drop to the main ref so the whole item accepts drops.
  drop(ref);
  dragPreview(ref);

  return (
    <div ref={ref} className="relative overflow-hidden mb-2">
      {/* Swipe action backgrounds */}
      <div className="absolute inset-0 flex rounded-2xl overflow-hidden">
        {/* Complete action (right swipe) */}
        <div className={`flex-1 flex items-center justify-start pl-6 transition-all duration-200 ${
          swiped === 'complete' ? 'bg-green-500' : 'bg-green-400/20'
        }`}>
          <Check className={`w-6 h-6 transition-all duration-200 ${
            swiped === 'complete' ? 'text-white scale-110' : 'text-green-600'
          }`} />
        </div>
        
        {/* Delete action (left swipe) */}
        <div className={`flex-1 flex items-center justify-end pr-6 transition-all duration-200 ${
          swiped === 'delete' ? 'bg-red-500' : 'bg-red-400/20'
        }`}>
          <X className={`w-6 h-6 transition-all duration-200 ${
            swiped === 'delete' ? 'text-white scale-110' : 'text-red-600'
          }`} />
        </div>
      </div>

      {/* Main task item */}
      <animated.div
        {...bind()}
        style={{
          x: springs.x,
          scale: springs.scale,
        }}
        className={`relative bg-card rounded-2xl shadow-sm border transition-all duration-200 touch-pan-y ${
          task.completed ? 'bg-green-50 dark:bg-green-950/30' : ''
        } ${isDragging ? 'opacity-50' : ''}`}
      >
        <div className="flex items-center gap-4 p-6 min-h-[80px]">
          {/* Enhanced touch target for completion toggle */}
          <button
            role="checkbox"
            aria-checked={task.completed}
            onClick={() => onToggle(task.id)}
            className={`w-12 h-12 rounded-full border-3 flex items-center justify-center transition-all touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              task.completed 
                ? 'bg-green-500 border-green-500' 
                : 'border-border hover:border-green-400 active:scale-95'
            }`}
            aria-label={task.completed ? `Mark task "${task.text}" as incomplete` : `Mark task "${task.text}" as complete`}
            title={task.completed ? "Mark task as incomplete" : "Mark task as complete"}
          >
            {task.completed && (
              <Check className="w-6 h-6 text-white" aria-hidden="true" />
            )}
          </button>
          
          <span className="text-2xl">
            {task.emoji || getTaskEmoji(task.text)}
          </span>
          
          <div className="flex-1 min-w-0">
            <span className={`block text-lg leading-tight ${
              task.completed 
                ? 'text-muted-foreground line-through' 
                : 'text-foreground'
            }`}>
              {task.text}
            </span>
            {(task.dueDate || task.repeatOption || task.reminder) && (
              <div className="text-sm text-muted-foreground mt-2 space-y-1">
                {task.dueDate && (
                  <div>📅 Due {new Date(task.dueDate).toLocaleDateString()}</div>
                )}
                {task.repeatOption && (
                  <div>🔄 Repeats {task.repeatOption}</div>
                )}
                {task.reminder && (
                  <div>⏰ Reminder {task.reminder}</div>
                )}
              </div>
            )}
          </div>

          {/* Enhanced drag handle with better touch target */}
          <div className="flex items-center gap-3">
            <div
              ref={drag}
              className="drag-handle text-muted-foreground hover:text-foreground transition-colors p-2 touch-none"
              aria-label={`Drag to reorder task "${task.text}"`}
              title="Drag to reorder task"
              style={{ cursor: 'grab' }}
            >
              <Move className="h-6 w-6" aria-hidden="true" />
            </div>
            
            {/* Enhanced delete button with better touch target */}
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="text-muted-foreground hover:text-destructive transition-colors p-3 rounded-full hover:bg-destructive/10 active:scale-95 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
              aria-label={`Delete task "${task.text}"`}
              title="Delete task"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Swipe hint indicator */}
        {!task.completed && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 opacity-30">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <span>← Delete</span>
              <span>•</span>
              <span>Complete →</span>
            </div>
          </div>
        )}
      </animated.div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="w-[95%] sm:max-w-md rounded-2xl">
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
    </div>
  );
};