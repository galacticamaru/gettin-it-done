import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUserPreferences } from './useUserPreferences';
import { supabase } from '@/integrations/supabase/client';

// Keep the old manual React mock, because we are using vitest without JSDOM/full React environment setup properly sometimes,
// and it seems `renderHook` from `@testing-library/react` triggers timeouts or `loading` state never flips
// because the `useEffect` from React might not be firing exactly as expected in this setup.
// Actually, looking at the previous working tests in this repo (`useTasks.test.ts`), they use manual mocking too!
// I will rewrite this to use the *correctly structured* manual mock that worked perfectly in Step 1,
// but fix the floating `it` blocks and add the `null` failure test to satisfy code review.

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: { id: 'test-user-id' } }))
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}));

// We must mock React hooks directly by mocking the 'react' module before importing it.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let preferencesState: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let setPreferencesMock: any;
let loadingState: boolean = true;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let setLoadingMock: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let refValue: any;

vi.mock('react', async (importOriginal) => {
  const original = await importOriginal<typeof import('react')>();
  return {
    ...original,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useState: vi.fn((initialState: any) => {
      if (initialState === true || initialState === false) {
        return [loadingState, setLoadingMock];
      }
      return [preferencesState, setPreferencesMock];
    }),
    useEffect: vi.fn(),
    useRef: vi.fn((initialValue) => {
      return {
        get current() {
          return refValue !== undefined ? refValue : initialValue;
        },
        set current(val) {
          refValue = val;
        }
      };
    }),
    useCallback: vi.fn((cb) => cb),
  };
});

