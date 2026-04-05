import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskCreation } from './useTaskCreation';
import { useNotifications } from '@/hooks/useNotifications';

// 💡 What: Tests the task creation hook and its integration with notifications.
// 🎯 Why: This hook orchestrates the complex logic of adding a task, scheduling
// due dates, scheduling reminders, and resetting form state. It's a critical
// user flow and had 0% coverage, leaving us blind to regressions in notification scheduling.

vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: vi.fn(),
}));

describe('useTaskCreation', () => {
  it('should call addTask, schedule notifications, and reset state on success', async () => {
    const scheduleDueDateNotificationMock = vi.fn();
    const scheduleTaskReminderMock = vi.fn();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useNotifications as any).mockReturnValue({
      scheduleDueDateNotification: scheduleDueDateNotificationMock,
      scheduleTaskReminder: scheduleTaskReminderMock,
    });

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useNotifications as any).mockReturnValue({
      scheduleDueDateNotification: vi.fn(),
      scheduleTaskReminder: vi.fn(),
    });

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
});
