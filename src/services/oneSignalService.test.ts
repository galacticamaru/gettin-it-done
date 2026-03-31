import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { oneSignalService } from './oneSignalService';

describe('OneSignalService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Reset window.OneSignal mock before each test
    window.OneSignal = {
      Notifications: {
        requestPermission: vi.fn(),
        permission: false,
      },
      User: {
        PushSubscription: {
          id: null,
          optedIn: false,
          optIn: vi.fn(),
          optOut: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
      },
    } as any;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('isPermissionGranted should return false when OneSignal is not available', async () => {
    window.OneSignal = undefined as any;
    const result = await oneSignalService.isPermissionGranted();
    expect(result).toBe(false);
  });

  it('isPermissionGranted should return true when permission is granted', async () => {
    window.OneSignal!.Notifications.permission = true as any;
    const result = await oneSignalService.isPermissionGranted();
    expect(result).toBe(true);
  });

  it('isPermissionGranted should return false when permission is not granted', async () => {
    window.OneSignal!.Notifications.permission = false as any;
    const result = await oneSignalService.isPermissionGranted();
    expect(result).toBe(false);
  });

  it('isSubscribed should return false when OneSignal is not available', async () => {
    window.OneSignal = undefined as any;
    const result = await oneSignalService.isSubscribed();
    expect(result).toBe(false);
  });

  it('isSubscribed should return true when subscription ID exists and user opted in', async () => {
    window.OneSignal!.User.PushSubscription.id = 'mock-id' as any;
    window.OneSignal!.User.PushSubscription.optedIn = true as any;
    const result = await oneSignalService.isSubscribed();
    expect(result).toBe(true);
  });

  it('isSubscribed should return false when subscription ID is missing', async () => {
    window.OneSignal!.User.PushSubscription.id = null as any;
    window.OneSignal!.User.PushSubscription.optedIn = true as any;
    const result = await oneSignalService.isSubscribed();
    expect(result).toBe(false);
  });

  it('isSubscribed should return false when user has not opted in', async () => {
    window.OneSignal!.User.PushSubscription.id = 'mock-id' as any;
    window.OneSignal!.User.PushSubscription.optedIn = false as any;
    const result = await oneSignalService.isSubscribed();
    expect(result).toBe(false);
  });

  it('getUserId should return subscription ID when available', async () => {
    window.OneSignal!.User.PushSubscription.id = 'mock-id' as any;
    const result = await oneSignalService.getUserId();
    expect(result).toBe('mock-id');
  });

  it('getUserId should return null when subscription ID is missing', async () => {
    window.OneSignal!.User.PushSubscription.id = null as any;
    const result = await oneSignalService.getUserId();
    expect(result).toBe(null);
  });

  it('subscribeUser should return early if already subscribed', async () => {
    window.OneSignal!.User.PushSubscription.id = 'mock-id' as any;
    window.OneSignal!.User.PushSubscription.optedIn = true as any;
    const result = await oneSignalService.subscribeUser();
    expect(result).toBe(true);
  });

  it('subscribeUser should return false if permission is denied', async () => {
    window.OneSignal!.Notifications.requestPermission = vi.fn().mockResolvedValue(false);
    const result = await oneSignalService.subscribeUser();
    expect(result).toBe(false);
  });

  it('subscribeUser should handle successful opt-in via event listener', async () => {
    window.OneSignal!.Notifications.requestPermission = vi.fn().mockResolvedValue(true);

    let changeCallback: any = null;
    window.OneSignal!.User.PushSubscription.addEventListener = vi.fn((event, callback) => {
      if (event === 'change') changeCallback = callback;
    });

    window.OneSignal!.User.PushSubscription.optIn = vi.fn().mockResolvedValue(undefined);

    const subscribePromise = oneSignalService.subscribeUser();

    // Use vi.advanceTimersByTimeAsync slightly to flush the microtask queue (awaits)
    await vi.advanceTimersByTimeAsync(10);

    expect(changeCallback).not.toBeNull();
    changeCallback({ current: { optedIn: true } });

    const result = await subscribePromise;
    expect(result).toBe(true);
  });

  it('subscribeUser should fallback to checking current status after timeout if event listener does not trigger', async () => {
    window.OneSignal!.Notifications.requestPermission = vi.fn().mockResolvedValue(true);
    window.OneSignal!.User.PushSubscription.optIn = vi.fn().mockResolvedValue(undefined);

    window.OneSignal!.User.PushSubscription.id = 'mock-id' as any;
    window.OneSignal!.User.PushSubscription.optedIn = false as any;

    const subscribePromise = oneSignalService.subscribeUser();

    await vi.advanceTimersByTimeAsync(10);

    // Before timeout finishes, status changes internally
    window.OneSignal!.User.PushSubscription.optedIn = true as any;

    // Trigger the timeout (5000ms)
    await vi.advanceTimersByTimeAsync(5000);

    const result = await subscribePromise;
    expect(result).toBe(true);
  });

  it('unsubscribeUser should return true if already unsubscribed', async () => {
    window.OneSignal!.User.PushSubscription.id = 'mock-id' as any;
    window.OneSignal!.User.PushSubscription.optedIn = false as any;
    const result = await oneSignalService.unsubscribeUser();
    expect(result).toBe(true);
  });

  it('unsubscribeUser should handle successful opt-out via event listener', async () => {
    window.OneSignal!.User.PushSubscription.id = 'mock-id' as any;
    window.OneSignal!.User.PushSubscription.optedIn = true as any;

    let changeCallback: any = null;
    window.OneSignal!.User.PushSubscription.addEventListener = vi.fn((event, callback) => {
      if (event === 'change') changeCallback = callback;
    });

    window.OneSignal!.User.PushSubscription.optOut = vi.fn().mockResolvedValue(undefined);

    const unsubscribePromise = oneSignalService.unsubscribeUser();

    await vi.advanceTimersByTimeAsync(10);

    expect(changeCallback).not.toBeNull();
    changeCallback({ current: { optedIn: false } });

    const result = await unsubscribePromise;
    expect(result).toBe(true);
  });

  it('unsubscribeUser should fallback to checking current status after timeout if event listener does not trigger', async () => {
    window.OneSignal!.User.PushSubscription.id = 'mock-id' as any;
    window.OneSignal!.User.PushSubscription.optedIn = true as any;

    window.OneSignal!.User.PushSubscription.optOut = vi.fn().mockResolvedValue(undefined);

    const unsubscribePromise = oneSignalService.unsubscribeUser();

    await vi.advanceTimersByTimeAsync(10);

    window.OneSignal!.User.PushSubscription.optedIn = false as any;

    await vi.advanceTimersByTimeAsync(5000);

    const result = await unsubscribePromise;
    expect(result).toBe(true);
  });
});
