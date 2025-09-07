import { useState } from 'react';
import { Plus, Calendar, Repeat, Clock, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { EmojiPicker } from '@/components/EmojiPicker';

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
  repeatOption,
  setRepeatOption,
  reminder,
  setReminder,
  selectedEmoji,
  setSelectedEmoji,
  onAddTask,
}: MobileTaskCreatorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      onAddTask();
      setIsOpen(false);
    }
  };

  const clearOptions = () => {
    setDueDate('');
    setRepeatOption('');
    setReminder('');
    setSelectedEmoji('');
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg touch-manipulation z-50"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DrawerTrigger>
      
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-xl">Create New Task</DrawerTitle>
        </DrawerHeader>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Task input with emoji */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-12 w-12 rounded-xl touch-manipulation"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                {selectedEmoji || <Smile className="h-5 w-5" />}
              </Button>
              
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="What do you need to do?"
                className="flex-1 h-12 text-lg px-4 rounded-xl touch-manipulation"
                autoFocus
              />
            </div>
            
            {showEmojiPicker && (
              <div className="bg-card border rounded-xl p-4">
                <EmojiPicker
                  selectedEmoji={selectedEmoji}
                  onEmojiSelect={(emoji) => {
                    setSelectedEmoji(emoji);
                    setShowEmojiPicker(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* Task options */}
          <div className="grid grid-cols-1 gap-4">
            {/* Due Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                Due Date
              </label>
              <Input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-12 text-lg touch-manipulation"
              />
            </div>

            {/* Repeat Option */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Repeat className="h-4 w-4" />
                Repeat
              </label>
              <select
                value={repeatOption}
                onChange={(e) => setRepeatOption(e.target.value)}
                className="w-full h-12 px-3 text-lg border border-input bg-background rounded-md touch-manipulation"
              >
                <option value="">No repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* Reminder */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4" />
                Reminder
              </label>
              <select
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                className="w-full h-12 px-3 text-lg border border-input bg-background rounded-md touch-manipulation"
              >
                <option value="">No reminder</option>
                <option value="5 minutes before">5 minutes before</option>
                <option value="15 minutes before">15 minutes before</option>
                <option value="30 minutes before">30 minutes before</option>
                <option value="1 hour before">1 hour before</option>
                <option value="1 day before">1 day before</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={clearOptions}
              className="flex-1 h-12 touch-manipulation"
            >
              Clear Options
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={!newTask.trim()}
              className="flex-1 h-12 touch-manipulation"
            >
              Add Task
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
};