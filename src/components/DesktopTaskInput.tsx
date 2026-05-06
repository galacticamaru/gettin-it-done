import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EmojiPicker } from './EmojiPicker';
import { TaskOptionsModal } from './TaskOptionsModal';
import { X } from 'lucide-react';

interface DesktopTaskInputProps {
  newTask: string;
  setNewTask: (value: string) => void;
  dueDate: string;
  setDueDate: (value: string) => void;
  repeatOption: string;
  setRepeatOption: (value: string) => void;
  reminder: string;
  setReminder: (value: string) => void;
  selectedEmoji: string;
  setSelectedEmoji: (value: string) => void;
  handleAddTask: () => void;
}

export const DesktopTaskInput = ({
  newTask,
  setNewTask,
  dueDate,
  setDueDate,
  repeatOption,
  setRepeatOption,
  reminder,
  setReminder,
  selectedEmoji,
  setSelectedEmoji,
  handleAddTask
}: DesktopTaskInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const clearInput = () => {
    setNewTask('');
    inputRef.current?.focus();
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (newTask.trim()) handleAddTask();
        }}
        className="flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm mb-4 border transition-shadow focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      >
        <EmojiPicker selectedEmoji={selectedEmoji} onEmojiSelect={setSelectedEmoji} />
        <Label htmlFor="desktop-task-input" className="sr-only">New task description</Label>
        <div className="relative flex-1 flex items-center">
          <Input
            id="desktop-task-input"
            ref={inputRef}
            placeholder="Add a new task"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0 pr-8"
            aria-label="New task description"
          />
          {newTask.trim() && (
            <button
              type="button"
              onClick={clearInput}
              className="absolute right-2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full p-1"
              aria-label="Clear task description"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-block">
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newTask.trim()}
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium px-4 py-2 rounded-full dark:bg-yellow-500 dark:hover:bg-yellow-600"
                >
                  Add
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{!newTask.trim() ? 'Task description is required' : 'Add task (Enter)'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </form>

      <TaskOptionsModal
        dueDate={dueDate ? new Date(dueDate) : undefined}
        onDueDateChange={(date) => setDueDate(date ? date.toISOString() : '')}
        repeatOption={repeatOption}
        onRepeatChange={setRepeatOption}
        reminder={reminder}
        onReminderChange={setReminder}
      />
    </>
  );
};
