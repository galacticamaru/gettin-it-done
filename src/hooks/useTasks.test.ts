import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTasks } from './useTasks';
import { supabase } from '@/integrations/supabase/client';

// Mock the dependencies
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: { id: 'test-user-id' } }))
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}));

// We must mock React hooks directly by mocking the 'react' module before importing it.
let tasksState: any[];
let setTasksMock: any;

vi.mock('react', async (importOriginal) => {
  const original = await importOriginal<typeof import('react')>();
  return {
    ...original,
    useState: vi.fn((initialState: any) => {
      if (initialState === true || initialState === false) {
        return [initialState, vi.fn()]; // loading state
      }
      // Return the dynamically updating tasksState
      return [tasksState, setTasksMock];
    }),
    useEffect: vi.fn(),
  };
});

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    tasksState = [
      { id: 'task-1', text: 'Task 1', completed: false, sortOrder: 0 },
      { id: 'task-2', text: 'Task 2', completed: false, sortOrder: 1 },
      { id: 'task-3', text: 'Task 3', completed: false, sortOrder: 2 },
    ];

    setTasksMock = vi.fn((newState) => {
      if (typeof newState === 'function') {
        tasksState = newState(tasksState);
      } else {
        tasksState = newState;
      }
    });
  });

  it('addTask should return null when Supabase insert fails', async () => {
    const errorMsg = 'Failed to insert task';
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock minimum sort_order fetch
    const selectMock1 = vi.fn().mockReturnThis();
    const eqMock1 = vi.fn().mockReturnThis();
    const orderMock1 = vi.fn().mockReturnThis();
    const limitMock1 = vi.fn().mockReturnThis();
    const maybeSingleMock1 = vi.fn().mockResolvedValue({ data: { sort_order: 0 }, error: null });

    // Mock insert failure
    const insertMock = vi.fn().mockReturnThis();
    const selectMock2 = vi.fn().mockReturnThis();
    const singleMock2 = vi.fn().mockResolvedValue({ data: null, error: new Error(errorMsg) });

    const fromMock = vi.fn().mockImplementation((table) => {
      if (table === 'user_tasks') {
        // Simple state machine to differentiate calls
        let callCount = 0;
        return {
          select: (...args: any[]) => {
            callCount++;
            if (callCount === 1) { // First select for min sort_order
              return { eq: eqMock1.mockReturnValue({ order: orderMock1.mockReturnValue({ limit: limitMock1.mockReturnValue({ maybeSingle: maybeSingleMock1 }) }) }) };
            }
            // Second select after insert
            return { single: singleMock2 };
          },
          insert: insertMock.mockReturnValue({ select: selectMock2.mockReturnValue({ single: singleMock2 }) }),
        };
      }
      return {};
    });

    (supabase.from as any).mockImplementation(fromMock);

    const { addTask } = useTasks();

    const result = await addTask({ text: 'New Task' });

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error adding task:', new Error(errorMsg));

    // Check that state didn't change
    expect(setTasksMock).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('reorderTasks should send text and other required fields in upsert payload', async () => {
    const upsertMock = vi.fn().mockResolvedValue({ data: null, error: null });
    const fromMock = vi.fn().mockReturnValue({ upsert: upsertMock, select: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis() });
    (supabase.from as any).mockImplementation(fromMock);

    const { reorderTasks } = useTasks();

    // Drag task 1 to position of task 3
    await reorderTasks('task-1', 'task-3');

    // Expected updated tasks logic:
    // [task-1, task-2, task-3]
    // move index 0 to index 2
    // -> remove at 0 -> [task-2, task-3]
    // -> insert task-1 at 2 -> [task-2, task-3, task-1]

    expect(setTasksMock).toHaveBeenCalled();
    expect(upsertMock).toHaveBeenCalledWith([
      { id: 'task-2', user_id: 'test-user-id', sort_order: 0, text: 'Task 2' },
      { id: 'task-3', user_id: 'test-user-id', sort_order: 1, text: 'Task 3' },
      { id: 'task-1', user_id: 'test-user-id', sort_order: 2, text: 'Task 1' },
    ]);
  });
});
