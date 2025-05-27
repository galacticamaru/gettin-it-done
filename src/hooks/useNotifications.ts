
import { useState, useEffect } from 'react';
import { notificationService } from '@/services/notificationService';

export const useNotifications = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [activeReminders, setActiveReminders] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    // Check initial permission state
    setPermissionGranted(notificationService.isPermissionGranted());
    setPermissionDenied(notificationService.isPermissionDenied());
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    const result = await notificationService.requestPermission();
    setPermissionGranted(result.granted);
    setPermissionDenied(result.denied);
    return result.granted;
  };

  const scheduleTaskReminder = (taskId: string, taskText: string, dueDate: Date | undefined, reminderOption: string) => {
    if (!permissionGranted || reminderOption === 'none') {
      return;
    }

    // Cancel existing reminder for this task
    const existingTimeoutId = activeReminders.get(taskId);
    if (existingTimeoutId) {
      notificationService.cancelReminder(existingTimeoutId);
    }

    // Calculate when to send the reminder
    const reminderTime = notificationService.calculateReminderTime(dueDate, reminderOption);
    if (!reminderTime) {
      return;
    }

    // Schedule new reminder
    const timeoutId = notificationService.scheduleReminder(taskText, reminderTime);
    if (timeoutId > 0) {
      setActiveReminders(prev => new Map(prev).set(taskId, timeoutId));
    }
  };

  const cancelTaskReminder = (taskId: string) => {
    const timeoutId = activeReminders.get(taskId);
    if (timeoutId) {
      notificationService.cancelReminder(timeoutId);
      setActiveReminders(prev => {
        const newMap = new Map(prev);
        newMap.delete(taskId);
        return newMap;
      });
    }
  };

  return {
    permissionGranted,
    permissionDenied,
    requestPermission,
    scheduleTaskReminder,
    cancelTaskReminder,
  };
};
