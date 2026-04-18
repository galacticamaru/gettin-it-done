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
      const subscriptionId = await window.OneSignal.User.PushSubscription.id;
      const optedIn = await window.OneSignal.User.PushSubscription.optedIn;
      console.log('OneSignal subscription ID:', subscriptionId, 'optedIn:', optedIn);
      return !!subscriptionId && optedIn;
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

      return new Promise((resolve) => {
        // Handle timeout
        const timeout = setTimeout(async () => {
          if (window.OneSignal) {
             window.OneSignal.User.PushSubscription.removeEventListener("change", changeListener);
          }
          console.warn("OneSignal optIn timed out. Checking current status.");
          resolve(await this.isSubscribed());
        }, 5000);

        const changeListener = (event: any) => {
          if (event && event.current && event.current.optedIn === true) {
            clearTimeout(timeout);
            window.OneSignal!.User.PushSubscription.removeEventListener("change", changeListener);
            console.log('Subscription verification:', true);
            resolve(true);
          }
        };

        window.OneSignal!.User.PushSubscription.addEventListener("change", changeListener);

        // Opt in to push notifications
        window.OneSignal!.User.PushSubscription.optIn().then(() => {
          console.log('Successfully called OneSignal optIn');
        }).catch((e) => {
          console.error("Error calling optIn", e);
          clearTimeout(timeout);
          window.OneSignal!.User.PushSubscription.removeEventListener("change", changeListener);
          resolve(false);
        });
      });
      
    } catch (error) {
      console.error('Error subscribing user to OneSignal:', error);
      return false;
    }
  }

  async unsubscribeUser(): Promise<boolean> {
    if (!window.OneSignal) return false;

    try {
      console.log('Attempting to unsubscribe user from OneSignal...');
      
      // Check if already unsubscribed
      const currentlySubscribed = await this.isSubscribed();
      if (!currentlySubscribed) {
        console.log('User is already unsubscribed from OneSignal');
        return true;
      }

      return new Promise((resolve) => {
        // Handle timeout
        const timeout = setTimeout(async () => {
          if (window.OneSignal) {
             window.OneSignal.User.PushSubscription.removeEventListener("change", changeListener);
          }
          console.warn("OneSignal optOut timed out. Checking current status.");
          const subbed = await this.isSubscribed();
          resolve(!subbed);
        }, 5000);

        const changeListener = (event: any) => {
          if (event && event.current && event.current.optedIn === false) {
            clearTimeout(timeout);
            window.OneSignal!.User.PushSubscription.removeEventListener("change", changeListener);
            console.log('Unsubscription verification - still subscribed: false');
            resolve(true); // successfully unsubscribed
          }
        };

        window.OneSignal!.User.PushSubscription.addEventListener("change", changeListener);

        // Opt out of push notifications
        window.OneSignal!.User.PushSubscription.optOut().then(() => {
           console.log('Successfully called OneSignal optOut');
        }).catch((e) => {
           console.error("Error calling optOut", e);
           clearTimeout(timeout);
           window.OneSignal!.User.PushSubscription.removeEventListener("change", changeListener);
           resolve(false);
        });
      });
      
    } catch (error) {
      console.error('Error unsubscribing user from OneSignal:', error);
      return false;
    }
  }

  async sendTaskReminder(taskText: string, dueDate?: Date, customTitle?: string, customMessage?: string): Promise<boolean> {
    if (!window.OneSignal) {
      console.warn('OneSignal not available');
      return false;
    }

    try {
      const title = customTitle || 'Task Reminder 📝';
      let message = customMessage || `Don't forget: ${taskText}`;
      
      if (!customMessage && dueDate) {
        const now = new Date();
        const isOverdue = dueDate < now;
        if (isOverdue) {
          message = `⏰ Overdue: ${taskText}`;
        } else {
          message = `📅 Due soon: ${taskText}`;
        }
      }

      console.log('Sending OneSignal notification:', { title, message });

      // Check if we have an active subscription
      const isSubscribed = await this.isSubscribed();
      if (!isSubscribed) {
        console.warn('User is not subscribed to OneSignal');
        return false;
      }

      // Get the user's subscription ID
      const userSubscriptionId = await this.getUserId();
      if (!userSubscriptionId) {
        console.warn('Could not get user subscription ID');
        return false;
      }

      console.log('Sending notification via Edge Function for user:', userSubscriptionId);

      // Send notification via our Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          message,
          userSubscriptionId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Edge Function error:', errorData);
        return false;
      }

      const result = await response.json();
      console.log('Notification sent successfully:', result);
      return true;

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
    return this.sendTaskReminder(taskText, dueDate, title, message);
  }

  async getUserId(): Promise<string | null> {
    if (!window.OneSignal) return null;

    try {
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
