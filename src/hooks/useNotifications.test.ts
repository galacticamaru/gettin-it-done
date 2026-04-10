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
      sendTaskReminder: (...args: any[]) => sendTaskReminderMock(...args),
    }
  };
});

const calculateReminderTimeMock = vi.fn();

vi.mock('@/services/notificationService', () => {
  return {
    notificationService: {
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
});
