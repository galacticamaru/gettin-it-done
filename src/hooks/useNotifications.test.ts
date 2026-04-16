import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// vi.mock declarations are hoisted
vi.mock('@/hooks/useUserPreferences', () => ({
  useUserPreferences: () => ({
    updateOneSignalSubscriptionId: vi.fn(),
  })
}));

const sendTaskReminderMock = vi.fn();

vi.mock('@/services/oneSignalService', () => {
  return {
    oneSignalService: {
      isSubscribed: vi.fn().mockResolvedValue(true),
      getUserId: vi.fn().mockResolvedValue('test-user'),
      subscribeUser: vi.fn().mockResolvedValue(true),
      unsubscribeUser: vi.fn().mockResolvedValue(true),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sendTaskReminder: (...args: any[]) => sendTaskReminderMock(...args),
    }
  };
});

const calculateReminderTimeMock = vi.fn();

vi.mock('@/services/notificationService', () => {
  return {
    notificationService: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculateReminderTime: (...args: any[]) => calculateReminderTimeMock(...args),
    }
  };
});

import { useNotifications } from './useNotifications';

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Mock OneSignal global so `oneSignalReady` becomes true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).OneSignalDeferred = {
      push: (cb: () => void) => cb(),
    };
  });

  it('scheduleTaskReminder cancels existing reminder for the same task before scheduling a new one', async () => {
    // 💡 What: Tests that an existing active reminder is cleared when scheduling a new reminder for the same task.
    // 🎯 Why: Without this, users editing a task's reminder would receive multiple duplicate notifications for the old and new times.

    const dueDate = new Date();
    vi.setSystemTime(dueDate);

    const firstReminderTime = new Date(dueDate.getTime() + 10 * 60 * 1000);
    calculateReminderTimeMock.mockReturnValueOnce(firstReminderTime);

    const { result } = renderHook(() => useNotifications());

    const setTimeoutSpy = vi.spyOn(window, 'setTimeout');
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.scheduleTaskReminder('task-1', 'Do laundry', dueDate, '10m');
    });

    const firstTimeoutId = setTimeoutSpy.mock.results[0]?.value;

    const secondReminderTime = new Date(dueDate.getTime() + 5 * 60 * 1000);
    calculateReminderTimeMock.mockReturnValueOnce(secondReminderTime);

    await act(async () => {
      await result.current.scheduleTaskReminder('task-1', 'Do laundry (updated)', dueDate, '5m');
    });

    expect(clearTimeoutSpy).toHaveBeenCalledWith(firstTimeoutId);
  });

  it('cancelTaskReminder cancels all related active reminders including due and overdue notifications', async () => {
    // 💡 What: Tests that cancelling a task reminder clears all scheduled notification timeouts (reminder, due, overdue).
    // 🎯 Why: If timeouts aren't cleared properly when a task is deleted or disabled, users receive ghostly notifications for non-existent or cancelled events.

    const { result } = renderHook(() => useNotifications());

    // Using act directly since we are modifying state in a manual way for the test
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout');
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');

    const dueDate = new Date();
    const reminderTime = new Date(dueDate.getTime() + 10 * 60 * 1000);
    calculateReminderTimeMock.mockReturnValue(reminderTime);

    // Schedule task reminder
    await act(async () => {
      await result.current.scheduleTaskReminder('test-task', 'Test Task', dueDate, '10m');
    });

    const reminderTimeoutId = setTimeoutSpy.mock.results[0]?.value;

    // Schedule due date notifications (sets 2 more timeouts)
    const futureDueDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours away
    await act(async () => {
      await result.current.scheduleDueDateNotification('test-task', 'Test Task', futureDueDate);
    });

    const dueTimeoutId = setTimeoutSpy.mock.results[1]?.value;
    const overdueTimeoutId = setTimeoutSpy.mock.results[2]?.value;

    // Now cancel the task reminder
    await act(async () => {
      result.current.cancelTaskReminder('test-task');
    });

    // Check if clearTimeout was called with all timeout IDs
    expect(clearTimeoutSpy).toHaveBeenCalledWith(reminderTimeoutId);
    expect(clearTimeoutSpy).toHaveBeenCalledWith(dueTimeoutId);
    expect(clearTimeoutSpy).toHaveBeenCalledWith(overdueTimeoutId);
  });
});
