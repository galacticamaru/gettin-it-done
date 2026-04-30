import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileTaskCreator } from './MobileTaskCreator';

// Mock matchMedia for Dialog to work
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Need to mock IntersectionObserver for Dialog component as well
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver
});

// Mock PointerEvent for Radix UI Dialog
if (typeof PointerEvent === 'undefined') {
  class PointerEvent extends Event {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(type: string, props: any) {
      super(type, props);
    }
  }
  Object.defineProperty(window, 'PointerEvent', { value: PointerEvent });
}

describe('MobileTaskCreator', () => {
  it('disables the Save button when newTask is empty or whitespace', async () => {
    // 💡 What: Tests that the submit button remains disabled when input is missing.
    // 🎯 Why: Crucial empty state test to prevent submitting blank tasks to the backend on mobile.
    render(
      <MobileTaskCreator
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
        onAddTask={vi.fn()}
      />
    );

    // Open the mobile task creator dialog
    const createBtn = screen.getByRole('button', { name: /Create new task/i });
    fireEvent.click(createBtn);

    // Wait for dialog to open and Save button to appear
    const addButton = await screen.findByRole('button', { name: /^Save$/i });

    // Check it's disabled
    expect(addButton.hasAttribute('disabled')).toBe(true);
  });
});
