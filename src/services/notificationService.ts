
export interface NotificationPermissionResult {
  granted: boolean;
  denied: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  
  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<NotificationPermissionResult> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return { granted: false, denied: true };
    }

    if (Notification.permission === 'granted') {
      return { granted: true, denied: false };
    }

    if (Notification.permission === 'denied') {
      return { granted: false, denied: true };
    }

    const permission = await Notification.requestPermission();
    return {
      granted: permission === 'granted',
      denied: permission === 'denied'
    };
  }

  isPermissionGranted(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  isPermissionDenied(): boolean {
    return 'Notification' in window && Notification.permission === 'denied';
  }

  scheduleReminder(taskText: string, reminderTime: Date): number {
    if (!this.isPermissionGranted()) {
      console.warn('Notification permission not granted');
      return -1;
    }

    const now = new Date();
    const delay = reminderTime.getTime() - now.getTime();

    if (delay <= 0) {
      console.warn('Reminder time is in the past');
      return -1;
    }

    const timeoutId = window.setTimeout(() => {
      new Notification('Task Reminder', {
        body: `Don't forget: ${taskText}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `task-reminder-${Date.now()}`,
        requireInteraction: true
      });
    }, delay);

    return timeoutId;
  }

  cancelReminder(timeoutId: number): void {
    if (timeoutId > 0) {
      clearTimeout(timeoutId);
    }
  }

  calculateReminderTime(dueDate: Date | undefined, reminderOption: string): Date | null {
    const now = new Date();

    if (!dueDate) {
      // No due date - reminder is relative to now
      switch (reminderOption) {
        case '15min':
          return new Date(now.getTime() + 15 * 60 * 1000);
        case '1hour':
          return new Date(now.getTime() + 60 * 60 * 1000);
        case '1day':
          return new Date(now.getTime() + 24 * 60 * 60 * 1000);
        default:
          return null;
      }
    } else {
      // Has due date - reminder is relative to due date
      switch (reminderOption) {
        case '15min':
          return new Date(dueDate.getTime() - 15 * 60 * 1000);
        case '1hour':
          return new Date(dueDate.getTime() - 60 * 60 * 1000);
        case '1day':
          return new Date(dueDate.getTime() - 24 * 60 * 60 * 1000);
        default:
          return null;
      }
    }
  }
}

export const notificationService = NotificationService.getInstance();
