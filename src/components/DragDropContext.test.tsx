import { render, act, screen, waitFor } from '@testing-library/react';
import { DragDropContext } from './DragDropContext';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';

// 💡 What: Mocks for react-dnd and its backends to verify DragDropContext behavior
// 🎯 Why: We need to ensure the correct backend is chosen based on device touch capabilities.
// Using simplified mocks to avoid dependency on the actual backends during testing.

vi.mock('react-dnd', async () => {
  const actual = await vi.importActual('react-dnd');
  return {
    ...actual,
    DndProvider: vi.fn(({ children, backend, options }) => (
      <div
        data-testid="dnd-provider"
        data-backend={backend?.name || 'unknown'}
        data-has-options={options ? 'true' : 'false'}
      >
        {children}
      </div>
    )),
  };
});

vi.mock('react-dnd-html5-backend', () => ({
  HTML5Backend: { name: 'HTML5Backend' },
}));

vi.mock('react-dnd-touch-backend', () => ({
  TouchBackend: { name: 'TouchBackend' },
}));

describe('DragDropContext', () => {
  const originalNavigator = window.navigator;

  beforeEach(() => {
    vi.clearAllMocks();

    // Completely remove ontouchstart to ensure 'in' operator returns false
    // @ts-ignore
    delete window.ontouchstart;

    // Reset navigator properties on the existing object to avoid breaking other tests
    Object.defineProperty(window.navigator, 'maxTouchPoints', {
      value: 0,
      configurable: true,
    });
    // @ts-ignore
    Object.defineProperty(window.navigator, 'msMaxTouchPoints', {
      value: 0,
      configurable: true,
    });
  });

  afterEach(() => {
    // Restore navigator properties
    Object.defineProperty(window.navigator, 'maxTouchPoints', {
      value: originalNavigator.maxTouchPoints,
      configurable: true,
    });
    // @ts-ignore
    Object.defineProperty(window.navigator, 'msMaxTouchPoints', {
      value: originalNavigator.msMaxTouchPoints,
      configurable: true,
    });
  });

  it('uses HTML5Backend by default on non-touch devices', async () => {
    // 💡 What: Verifies the default choice for desktop environments.
    // 🎯 Why: Ensures mouse-based drag and drop works correctly.
    render(
      <DragDropContext>
        <div />
      </DragDropContext>
    );

    await waitFor(() => {
      const provider = screen.getByTestId('dnd-provider');
      expect(provider).toHaveAttribute('data-backend', 'HTML5Backend');
      expect(provider).toHaveAttribute('data-has-options', 'false');
    });
  });

  it('uses TouchBackend if window.ontouchstart exists', async () => {
    // 💡 What: Tests touch detection via the presence of ontouchstart.
    // 🎯 Why: Legacy touch support detection.
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
    // 💡 What: Tests modern touch detection via navigator properties.
    // 🎯 Why: Standards-compliant way to detect touch capability.
    Object.defineProperty(window.navigator, 'maxTouchPoints', {
      value: 1,
      configurable: true,
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
    // 💡 What: Tests legacy Microsoft-specific touch detection.
    // 🎯 Why: Compatibility with older Windows touch devices.
    // @ts-ignore
    Object.defineProperty(window.navigator, 'msMaxTouchPoints', {
      value: 1,
      configurable: true,
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
    // 💡 What: Verifies dynamic updates to touch support detection.
    // 🎯 Why: Support for 2-in-1 devices or dev tools mobile simulation.
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
    Object.defineProperty(window.navigator, 'maxTouchPoints', {
      value: 5,
      configurable: true,
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
