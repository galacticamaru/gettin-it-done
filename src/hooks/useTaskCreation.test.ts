import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Setup mock for useNotifications before importing useTaskCreation
const scheduleTaskReminderMock = vi.fn();
const scheduleDueDateNotificationMock = vi.fn();

vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => ({
    scheduleTaskReminder: scheduleTaskReminderMock,
    scheduleDueDateNotification: scheduleDueDateNotificationMock,
  })
}));

import { useTaskCreation } from './useTaskCreation';

describe('useTaskCreation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not clear form state if addTask fails (returns null)', async () => {
    // 💡 What: Tests that the task creation form retains its state when adding a task fails.
    // 🎯 Why: Prevents silent user data loss during network failures or API errors.
    const addTaskFailed = vi.fn().mockResolvedValue(null);
    const { result } = renderHook(() => useTaskCreation(addTaskFailed));

    // Set initial state
    act(() => {
      result.current.setNewTask('Test Task');
      result.current.setDueDate('2024-01-01');
      result.current.setRepeatOption('daily');
      result.current.setReminder('10:00');
      result.current.setSelectedEmoji('😊');
    });

    // Verify initial state is set
    expect(result.current.newTask).toBe('Test Task');
    expect(result.current.repeatOption).toBe('daily');

    await act(async () => {
      await result.current.handleAddTask();
    });

    expect(addTaskFailed).toHaveBeenCalledWith({
      text: 'Test Task',
      dueDate: new Date('2024-01-01'),
      repeatOption: 'daily',
      reminder: '10:00',
      emoji: '😊',
    });

    // State should remain unchanged because addTask failed
    expect(result.current.newTask).toBe('Test Task');
    expect(result.current.dueDate).toBe('2024-01-01');
    expect(result.current.repeatOption).toBe('daily');
    expect(result.current.reminder).toBe('10:00');
    expect(result.current.selectedEmoji).toBe('😊');

    expect(scheduleTaskReminderMock).not.toHaveBeenCalled();
    expect(scheduleDueDateNotificationMock).not.toHaveBeenCalled();
  });

  it('should clear form state if addTask succeeds (returns taskId)', async () => {
    // 💡 What: Tests that the task creation form is cleared upon successful task addition.
    // 🎯 Why: Ensures a clean state for the next task and confirms the happy path functions correctly.
    const addTaskSuccess = vi.fn().mockResolvedValue('new-task-id');
    const { result } = renderHook(() => useTaskCreation(addTaskSuccess));

    // Set initial state
    act(() => {
      result.current.setNewTask('Test Task');
      // Leaving other fields at defaults for simplicity
    });

    expect(result.current.newTask).toBe('Test Task');

    await act(async () => {
      await result.current.handleAddTask();
    });

    expect(addTaskSuccess).toHaveBeenCalledWith({
      text: 'Test Task',
      dueDate: undefined,
      repeatOption: undefined,
      reminder: undefined,
      emoji: undefined,
    });

    // State should be cleared
    expect(result.current.newTask).toBe('');
    expect(result.current.dueDate).toBe('');
    expect(result.current.repeatOption).toBe('none');
    expect(result.current.reminder).toBe('none');
    expect(result.current.selectedEmoji).toBe('');
  });
});
