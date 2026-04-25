import { render, screen, fireEvent } from '@testing-library/react';
import { DesktopTaskInput } from './DesktopTaskInput';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: { id: 'test-user-id' } }))
}));

vi.mock('@/hooks/useUserPreferences', () => ({
  useUserPreferences: vi.fn(() => ({ updateOneSignalSubscriptionId: vi.fn() }))
}));

vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: vi.fn(() => ({
    permissionGranted: false,
    permissionDenied: false,
    hasNotificationCapability: true
  }))
}));

describe('DesktopTaskInput', () => {
  it('disables the Add button when newTask is empty or whitespace', () => {
    // 💡 What: Tests that the submit button remains disabled when input is missing.
    // 🎯 Why: Crucial empty state test to prevent submitting blank tasks to the backend.
    const handleAddTask = vi.fn();
    render(
      <DesktopTaskInput
        newTask="   "
        setNewTask={vi.fn()}
        dueDate=""
        setDueDate={vi.fn()}
        repeatOption="none"
        setRepeatOption={vi.fn()}
        reminder="none"
        setReminder={vi.fn()}
        selectedEmoji=""
        setSelectedEmoji={vi.fn()}
        handleAddTask={handleAddTask}
      />
    );

    const button = screen.getByRole('button', { name: /Add/i });
    expect(button).toBeDisabled();
  });

  it('calls handleAddTask when Enter is pressed and input is not empty', () => {
    // 💡 What: Tests that pressing the Enter key inside the input submits the task.
    // 🎯 Why: Keyboard accessibility and UX. Users expect to be able to type a task and hit Enter to add it, without needing to click the add button.
    const handleAddTask = vi.fn();
    render(
      <DesktopTaskInput
        newTask="Valid task"
        setNewTask={vi.fn()}
        dueDate=""
        setDueDate={vi.fn()}
        repeatOption="none"
        setRepeatOption={vi.fn()}
        reminder="none"
        setReminder={vi.fn()}
        selectedEmoji=""
        setSelectedEmoji={vi.fn()}
        handleAddTask={handleAddTask}
      />
    );

    const input = screen.getByRole('textbox', { name: /New task description/i });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(handleAddTask).toHaveBeenCalled();
  });

  it('does not call handleAddTask when Enter is pressed and input is empty', () => {
    // 💡 What: Tests that pressing the Enter key inside the input does not submit the task if it is empty.
    // 🎯 Why: Crucial empty state test to prevent submitting blank tasks to the backend when using keyboard shortcut.
    const handleAddTask = vi.fn();
    render(
      <DesktopTaskInput
        newTask="   "
        setNewTask={vi.fn()}
        dueDate=""
        setDueDate={vi.fn()}
        repeatOption="none"
        setRepeatOption={vi.fn()}
        reminder="none"
        setReminder={vi.fn()}
        selectedEmoji=""
        setSelectedEmoji={vi.fn()}
        handleAddTask={handleAddTask}
      />
    );

    const input = screen.getByRole('textbox', { name: /New task description/i });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(handleAddTask).not.toHaveBeenCalled();
  });
});
