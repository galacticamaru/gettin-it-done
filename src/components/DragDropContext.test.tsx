import { render, act, screen } from '@testing-library/react';
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
  const originalNavigator = window.navigator;

  beforeEach(() => {
    vi.clearAllMocks();

    // Completely remove ontouchstart to ensure 'in' operator returns false
    // @ts-ignore
    delete window.ontouchstart;

    // Create a fresh mock navigator
    const mockNavigator = {
      ...originalNavigator,
      maxTouchPoints: 0,
      msMaxTouchPoints: 0,
    };

    Object.defineProperty(window, 'navigator', {
      value: mockNavigator,
      configurable: true,
      writable: true
    });
  });

  afterEach(() => {
    // Restore original navigator
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      configurable: true,
    });
  });

  it('uses HTML5Backend by default on non-touch devices', () => {
    render(
      <DragDropContext>
        <div data-testid="child" />
      </DragDropContext>
    );

    const provider = screen.getByTestId('dnd-provider');
    expect(provider).toHaveAttribute('data-backend', 'HTML5Backend');
    expect(provider).toHaveAttribute('data-has-options', 'false');
  });

  it('uses TouchBackend if window.ontouchstart exists', () => {
    // @ts-ignore
    window.ontouchstart = () => {};

    render(
      <DragDropContext>
        <div />
      </DragDropContext>
    );

    const provider = screen.getByTestId('dnd-provider');
    expect(provider).toHaveAttribute('data-backend', 'TouchBackend');
    expect(provider).toHaveAttribute('data-has-options', 'true');
  });

  it('uses TouchBackend if navigator.maxTouchPoints > 0', () => {
    Object.defineProperty(window.navigator, 'maxTouchPoints', {
      value: 1,
      configurable: true,
    });

    render(
      <DragDropContext>
        <div />
      </DragDropContext>
    );

    const provider = screen.getByTestId('dnd-provider');
    expect(provider).toHaveAttribute('data-backend', 'TouchBackend');
  });

  it('uses TouchBackend if navigator.msMaxTouchPoints > 0', () => {
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

    const provider = screen.getByTestId('dnd-provider');
    expect(provider).toHaveAttribute('data-backend', 'TouchBackend');
  });

  it('re-checks touch support on window resize', () => {
    render(
      <DragDropContext>
        <div />
      </DragDropContext>
    );

    // Initial check: HTML5
    expect(screen.getByTestId('dnd-provider')).toHaveAttribute('data-backend', 'HTML5Backend');

    // Simulate switching to touch support (e.g. 2-in-1 device)
    Object.defineProperty(window.navigator, 'maxTouchPoints', {
      value: 5,
      configurable: true,
    });

    // Trigger resize event
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(screen.getByTestId('dnd-provider')).toHaveAttribute('data-backend', 'TouchBackend');
  });
});
