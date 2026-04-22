import { useState, useRef, useEffect } from 'react';
import { Plus, Calendar, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EmojiPicker } from '@/components/EmojiPicker';
import { toast } from 'sonner';

interface MobileTaskCreatorProps {
  newTask: string;
  setNewTask: (task: string) => void;
  dueDate: string;
  setDueDate: (date: string) => void;
  repeatOption: string;
  setRepeatOption: (option: string) => void;
  reminder: string;
  setReminder: (reminder: string) => void;
  selectedEmoji: string;
  setSelectedEmoji: (emoji: string) => void;
  onAddTask: () => void;
}

export const MobileTaskCreator = ({
  newTask,
  setNewTask,
  dueDate,
  setDueDate,
  selectedEmoji,
  setSelectedEmoji,
  onAddTask,
}: MobileTaskCreatorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus input when modal opens
  useEffect(() => {
    if (isOpen) {
      // Small timeout ensures the dialog is fully rendered before focusing
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setShowEmojiPicker(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      onAddTask();
      toast.success('Task created successfully');
      setIsOpen(false);
      // Clear specific local state if needed
      setDueDate('');
      setSelectedEmoji('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg touch-manipulation z-40"
          aria-label="Create new task"
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      
      {/* We add VisuallyHidden DialogTitle for accessibility */}
      <DialogContent className="sm:max-w-md w-[95%] rounded-2xl p-6 top-[30%] translate-y-[-30%]">
        <DialogTitle className="sr-only">Create New Task</DialogTitle>
        <DialogDescription className="sr-only">Enter task details below</DialogDescription>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-12 w-12 rounded-xl touch-manipulation shrink-0"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                aria-label="Choose an emoji"
              >
                {selectedEmoji || <Smile className="h-5 w-5" aria-hidden="true" />}
              </Button>
              
              <Label htmlFor="mobile-task-input" className="sr-only">
                Task description
              </Label>
              <Input
                id="mobile-task-input"
                ref={inputRef}
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="What do you need to do?"
                className="flex-1 h-12 text-lg px-4 rounded-xl touch-manipulation border-none bg-secondary/50 focus-visible:ring-1"
                aria-label="Task description"
              />
            </div>
            
            {showEmojiPicker && (
              <div className="bg-card border rounded-xl p-4 absolute z-50 shadow-md">
                <EmojiPicker
                  selectedEmoji={selectedEmoji}
                  onEmojiSelect={(emoji) => {
                    setSelectedEmoji(emoji);
                    setShowEmojiPicker(false);
                    inputRef.current?.focus();
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Label htmlFor="mobile-due-date" className="sr-only">
                Due Date
              </Label>
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="mobile-due-date"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="pl-10 h-12 text-sm touch-manipulation bg-secondary/20 border-secondary rounded-xl"
                aria-label="Due Date"
              />
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-block">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={!newTask.trim()}
                      className="h-12 px-6 rounded-xl touch-manipulation font-medium shrink-0"
                    >
                      Save
                    </Button>
                  </div>
                </TooltipTrigger>
                {!newTask.trim() && (
                  <TooltipContent>
                    <p>Task description is required</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};