
import { useState } from 'react';
import { Calendar, Repeat, Bell, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TaskOptionsModalProps {
  dueDate: Date | undefined;
  onDueDateChange: (date: Date | undefined) => void;
  repeatOption: string;
  onRepeatChange: (repeat: string) => void;
  reminder: string;
  onReminderChange: (reminder: string) => void;
}

export const TaskOptionsModal = ({
  dueDate,
  onDueDateChange,
  repeatOption,
  onRepeatChange,
  reminder,
  onReminderChange
}: TaskOptionsModalProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 px-2">
      {/* Calendar Modal */}
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="p-1 h-auto">
            <Calendar className={cn("w-4 h-4", dueDate && "text-yellow-600")} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={dueDate}
            onSelect={(date) => {
              onDueDateChange(date);
              setCalendarOpen(false);
            }}
            disabled={(date) => date < new Date()}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {/* Repeat Modal */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="p-1 h-auto">
            <Repeat className={cn("w-4 h-4", repeatOption !== 'none' && "text-yellow-600")} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Repeat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <RadioGroup value={repeatOption} onValueChange={onRepeatChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="none" />
                <label htmlFor="none" className="text-sm font-medium">
                  No repeat
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <label htmlFor="daily" className="text-sm font-medium">
                  Daily
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <label htmlFor="weekly" className="text-sm font-medium">
                  Weekly
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <label htmlFor="monthly" className="text-sm font-medium">
                  Monthly
                </label>
              </div>
            </RadioGroup>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reminder Modal */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="p-1 h-auto">
            <Bell className={cn("w-4 h-4", reminder !== 'none' && "text-yellow-600")} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <RadioGroup value={reminder} onValueChange={onReminderChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="reminder-none" />
                <label htmlFor="reminder-none" className="text-sm font-medium">
                  No reminder
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="15min" id="15min" />
                <label htmlFor="15min" className="text-sm font-medium">
                  15 minutes before
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1hour" id="1hour" />
                <label htmlFor="1hour" className="text-sm font-medium">
                  1 hour before
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1day" id="1day" />
                <label htmlFor="1day" className="text-sm font-medium">
                  1 day before
                </label>
              </div>
            </RadioGroup>
          </div>
        </DialogContent>
      </Dialog>

      <span className="text-xs">
        {dueDate && `Due ${format(dueDate, 'MMM d')}`}
        {dueDate && (repeatOption !== 'none' || reminder !== 'none') && ' • '}
        {repeatOption !== 'none' && `Repeats ${repeatOption}`}
        {repeatOption !== 'none' && reminder !== 'none' && ' • '}
        {reminder !== 'none' && `Reminder ${reminder}`}
      </span>
    </div>
  );
};
