import { renderHook, act } from '@testing-library/react';

// ... other imports

describe('useTasks', () => {
    it('toggleTask should return early if task id is not found in local state', async () => {
    // 💡 What: Tests the early exit condition in toggleTask when a non-existent ID is provided.
    // 🎯 Why: Prevents unnecessary database calls and potential crashes if the UI somehow
    // triggers a toggle on a stale or phantom task.

    const updateMock = vi.fn().mockReturnThis();

    const fromMock = vi.fn().mockImplementation((table) => {
      if (table === 'user_tasks') {
        return {
          update: updateMock,
        };
      }
      return {};
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from as any).mockImplementation(fromMock);

    const { result } = renderHook(() => useTasks());

    // Attempt to toggle a non-existent task
    await act(async () => {
      await result.current.toggleTask('non-existent-task-id');
    });

    // Verify it did not attempt to update the database
    expect(updateMock).not.toHaveBeenCalled();

    // We can't verify setTasksMock here since we are using renderHook.
    // But we know it didn't do the database call.
  });
});
