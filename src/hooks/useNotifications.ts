import { useState, useEffect } from 'react';
import { notificationService } from '@/services/notificationService';
import { oneSignalService } from '@/services/oneSignalService';
import { useUserPreferences } from '@/hooks/useUserPreferences';

export const useNotifications = () => {
  const [activeReminders, setActiveReminders] = useState<Map<string, number>>(new Map());
  const [oneSignalReady, setOneSignalReady] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { updateOneSignalSubscriptionId } = useUserPreferences();

  useEffect(() => {
    const initNotifications = async () => {
      console.log('Initializing OneSignal notifications...');

      // Initialize OneSignal when ready
      if (window.OneSignalDeferred) {
        console.log('OneSignal deferred queue found, waiting for initialization...');
        window.OneSignalDeferred.push(async () => {
          console.log('OneSignal is now ready');
          setOneSignalReady(true);
          
          try {
            const subscribed = await oneSignalService.isSubscribed();
            console.log('OneSignal subscription status:', subscribed);
            setIsSubscribed(subscribed);

            // Get user IDs for debugging and save to database
            if (subscribed) {
              const userId = await oneSignalService.getUserId();
              console.log('OneSignal User ID:', userId);
              if (userId) {
                await updateOneSignalSubscriptionId(userId);
              }
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
  }, [updateOneSignalSubscriptionId]);

  const requestPermission = async (): Promise<boolean> => {
    console.log('Requesting OneSignal permission/subscription...');
    
    if (!oneSignalReady) {
      console.log('OneSignal not ready yet');
      return false;
    }

    const subscribed = await oneSignalService.subscribeUser();
    if (subscribed) {
      console.log('OneSignal subscription successful');
      setIsSubscribed(true);
      
      // Save the subscription ID to the database
      const userId = await oneSignalService.getUserId();
      if (userId) {
        await updateOneSignalSubscriptionId(userId);
      }
      
      return true;
    } else {
      console.log('OneSignal subscription failed');
      return false;
    }
  };

  const unsubscribeFromNotifications = async (): Promise<boolean> => {
    console.log('Unsubscribing from OneSignal notifications...');
    
    if (!oneSignalReady) {
      console.log('OneSignal not ready yet');
      return false;
    }

    const unsubscribed = await oneSignalService.unsubscribeUser();
    if (unsubscribed) {
      console.log('OneSignal unsubscription successful');
      setIsSubscribed(false);
      
      // Remove the subscription ID from the database
      await updateOneSignalSubscriptionId(null);
      
      return true;
    } else {
      console.log('OneSignal unsubscription failed');
      return false;
    }
  };

  const scheduleTaskReminder = async (taskId: string, taskText: string, dueDate: Date | undefined, reminderOption: string) => {
    if (reminderOption === 'none') {
      console.log('No reminder requested for task:', taskId);
      return;
    }

    console.log('Scheduling task reminder:', { taskId, taskText, reminderOption, hasSubscription: isSubscribed });

    // Check if we need to request permission
    if (!isSubscribed) {
      console.log('No subscription, requesting...');
      const granted = await requestPermission();
      if (!granted) {
        console.log('Subscription denied, cannot schedule reminder');
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
      await oneSignalService.sendTaskReminder(taskText, dueDate);

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
    if (!isSubscribed) {
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
        await oneSignalService.sendDueDateNotification(taskText, dueDate);
      }, reminderTime.getTime() - now.getTime());

      setActiveReminders(prev => new Map(prev).set(`due-${taskId}`, timeoutId));
    }

    // Schedule notification for when task becomes overdue
    const overdueTimeoutId = window.setTimeout(async () => {
      await oneSignalService.sendDueDateNotification(taskText, dueDate);
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

  return {
    permissionGranted: isSubscribed,
    permissionDenied: false,
    oneSignalReady,
    isSubscribed,
    hasNotificationCapability: oneSignalReady,
    requestPermission,
    unsubscribeFromNotifications,
    scheduleTaskReminder,
    scheduleDueDateNotification,
    cancelTaskReminder,
  };
};
