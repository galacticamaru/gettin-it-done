import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

export const useTaskCreation = (addTask: (taskData: {
  text: string;
  dueDate?: Date;
  repeatOption?: string;
  reminder?: string;
  emoji?: string;
}) => Promise<string | null>) => {
  const { scheduleTaskReminder, scheduleDueDateNotification } = useNotifications();

  const [newTask, setNewTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [repeatOption, setRepeatOption] = useState('none');
  const [reminder, setReminder] = useState('none');
  const [selectedEmoji, setSelectedEmoji] = useState('');

  const handleAddTask = async () => {
    if (newTask.trim()) {
      const taskData = {
        text: newTask.trim(),
        dueDate: dueDate ? new Date(dueDate) : undefined,
        repeatOption: repeatOption === 'none' ? undefined : repeatOption,
        reminder: reminder === 'none' ? undefined : reminder,
        emoji: selectedEmoji || undefined,
      };

      try {
        const taskId = await addTask(taskData);
        if (taskId) {
          if (taskData.dueDate) {
            await scheduleDueDateNotification(taskId, taskData.text, taskData.dueDate);
          }

          if (taskData.reminder && taskData.reminder !== '') {
            await scheduleTaskReminder(taskId, taskData.text, taskData.dueDate, taskData.reminder);
          }

          setNewTask('');
          setDueDate('');
          setRepeatOption('none');
          setReminder('none');
          setSelectedEmoji('');
        }
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  };

  return {
    newTask, setNewTask,
    dueDate, setDueDate,
    repeatOption, setRepeatOption,
    reminder, setReminder,
    selectedEmoji, setSelectedEmoji,
    handleAddTask
  };
};
