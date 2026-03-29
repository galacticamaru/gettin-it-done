import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useTasks } from '@/hooks/useTasks';

export const useTaskCreation = () => {
  const { addTask } = useTasks();
  const { scheduleTaskReminder, scheduleDueDateNotification } = useNotifications();

  const [newTask, setNewTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [repeatOption, setRepeatOption] = useState('');
  const [reminder, setReminder] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('');

  const handleAddTask = async () => {
    if (newTask.trim()) {
      const taskData = {
        text: newTask.trim(),
        dueDate: dueDate ? new Date(dueDate) : undefined,
        repeatOption: repeatOption || undefined,
        reminder: reminder || undefined,
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
        }

        setNewTask('');
        setDueDate('');
        setRepeatOption('');
        setReminder('');
        setSelectedEmoji('');
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
