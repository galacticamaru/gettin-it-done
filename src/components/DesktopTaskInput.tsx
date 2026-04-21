import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmojiPicker } from './EmojiPicker';
import { TaskOptionsModal } from './TaskOptionsModal';

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
  return (
    <>
      <div className="flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm mb-4 border transition-shadow focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <EmojiPicker selectedEmoji={selectedEmoji} onEmojiSelect={setSelectedEmoji} />
        <Label htmlFor="desktop-task-input" className="sr-only">New task description</Label>
        <Input
          id="desktop-task-input"
          placeholder="Add a new task"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && newTask.trim() && handleAddTask()}
          className="border-0 bg-transparent focus-visible:ring-0"
          aria-label="New task description"
        />
        <Button
          onClick={handleAddTask}
          size="sm"
          disabled={!newTask.trim()}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium px-4 py-2 rounded-full dark:bg-yellow-500 dark:hover:bg-yellow-600"
        >
          Add
        </Button>
      </div>

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
