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

  it('should call addTask, schedule notifications, and reset state on success', async () => {
    // 💡 What: Tests the task creation hook and its integration with notifications.
    // 🎯 Why: This hook orchestrates the complex logic of adding a task, scheduling
    // due dates, scheduling reminders, and resetting form state. It's a critical
    // user flow and had 0% coverage, leaving us blind to regressions in notification scheduling.
    const addTaskMock = vi.fn().mockResolvedValue('test-task-id');
    const { result } = renderHook(() => useTaskCreation(addTaskMock));

    // Arrange: Set up a new task with a due date and reminder
    act(() => {
      result.current.setNewTask('  New task text  '); // Should trim whitespace
      result.current.setDueDate('2023-10-10');
      result.current.setReminder('15m');
      result.current.setRepeatOption('daily');
      result.current.setSelectedEmoji('🚀');
    });

    // Act: Attempt to add the task
    await act(async () => {
      await result.current.handleAddTask();
    });

    // Assert: addTask called with correct parsed/trimmed data
    expect(addTaskMock).toHaveBeenCalledWith({
      text: 'New task text',
      dueDate: new Date('2023-10-10'),
      repeatOption: 'daily',
      reminder: '15m',
      emoji: '🚀',
    });

    // Assert: Notifications scheduled properly
    expect(scheduleDueDateNotificationMock).toHaveBeenCalledWith('test-task-id', 'New task text', new Date('2023-10-10'));
    expect(scheduleTaskReminderMock).toHaveBeenCalledWith('test-task-id', 'New task text', new Date('2023-10-10'), '15m');

    // Assert: Form state resets completely
    expect(result.current.newTask).toBe('');
    expect(result.current.dueDate).toBe('');
    expect(result.current.repeatOption).toBe('none');
    expect(result.current.reminder).toBe('none');
    expect(result.current.selectedEmoji).toBe('');
  });

  it('should not do anything if text is empty or just whitespace', async () => {
    const addTaskMock = vi.fn();
    const { result } = renderHook(() => useTaskCreation(addTaskMock));

    // Arrange: Only whitespace
    act(() => {
      result.current.setNewTask('   ');
    });

    // Act
    await act(async () => {
      await result.current.handleAddTask();
    });

    // Assert
    expect(addTaskMock).not.toHaveBeenCalled();
    expect(result.current.newTask).toBe('   '); // State shouldn't reset if failed validation
  });

  it('should catch error and log to console if addTask throws an exception', async () => {
    // 💡 What: Tests that exceptions thrown by addTask are caught and logged.
    // 🎯 Why: Ensures graceful error handling and that the app doesn't crash on unexpected API failures.
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockError = new Error('API failure');
    const addTaskThrows = vi.fn().mockRejectedValue(mockError);
    const { result } = renderHook(() => useTaskCreation(addTaskThrows));

    act(() => {
      result.current.setNewTask('Test Task');
    });

    await act(async () => {
      await result.current.handleAddTask();
    });

    expect(addTaskThrows).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error adding task:', mockError);

    // State should remain unchanged
    expect(result.current.newTask).toBe('Test Task');

    consoleErrorSpy.mockRestore();
  });
});