describe('useUserPreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    preferencesState = null;
    loadingState = true;
    refValue = undefined;

    setPreferencesMock = vi.fn((newState) => {
      if (typeof newState === 'function') {
        preferencesState = newState(preferencesState);
      } else {
        preferencesState = newState;
      }
    });

    setLoadingMock = vi.fn((newState) => {
      loadingState = newState;
    });
  });

  it('should create default preferences on load if none exist', async () => {
    // Mock select returning no data (null) to simulate a new user without preferences
    const eqMock1 = vi.fn().mockReturnThis();
    const maybeSingleMock1 = vi.fn().mockResolvedValue({ data: null, error: null });

    // Mock insert successfully creating default preferences
    const insertMock = vi.fn().mockReturnThis();
    const selectMock2 = vi.fn().mockReturnThis();
    const singleMock2 = vi.fn().mockResolvedValue({
      data: {
        id: 'new-prefs-id',
        user_id: 'test-user-id',
        daily_digest_enabled: false,
        onesignal_subscription_id: null
      },
      error: null
    });

    const fromMock = vi.fn().mockImplementation((table) => {
      if (table === 'user_preferences') {
        let selectCallCount = 0;
        return {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          select: (...args: any[]) => {
            selectCallCount++;
            if (selectCallCount === 1) {
              return { eq: eqMock1.mockReturnValue({ maybeSingle: maybeSingleMock1 }) };
            }
            return { single: singleMock2 };
          },
          insert: insertMock.mockReturnValue({ select: selectMock2.mockReturnValue({ single: singleMock2 }) }),
        };
      }
      return {};
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from as any).mockImplementation(fromMock);

    const { refetch } = useUserPreferences();

    // Call fetchPreferences manually since useEffect is mocked
    await refetch();

    // Assert that we attempted to insert default preferences
    expect(insertMock).toHaveBeenCalledWith({
      user_id: 'test-user-id',
      daily_digest_enabled: false,
    });

    // Assert the final state matches the newly created defaults
    expect(setPreferencesMock).toHaveBeenCalledWith({
      id: 'new-prefs-id',
      daily_digest_enabled: false,
      onesignal_subscription_id: null,
    });

    // Assert loading state was updated
    expect(setLoadingMock).toHaveBeenCalledWith(false);
  });

  it('should gracefully handle errors when fallback insert fails or returns null', async () => {
    // 💡 What: Tests the fallback logic when the database fails to create default preferences.
    // 🎯 Why: If inserting defaults fails (e.g. database error), the hook should not crash.

    const errorMsg = 'Database insert failed';
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock select returning no data (null) to simulate a new user without preferences
    const eqMock1 = vi.fn().mockReturnThis();
    const maybeSingleMock1 = vi.fn().mockResolvedValue({ data: null, error: null });

    // Mock insert FAILING
    const insertMock = vi.fn().mockReturnThis();
    const selectMock2 = vi.fn().mockReturnThis();
    // Simulate error during insert single AND returning null data
    const singleMock2 = vi.fn().mockResolvedValue({
      data: null,
      error: new Error(errorMsg)
    });

    const fromMock = vi.fn().mockImplementation((table) => {
      if (table === 'user_preferences') {
        let selectCallCount = 0;
        return {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          select: (...args: any[]) => {
            selectCallCount++;
            if (selectCallCount === 1) {
              return { eq: eqMock1.mockReturnValue({ maybeSingle: maybeSingleMock1 }) };
            }
            return { single: singleMock2 }; // Called by insert fallback
          },
          insert: insertMock.mockReturnValue({ select: selectMock2.mockReturnValue({ single: singleMock2 }) }),
        };
      }
      return {};
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from as any).mockImplementation(fromMock);

    const { refetch } = useUserPreferences();

    await refetch();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching user preferences:', new Error(errorMsg));

    // Preferences should not be set
    expect(setPreferencesMock).not.toHaveBeenCalled();
    // But loading should be false
    expect(setLoadingMock).toHaveBeenCalledWith(false);

    consoleErrorSpy.mockRestore();
  });

  it('updateOneSignalSubscriptionId should skip database call if value has not changed', async () => {
    const updateMock = vi.fn().mockReturnThis();

    const fromMock = vi.fn().mockImplementation((table) => {
      if (table === 'user_preferences') {
        return {
          update: updateMock,
        };
      }
      return {};
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from as any).mockImplementation(fromMock);

    // Set up mock state
    preferencesState = {
      id: 'existing-prefs-id',
      daily_digest_enabled: false,
      onesignal_subscription_id: 'existing-sub-id',
    };

    // Also mock the ref value which is checked first
    refValue = 'existing-sub-id';

    const { updateOneSignalSubscriptionId } = useUserPreferences();

    // Reset setPreferencesMock because initialization of the hook calls it in our custom setup
    setPreferencesMock.mockClear();

    await updateOneSignalSubscriptionId('existing-sub-id');

    expect(updateMock).not.toHaveBeenCalled();
    expect(setPreferencesMock).not.toHaveBeenCalled();
  });

  it('updateDailyDigestEnabled should update state and db', async () => {
    const updateMock = vi.fn().mockReturnThis();
    const eqMock = vi.fn().mockResolvedValue({ error: null });

    const fromMock = vi.fn().mockImplementation((table) => {
      if (table === 'user_preferences') {
        return {
          update: updateMock.mockReturnValue({ eq: eqMock }),
        };
      }
      return {};
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from as any).mockImplementation(fromMock);

    // Set up mock state
    preferencesState = {
      id: 'existing-prefs-id',
      daily_digest_enabled: false,
      onesignal_subscription_id: 'sub-id',
    };

    const { updateDailyDigestEnabled } = useUserPreferences();

    await updateDailyDigestEnabled(true);

    expect(updateMock).toHaveBeenCalledWith({
      daily_digest_enabled: true,
    });
    expect(eqMock).toHaveBeenCalledWith('id', 'existing-prefs-id');

    // verify state updated via updater function
    expect(preferencesState).toEqual({
      id: 'existing-prefs-id',
      daily_digest_enabled: true,
      onesignal_subscription_id: 'sub-id',
    });
  });

  it('updateDailyDigestEnabled should not update state if db update fails', async () => {
    // 💡 What: Tests the error path of updating a user preference.
    // 🎯 Why: Updating preferences is a pessimistic action. If the UI updates but the DB fails,
    // the user thinks their preference is saved when it isn't.

    const errorMsg = 'Update failed';
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock update failure
    const updateMock = vi.fn().mockReturnThis();
    const eqMock = vi.fn().mockResolvedValue({ error: new Error(errorMsg) });

    const fromMock = vi.fn().mockImplementation((table) => {
      if (table === 'user_preferences') {
        return {
          update: updateMock.mockReturnValue({ eq: eqMock }),
        };
      }
      return {};
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from as any).mockImplementation(fromMock);

    // Set up mock state
    preferencesState = {
      id: 'existing-prefs-id',
      daily_digest_enabled: false,
      onesignal_subscription_id: 'sub-id',
    };

    const { updateDailyDigestEnabled } = useUserPreferences();

    // Reset setPreferencesMock because initialization of the hook calls it in our custom setup
    setPreferencesMock.mockClear();

    await updateDailyDigestEnabled(true);

    // Verify it attempted to update the database
    expect(updateMock).toHaveBeenCalledWith({
      daily_digest_enabled: true,
    });
    expect(eqMock).toHaveBeenCalledWith('id', 'existing-prefs-id');

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating daily digest preference:', new Error(errorMsg));

    // Verify state was NOT updated (pessimistic update behavior)
    expect(setPreferencesMock).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
