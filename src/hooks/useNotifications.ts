
import { useState, useEffect } from 'react';
import { notificationService } from '@/services/notificationService';
import { oneSignalService } from '@/services/oneSignalService';

export const useNotifications = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [activeReminders, setActiveReminders] = useState<Map<string, number>>(new Map());
  const [oneSignalReady, setOneSignalReady] = useState(false);

  useEffect(() => {
    // Check initial permission state for browser notifications
    setPermissionGranted(notificationService.isPermissionGranted());
    setPermissionDenied(notificationService.isPermissionDenied());

    // Initialize OneSignal when ready
    if (window.OneSignalDeferred) {
      window.OneSignalDeferred.push(async () => {
        setOneSignalReady(true);
        const granted = await oneSignalService.isPermissionGranted();
        setPermissionGranted(granted);
      });
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    // Try OneSignal first, then fall back to browser notifications
    if (oneSignalReady) {
      const oneSignalResult = await oneSignalService.requestPermission();
      if (oneSignalResult.granted) {
        await oneSignalService.subscribeUser();
        setPermissionGranted(true);
        setPermissionDenied(false);
        return true;
      }
    }

    // Fallback to browser notifications
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

    // Schedule new reminder using both OneSignal and browser notifications
    const timeoutId = window.setTimeout(async () => {
      const title = 'Task Reminder';
      const message = `Don't forget: ${taskText}`;

      // Try OneSignal first
      if (oneSignalReady) {
        await oneSignalService.sendNotification(title, message, { taskId, taskText });
      } else {
        // Fallback to browser notification
        notificationService.scheduleReminder(taskText, reminderTime);
      }
    }, reminderTime.getTime() - Date.now());

    if (timeoutId > 0) {
      setActiveReminders(prev => new Map(prev).set(taskId, timeoutId));
    }
  };

  const cancelTaskReminder = (taskId: string) => {
    const timeoutId = activeReminders.get(taskId);
    if (timeoutId) {
      clearTimeout(timeoutId);
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
    oneSignalReady,
    requestPermission,
    scheduleTaskReminder,
    cancelTaskReminder,
  };
};
