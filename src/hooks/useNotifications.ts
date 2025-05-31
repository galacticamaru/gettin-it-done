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
      console.log('Initializing notifications...');
      
      // Check initial permission state for browser notifications
      const browserPermissionGranted = notificationService.isPermissionGranted();
      const browserPermissionDenied = notificationService.isPermissionDenied();
      
      console.log('Browser notifications - granted:', browserPermissionGranted, 'denied:', browserPermissionDenied);
      
      setPermissionGranted(browserPermissionGranted);
      setPermissionDenied(browserPermissionDenied);

      // Initialize OneSignal when ready
      if (window.OneSignalDeferred) {
        console.log('OneSignal deferred queue found, waiting for initialization...');
        window.OneSignalDeferred.push(async () => {
          console.log('OneSignal is now ready');
          setOneSignalReady(true);
          
          try {
            const oneSignalGranted = await oneSignalService.isPermissionGranted();
            const subscribed = await oneSignalService.isSubscribed();
            
            console.log('OneSignal status - permission:', oneSignalGranted, 'subscribed:', subscribed);
            
            // Update permission states - we have permission if either OneSignal OR browser notifications work
            setPermissionGranted(browserPermissionGranted || oneSignalGranted);
            setIsSubscribed(subscribed);

            // Get user IDs for debugging
            if (subscribed) {
              const userId = await oneSignalService.getUserId();
              const pushId = await oneSignalService.getPushSubscriptionId();
              console.log('OneSignal User ID:', userId, 'Push Subscription ID:', pushId);
            }
          } catch (error) {
            console.error('Error checking OneSignal status:', error);
          }
        });
      } else {
        console.log('OneSignal deferred queue not found');
      }
    };

    initNotifications();
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    console.log('Requesting notification permission...');
    
    // Try OneSignal first if available, then fall back to browser notifications
    if (oneSignalReady) {
      console.log('Trying OneSignal permission/subscription...');
      
      const subscribed = await oneSignalService.subscribeUser();
      if (subscribed) {
        console.log('OneSignal subscription successful');
        setPermissionGranted(true);
        setPermissionDenied(false);
        setIsSubscribed(true);
        return true;
      } else {
        console.log('OneSignal subscription failed');
      }
    }

    // Fallback to browser notifications
    console.log('Falling back to browser notifications...');
    const result = await notificationService.requestPermission();
    console.log('Browser notification permission result:', result);
    
    setPermissionGranted(result.granted);
    setPermissionDenied(!result.granted); // Only set denied if both methods failed
    return result.granted;
  };

  const scheduleTaskReminder = async (taskId: string, taskText: string, dueDate: Date | undefined, reminderOption: string) => {
    if (reminderOption === 'none') {
      console.log('No reminder requested for task:', taskId);
      return;
    }

    console.log('Scheduling task reminder:', { taskId, taskText, reminderOption, hasSubscription: isSubscribed });

    // Check if we need to request permission
    if (!permissionGranted && !isSubscribed) {
      console.log('No permission/subscription, requesting...');
      const granted = await requestPermission();
      if (!granted) {
        console.log('Permission/subscription denied, cannot schedule reminder');
        return;
      }
    }

    // Cancel existing reminder for this task
    const existingTimeoutId = activeReminders.get(taskId);
    if (existingTimeoutId) {
      console.log('Cancelling existing reminder for task:', taskId);
      clearTimeout(existingTimeoutId);
    }

    // Calculate when to send the reminder
    const reminderTime = notificationService.calculateReminderTime(dueDate, reminderOption);
    if (!reminderTime) {
      console.log('Could not calculate reminder time');
      return;
    }

    const delay = reminderTime.getTime() - Date.now();
    console.log('Scheduling reminder in', Math.round(delay / 1000), 'seconds');

    // Schedule new reminder
    const timeoutId = window.setTimeout(async () => {
      console.log('Sending scheduled reminder for task:', taskId);
      
      // Try OneSignal first
      if (oneSignalReady && isSubscribed) {
        console.log('Sending via OneSignal...');
        const sent = await oneSignalService.sendTaskReminder(taskText, dueDate);
        if (!sent) {
          console.log('OneSignal send failed, falling back to browser notification');
          // Fallback to browser notification
          if (permissionGranted) {
            new Notification('Task Reminder 📝', {
              body: `Don't forget: ${taskText}`,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: `task-reminder-${taskId}`,
              requireInteraction: true
            });
          }
        }
      } else if (permissionGranted) {
        console.log('Sending via browser notification...');
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
    }, delay);

    if (timeoutId > 0) {
      setActiveReminders(prev => new Map(prev).set(taskId, timeoutId));
      console.log('Reminder scheduled with timeout ID:', timeoutId);
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
