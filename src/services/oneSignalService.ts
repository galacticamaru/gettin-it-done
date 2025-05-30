
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

  async sendNotification(title: string, message: string, data?: any): Promise<boolean> {
    if (!window.OneSignal) return false;

    try {
      // OneSignal notifications are typically sent from the server
      // This is a client-side notification for immediate feedback
      if ('serviceWorker' in navigator && 'Notification' in window) {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(title, {
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          data: data,
          requireInteraction: true
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error sending OneSignal notification:', error);
      return false;
    }
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
