import { render, act, screen, waitFor } from '@testing-library/react';
import { DragDropContext } from './DragDropContext';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';

// 💡 What: Mocks for react-dnd and its backends to verify DragDropContext behavior
// 🎯 Why: We need to ensure the correct backend is chosen based on device touch capabilities.
// Using simplified mocks to avoid dependency on the actual backends during testing.

vi.mock('react-dnd', () => ({
  DndProvider: vi.fn(({ children, backend, options }) => (
    <div
      data-testid="dnd-provider"
      data-backend={backend?.name || 'unknown'}
      data-has-options={options ? 'true' : 'false'}
    >
      {children}
    </div>
  )),
}));

vi.mock('react-dnd-html5-backend', () => ({
  HTML5Backend: { name: 'HTML5Backend' },
}));

vi.mock('react-dnd-touch-backend', () => ({
  TouchBackend: { name: 'TouchBackend' },
}));

describe('DragDropContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: Non-touch device
    vi.stubGlobal('navigator', {
      maxTouchPoints: 0,
      msMaxTouchPoints: 0,
    });

    // @ts-ignore
    delete window.ontouchstart;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses HTML5Backend by default on non-touch devices', async () => {
    render(
      <DragDropContext>
        <div />
      </DragDropContext>
    );

    // Initial render might show unknown or HTML5 before useEffect runs
    // But since it's initialized to false, it should be HTML5Backend
    await waitFor(() => {
      const provider = screen.getByTestId('dnd-provider');
      expect(provider).toHaveAttribute('data-backend', 'HTML5Backend');
      expect(provider).toHaveAttribute('data-has-options', 'false');
    });
  });

  it('uses TouchBackend if window.ontouchstart exists', async () => {
    // @ts-ignore
    window.ontouchstart = () => {};

    render(
      <DragDropContext>
        <div />
      </DragDropContext>
    );

    await waitFor(() => {
      const provider = screen.getByTestId('dnd-provider');
      expect(provider).toHaveAttribute('data-backend', 'TouchBackend');
      expect(provider).toHaveAttribute('data-has-options', 'true');
    });
  });

  it('uses TouchBackend if navigator.maxTouchPoints > 0', async () => {
    vi.stubGlobal('navigator', {
      maxTouchPoints: 1,
    });

    render(
      <DragDropContext>
        <div />
      </DragDropContext>
    );

    await waitFor(() => {
      const provider = screen.getByTestId('dnd-provider');
      expect(provider).toHaveAttribute('data-backend', 'TouchBackend');
    });
  });

  it('uses TouchBackend if navigator.msMaxTouchPoints > 0', async () => {
    vi.stubGlobal('navigator', {
      msMaxTouchPoints: 1,
    });

    render(
      <DragDropContext>
        <div />
      </DragDropContext>
    );

    await waitFor(() => {
      const provider = screen.getByTestId('dnd-provider');
      expect(provider).toHaveAttribute('data-backend', 'TouchBackend');
    });
  });

  it('re-checks touch support on window resize', async () => {
    render(
      <DragDropContext>
        <div />
      </DragDropContext>
    );

    // Initial check: HTML5
    await waitFor(() => {
      expect(screen.getByTestId('dnd-provider')).toHaveAttribute('data-backend', 'HTML5Backend');
    });

    // Simulate switching to touch support
    vi.stubGlobal('navigator', {
      maxTouchPoints: 5,
    });

    // Trigger resize event
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('dnd-provider')).toHaveAttribute('data-backend', 'TouchBackend');
    });
  });
});
