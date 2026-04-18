import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from './use-mobile';

describe('useIsMobile', () => {
  const MOBILE_BREAKPOINT = 768;
  let onChangeCallback: ((e: any) => void) | null = null;

  beforeEach(() => {
    onChangeCallback = null;

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: window.innerWidth < MOBILE_BREAKPOINT,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((event, callback) => {
          if (event === 'change') {
            onChangeCallback = callback;
          }
        }),
        removeEventListener: vi.fn((event, callback) => {
          if (event === 'change') {
            onChangeCallback = null;
          }
        }),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return false initially when window width is desktop', () => {
    // 💡 What: Tests that useIsMobile returns false when the viewport is wider than the mobile breakpoint.
    // 🎯 Why: Components use this hook to decide whether to render mobile or desktop-specific UI.

    window.innerWidth = 1024;
    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it('should return true initially when window width is mobile', () => {
    // 💡 What: Tests that useIsMobile returns true when the viewport is narrower than the mobile breakpoint.
    // 🎯 Why: Ensures mobile users get the optimized mobile experience immediately on load.

    window.innerWidth = 375;
    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('should update when window is resized from desktop to mobile', () => {
    // 💡 What: Tests that the hook reacts to window resize events via the media query listener.
    // 🎯 Why: Users might resize their browser or rotate their devices; the UI should adapt dynamically.

    window.innerWidth = 1024;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => {
      window.innerWidth = 375;
      if (onChangeCallback) {
        onChangeCallback({ matches: true });
      }
    });

    expect(result.current).toBe(true);
  });

  it('should update when window is resized from mobile to desktop', () => {
    // 💡 What: Tests that the hook correctly switches back to desktop mode when the window is enlarged.

    window.innerWidth = 375;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);

    act(() => {
      window.innerWidth = 1024;
      if (onChangeCallback) {
        onChangeCallback({ matches: false });
      }
    });

    expect(result.current).toBe(false);
  });

  it('should clean up the event listener on unmount', () => {
    // 💡 What: Tests that the change event listener is removed when the component using the hook is unmounted.
    // 🎯 Why: Prevents memory leaks and unexpected behavior from orphaned event listeners.

    const removeEventListenerSpy = vi.fn();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: removeEventListenerSpy,
      })),
    });

    const { unmount } = renderHook(() => useIsMobile());
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
