import { render, act } from '@testing-library/react';
import { DragDropContext } from './DragDropContext';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import React from 'react';

// 💡 What: Mocks for react-dnd and its backends to verify DragDropContext behavior
// 🎯 Why: We need to ensure the correct backend is chosen based on device touch capabilities

vi.mock('react-dnd', async () => {
  const actual = await vi.importActual('react-dnd');
  return {
    ...actual,
    DndProvider: vi.fn(({ children }) => <div data-testid="dnd-provider">{children}</div>),
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
    // Reset window and navigator properties before each test
    Object.defineProperty(window, 'ontouchstart', {
      value: undefined,
      configurable: true,
      writable: true
    });

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
        <div />
      </DragDropContext>
    );

    expect(DndProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        backend: HTML5Backend,
        options: undefined,
      }),
      expect.anything()
    );
  });

  it('uses TouchBackend if window.ontouchstart exists', () => {
    Object.defineProperty(window, 'ontouchstart', {
      value: () => {},
      configurable: true,
    });

    render(
      <DragDropContext>
        <div />
      </DragDropContext>
    );

    expect(DndProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        backend: TouchBackend,
        options: { enableMouseEvents: true, delayTouchStart: 200 },
      }),
      expect.anything()
    );
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

    expect(DndProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        backend: TouchBackend,
      }),
      expect.anything()
    );
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

    expect(DndProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        backend: TouchBackend,
      }),
      expect.anything()
    );
  });

  it('re-checks touch support on window resize', () => {
    render(
      <DragDropContext>
        <div />
      </DragDropContext>
    );

    // Initial call: HTML5
    expect(DndProvider).toHaveBeenLastCalledWith(
      expect.objectContaining({ backend: HTML5Backend }),
      expect.anything()
    );

    // Simulate switching to touch support (e.g. 2-in-1 device)
    Object.defineProperty(window.navigator, 'maxTouchPoints', {
      value: 5,
      configurable: true,
    });

    // Trigger resize event
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(DndProvider).toHaveBeenLastCalledWith(
      expect.objectContaining({ backend: TouchBackend }),
      expect.anything()
    );
  });
});
