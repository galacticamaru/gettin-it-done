
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
