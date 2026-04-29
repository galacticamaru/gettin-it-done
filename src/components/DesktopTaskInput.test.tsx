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

  it('calls handleAddTask when Enter key is pressed with valid input', () => {
    // 💡 What: Tests that the Enter key triggers the add task action.
    // 🎯 Why: Keyboard accessibility is essential. Users expect to submit tasks by pressing Enter.
    const handleAddTask = vi.fn();
    render(
      <DesktopTaskInput
        newTask="New Task"
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

    const input = screen.getByPlaceholderText('Add a new task');

    // Simulate pressing Enter
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(handleAddTask).toHaveBeenCalledTimes(1);
  });

  it('does not call handleAddTask when Enter key is pressed with empty input', () => {
    // 💡 What: Tests that Enter key is ignored if the input is only whitespace.
    // 🎯 Why: We shouldn't allow empty task submission even via keyboard shortcuts.
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

    const input = screen.getByPlaceholderText('Add a new task');

    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(handleAddTask).not.toHaveBeenCalled();
  });

  it('calls setNewTask when input value changes', () => {
    // 💡 What: Tests that the input correctly calls the injected state updater.
    // 🎯 Why: Ensures the component correctly links user typing to the parent component's state.
    const setNewTask = vi.fn();
    render(
      <DesktopTaskInput
        newTask=""
        setNewTask={setNewTask}
        dueDate=""
        setDueDate={vi.fn()}
        repeatOption="none"
        setRepeatOption={vi.fn()}
        reminder="none"
        setReminder={vi.fn()}
        selectedEmoji=""
        setSelectedEmoji={vi.fn()}
        handleAddTask={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText('Add a new task');

    fireEvent.change(input, { target: { value: 'Test' } });

    expect(setNewTask).toHaveBeenCalledWith('Test');
  });
});
