import { useState, useEffect } from 'react';
import { notificationService } from '@/services/notificationService';
import { oneSignalService } from '@/services/oneSignalService';

export const useNotifications = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [activeReminders, setActiveReminders] = useState<Map<string, number>>(new Map());
  const [oneSignalReady, setOneSignalReady] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const initNotifications = async () => {
      // Check initial permission state for browser notifications
      const browserPermissionGranted = notificationService.isPermissionGranted();
      const browserPermissionDenied = notificationService.isPermissionDenied();
      
      setPermissionGranted(browserPermissionGranted);
      setPermissionDenied(browserPermissionDenied);

      // Initialize OneSignal when ready
      if (window.OneSignalDeferred) {
        window.OneSignalDeferred.push(async () => {
          setOneSignalReady(true);
          const oneSignalGranted = await oneSignalService.isPermissionGranted();
          const subscribed = await oneSignalService.isSubscribed();
          
          // Update permission states - we have permission if either OneSignal OR browser notifications work
          setPermissionGranted(browserPermissionGranted || oneSignalGranted);
          setIsSubscribed(subscribed);
        });
      }
    };

    initNotifications();
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    // Try OneSignal first if available, then fall back to browser notifications
    if (oneSignalReady) {
      const oneSignalResult = await oneSignalService.requestPermission();
      if (oneSignalResult.granted) {
        const subscribed = await oneSignalService.subscribeUser();
        if (subscribed) {
          setPermissionGranted(true);
          setPermissionDenied(false);
          setIsSubscribed(true);
          return true;
        }
      }
    }

    // Fallback to browser notifications
    const result = await notificationService.requestPermission();
    setPermissionGranted(result.granted);
    setPermissionDenied(!result.granted); // Only set denied if both methods failed
    return result.granted;
  };

  const scheduleTaskReminder = async (taskId: string, taskText: string, dueDate: Date | undefined, reminderOption: string) => {
    if (reminderOption === 'none') {
      return;
    }

    // Check if we need to request permission
    if (!permissionGranted && !isSubscribed) {
      const granted = await requestPermission();
      if (!granted) {
        return;
      }
    }

    // Cancel existing reminder for this task
    const existingTimeoutId = activeReminders.get(taskId);
    if (existingTimeoutId) {
      clearTimeout(existingTimeoutId);
    }

    // Calculate when to send the reminder
    const reminderTime = notificationService.calculateReminderTime(dueDate, reminderOption);
    if (!reminderTime) {
      return;
    }

    // Schedule new reminder
    const timeoutId = window.setTimeout(async () => {
      // Try OneSignal first
      if (oneSignalReady && isSubscribed) {
        await oneSignalService.sendTaskReminder(taskText, dueDate);
      } else if (permissionGranted) {
        // Fallback to browser notification
        new Notification('Task Reminder 📝', {
          body: `Don't forget: ${taskText}`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `task-reminder-${taskId}`,
          requireInteraction: true
        });
      }

      // Remove from active reminders
      setActiveReminders(prev => {
        const newMap = new Map(prev);
        newMap.delete(taskId);
        return newMap;
      });
    }, reminderTime.getTime() - Date.now());

    if (timeoutId > 0) {
      setActiveReminders(prev => new Map(prev).set(taskId, timeoutId));
    }
  };

  const scheduleDueDateNotification = async (taskId: string, taskText: string, dueDate: Date) => {
    // Check if we need to request permission
    if (!permissionGranted && !isSubscribed) {
      const granted = await requestPermission();
      if (!granted) {
        return;
      }
    }

    const now = new Date();
    const timeUntilDue = dueDate.getTime() - now.getTime();

    // Schedule notification for 1 hour before due date (if due date is more than 1 hour away)
    if (timeUntilDue > 60 * 60 * 1000) { // More than 1 hour away
      const reminderTime = new Date(dueDate.getTime() - 60 * 60 * 1000); // 1 hour before
      const timeoutId = window.setTimeout(async () => {
        if (oneSignalReady && isSubscribed) {
          await oneSignalService.sendDueDateNotification(taskText, dueDate);
        } else if (permissionGranted) {
          new Notification('Task Due Soon 📅', {
            body: `${taskText} is due in 1 hour`,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: `due-date-${taskId}`,
            requireInteraction: true
          });
        }
      }, reminderTime.getTime() - now.getTime());

      setActiveReminders(prev => new Map(prev).set(`due-${taskId}`, timeoutId));
    }

    // Schedule notification for when task becomes overdue
    const overdueTimeoutId = window.setTimeout(async () => {
      if (oneSignalReady && isSubscribed) {
        await oneSignalService.sendDueDateNotification(taskText, dueDate);
      } else if (permissionGranted) {
        new Notification('Task Overdue ⏰', {
          body: `${taskText} is overdue!`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `overdue-${taskId}`,
          requireInteraction: true
        });
      }
    }, timeUntilDue);

    setActiveReminders(prev => new Map(prev).set(`overdue-${taskId}`, overdueTimeoutId));
  };

  const cancelTaskReminder = (taskId: string) => {
    // Cancel reminder notification
    const reminderTimeoutId = activeReminders.get(taskId);
    if (reminderTimeoutId) {
      clearTimeout(reminderTimeoutId);
    }

    // Cancel due date notifications
    const dueDateTimeoutId = activeReminders.get(`due-${taskId}`);
    if (dueDateTimeoutId) {
      clearTimeout(dueDateTimeoutId);
    }

    const overdueTimeoutId = activeReminders.get(`overdue-${taskId}`);
    if (overdueTimeoutId) {
      clearTimeout(overdueTimeoutId);
    }

    setActiveReminders(prev => {
      const newMap = new Map(prev);
      newMap.delete(taskId);
      newMap.delete(`due-${taskId}`);
      newMap.delete(`overdue-${taskId}`);
      return newMap;
    });
  };

  // Check if any notification method is available
  const hasNotificationCapability = () => {
    return oneSignalReady || ('Notification' in window && Notification.permission !== 'denied');
  };

  return {
    permissionGranted: permissionGranted || isSubscribed,
    permissionDenied: permissionDenied && !oneSignalReady, // Only denied if both browser and OneSignal unavailable
    oneSignalReady,
    isSubscribed,
    hasNotificationCapability: hasNotificationCapability(),
    requestPermission,
    scheduleTaskReminder,
    scheduleDueDateNotification,
    cancelTaskReminder,
  };
};
