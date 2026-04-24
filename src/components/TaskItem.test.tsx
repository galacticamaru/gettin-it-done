import { render, screen } from '@testing-library/react';
import { TaskItem } from './TaskItem';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Helper to wrap components that use react-dnd
const wrapWithDnd = (ui: React.ReactElement) => (
  <DndProvider backend={HTML5Backend}>{ui}</DndProvider>
);

describe('TaskItem', () => {
  it('displays the provided emoji instead of generating one automatically', () => {
    // 💡 What: Tests that an explicitly set emoji takes precedence over the auto-generated one based on task text.
    // 🎯 Why: If this fails, users selecting a custom emoji will be frustrated to see it overridden by the auto-guesser (e.g., if they type "buy medication" but pick a 🚀 emoji).

    const mockTask = {
      id: 'task-1',
      text: 'buy medication', // This text normally generates a 💊 or 🛒 emoji
      completed: false,
      createdAt: '2023-01-01',
      emoji: '🚀', // Explicitly set emoji
    };

    render(
      wrapWithDnd(
        <TaskItem
          task={mockTask}
          onToggle={vi.fn()}
          onDelete={vi.fn()}
        />
      )
    );

    // Assert that the explicit emoji is rendered
    expect(screen.getByText('🚀')).toBeInTheDocument();

    // Assert that the auto-generated emoji for "buy" or "medication" is NOT rendered
    expect(screen.queryByText('💊')).not.toBeInTheDocument();
    expect(screen.queryByText('🛒')).not.toBeInTheDocument();
  });
});
