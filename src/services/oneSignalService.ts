
export interface OneSignalPermissionResult {
  granted: boolean;
  denied: boolean;
}

export class OneSignalService {
  private static instance: OneSignalService;
  
  static getInstance(): OneSignalService {
    if (!OneSignalService.instance) {
      OneSignalService.instance = new OneSignalService();
    }
    return OneSignalService.instance;
  }

  async requestPermission(): Promise<OneSignalPermissionResult> {
    if (!window.OneSignal) {
      console.warn('OneSignal is not initialized');
      return { granted: false, denied: true };
    }

    try {
      const permission = await window.OneSignal.Notifications.requestPermission();
      return {
        granted: permission,
        denied: !permission
      };
    } catch (error) {
      console.error('Error requesting OneSignal permission:', error);
      return { granted: false, denied: true };
    }
  }

  async isPermissionGranted(): Promise<boolean> {
    if (!window.OneSignal) return false;
    
    try {
      const permission = await window.OneSignal.Notifications.permission;
      return permission;
    } catch (error) {
      console.error('Error checking OneSignal permission:', error);
      return false;
    }
  }

  async isSubscribed(): Promise<boolean> {
    if (!window.OneSignal) return false;

    try {
      const isSubscribed = await window.OneSignal.User.PushSubscription.optedIn;
      return isSubscribed;
    } catch (error) {
      console.error('Error checking OneSignal subscription:', error);
      return false;
    }
  }

  async subscribeUser(): Promise<boolean> {
    if (!window.OneSignal) return false;

    try {
      await window.OneSignal.User.PushSubscription.optIn();
      return true;
    } catch (error) {
      console.error('Error subscribing user to OneSignal:', error);
      return false;
    }
  }

  async sendTaskReminder(taskText: string, dueDate?: Date): Promise<boolean> {
    if (!window.OneSignal) return false;

    try {
      const title = 'Task Reminder 📝';
      let message = `Don't forget: ${taskText}`;
      
      if (dueDate) {
        const now = new Date();
        const isOverdue = dueDate < now;
        if (isOverdue) {
          message = `⏰ Overdue: ${taskText}`;
        } else {
          message = `📅 Due soon: ${taskText}`;
        }
      }

      // For client-side notifications, we use the service worker
      if ('serviceWorker' in navigator && 'Notification' in window) {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(title, {
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `task-reminder-${Date.now()}`,
          requireInteraction: true,
          actions: [
            {
              action: 'complete',
              title: 'Mark Complete'
            },
            {
              action: 'dismiss',
              title: 'Dismiss'
            }
          ]
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error sending OneSignal task reminder:', error);
      return false;
    }
  }

  async sendDueDateNotification(taskText: string, dueDate: Date): Promise<boolean> {
    const now = new Date();
    const timeUntilDue = dueDate.getTime() - now.getTime();
    const hoursUntilDue = timeUntilDue / (1000 * 60 * 60);
    
    let title = 'Task Due Soon 📅';
    let message = `${taskText} is due soon`;
    
    if (hoursUntilDue <= 0) {
      title = 'Task Overdue ⏰';
      message = `${taskText} is overdue!`;
    } else if (hoursUntilDue <= 1) {
      title = 'Task Due in 1 Hour ⏰';
      message = `${taskText} is due in less than an hour`;
    } else if (hoursUntilDue <= 24) {
      title = 'Task Due Today 📅';
      message = `${taskText} is due today`;
    }

    return this.sendTaskReminder(taskText, dueDate);
  }

  async getUserId(): Promise<string | null> {
    if (!window.OneSignal) return null;

    try {
      const userId = await window.OneSignal.User.PushSubscription.id;
      return userId;
    } catch (error) {
      console.error('Error getting OneSignal user ID:', error);
      return null;
    }
  }
}

export const oneSignalService = OneSignalService.getInstance();
