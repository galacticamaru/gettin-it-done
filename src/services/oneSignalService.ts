
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
      console.log('Requesting OneSignal permission...');
      const permission = await window.OneSignal.Notifications.requestPermission();
      console.log('OneSignal permission result:', permission);
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
      console.log('OneSignal permission status:', permission);
      return permission;
    } catch (error) {
      console.error('Error checking OneSignal permission:', error);
      return false;
    }
  }

  async isSubscribed(): Promise<boolean> {
    if (!window.OneSignal) return false;

    try {
      // Check if user has an active push subscription
      const subscriptionId = await window.OneSignal.User.PushSubscription.id;
      console.log('OneSignal subscription ID:', subscriptionId);
      return !!subscriptionId;
    } catch (error) {
      console.error('Error checking OneSignal subscription:', error);
      return false;
    }
  }

  async subscribeUser(): Promise<boolean> {
    if (!window.OneSignal) return false;

    try {
      console.log('Attempting to subscribe user to OneSignal...');
      
      // First check if already subscribed
      const alreadySubscribed = await this.isSubscribed();
      if (alreadySubscribed) {
        console.log('User is already subscribed to OneSignal');
        return true;
      }

      // Request permission first
      const permissionResult = await this.requestPermission();
      if (!permissionResult.granted) {
        console.log('OneSignal permission not granted, cannot subscribe');
        return false;
      }

      // Opt in to push notifications
      await window.OneSignal.User.PushSubscription.optIn();
      console.log('Successfully called OneSignal optIn');
      
      // Wait a moment for the subscription to be processed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify subscription
      const subscribed = await this.isSubscribed();
      console.log('Subscription verification:', subscribed);
      
      return subscribed;
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

      console.log('Sending OneSignal notification:', { title, message });

      // For client-side notifications, we'll use service worker notifications
      // OneSignal doesn't provide a direct client-side notification method
      if ('serviceWorker' in navigator && 'Notification' in window) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `task-reminder-${Date.now()}`,
          requireInteraction: true,
          data: {
            source: 'onesignal',
            taskText,
            dueDate
          }
        });
        console.log('OneSignal notification sent via service worker');
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

    console.log('Sending OneSignal due date notification:', { title, message });
    return this.sendTaskReminder(taskText, dueDate);
  }

  async getUserId(): Promise<string | null> {
    if (!window.OneSignal) return null;

    try {
      // Get the push subscription ID (this is what we use as the user identifier)
      const subscriptionId = await window.OneSignal.User.PushSubscription.id;
      console.log('OneSignal Push Subscription ID:', subscriptionId);
      return subscriptionId || null;
    } catch (error) {
      console.error('Error getting OneSignal user ID:', error);
      return null;
    }
  }

  async getPushSubscriptionId(): Promise<string | null> {
    return this.getUserId();
  }
}

export const oneSignalService = OneSignalService.getInstance();
