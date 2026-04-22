## 2024-05-18 - Added addTask success test
**Learning:** Adding tasks in the UI relies on calculating a new `sort_order` that is lower than the lowest existing task to prepend it to the list while maintaining sortability. Testing this behavior is critical because failure results in new tasks either appearing at the bottom or disrupting drag-and-drop mechanics. When mocking complex Supabase chains (like `select().eq().order().limit().maybeSingle()`), simulating sequential calls using a counter is an effective way to mock the stateful nature of the `from('table')` queries.
**Action:** Always verify sorting logic (like generating negative indices for prepending) in data insertion tests to ensure UI expectations align with database constraints. Use simple state machines inside mock implementations to handle repeated function calls with different expected chain returns.

## 2024-05-18 - Swallowed Errors Causing UI Data Loss
**Learning:** In React hooks orchestrating asynchronous actions (like `useTaskCreation.ts` calling `useTasks.ts`'s `addTask`), if the underlying service swallows exceptions and returns a dummy/null value instead of throwing, the calling hook might inadvertently execute success paths (like clearing input state). This results in silent user data loss during network failures because the UI resets despite the data not being saved.
**Action:** When testing UI form state or actions that orchestrate multiple layers, explicitly test the failure cases (e.g., when API or underlying hook returns a failure token like `null`) to ensure side-effects like form clearing only occur on true success.

## 2023-10-27 - [useTaskCreation testing]
**Learning:** The `@testing-library/react` package is actually available and handles `renderHook` testing cleanly. We can use `renderHook` and `act` instead of mocking react directly. Also, typecasting mocks using `(module as any)` triggers `@typescript-eslint/no-explicit-any` errors in this repo's ESLint config, which must be suppressed with inline disable comments.
**Action:** When testing hooks, use `renderHook` from `@testing-library/react`. Ensure any explicit any casting for mock overrides is accompanied by an eslint-disable comment.

## 2024-05-18 - [Prevent Duplicate Notifications]
**Learning:** Testing timeout clearances is vital for notification reliability. If an existing active reminder isn't cleared before scheduling a new one for the same item, updating the item causes multiple duplicate notifications to fire.
**Action:** When writing tests for features that schedule future events (like reminders or cron jobs), explicitly test that any previously scheduled events for the same entity are correctly cancelled or overridden to prevent duplicate executions. Use `vi.spyOn(window, 'clearTimeout')` alongside fake timers.

## 2024-06-25 - Silent UI Drift on Optimistic Updates
**Learning:** The `reorderTasks` function uses an optimistic UI update strategy, meaning it updates local state before the database confirms the save. If the database `upsert` fails and the application does not actively revert the local state, the UI falls out of sync with the true backend data. This leads to silent data loss on the next reload, as the user is unaware their changes weren't saved.
**Action:** When testing functions that use optimistic updates, prioritize writing a test for the failure path to ensure the rollback mechanism (e.g., calling a fetch function to resynchronize with the backend) correctly triggers upon error.

## 2024-07-20 - Unhandled null error during preferences insert fallback
**Learning:** In the `useUserPreferences` hook, when no existing preferences are found, it correctly falls back to inserting default preferences. The hook then expects `newPrefs` to contain data, but fails to handle cases where the insert API returns `null` or `undefined` data alongside an error. Testing this fallback is critical to prevent fatal crashes during new user onboarding.
**Action:** Mock the fallback insert operation and its response properly in the test for `useUserPreferences` to ensure it successfully updates the state variables to reflect the default user state without crashing.

## 2024-08-20 - Ignored Computed Variables in Wrapper Functions
**Learning:** In `oneSignalService.ts`, the wrapper function `sendDueDateNotification` generated specialized UI variables (like dynamic notification titles and messages based on time remaining) but failed to pass them down to the base `sendTaskReminder` function, resulting in the computed UI state being silently discarded. Tests for wrapper functions must verify that customized payloads are actually forwarded to the underlying service layers.
**Action:** Always mock underlying functions using `vi.spyOn` and assert they are called with the correct specialized arguments when testing wrapper functions that compute display variables or data transformations.

## 2025-04-12 - Pessimistic updates in `useTasks`
**Learning:** The `toggleTask` logic in `useTasks.ts` operates using a pessimistic update strategy—unlike `reorderTasks`, which updates optimistically and reverts on error. A failure during `toggleTask` simply bails out without mutating local state, which prevents desynchronization between client UI and backend reality but handles failures silently via `console.error`.
**Action:** When testing UI state hooks, first identify if the function uses optimistic or pessimistic updates, as the test assertions differ radically: optimistic updates require asserting state changes immediately and reverting upon mocked failure, while pessimistic updates require asserting no state change upon mocked failure.

## 2024-07-22 - Ghostly Notifications from Uncancelled Timers
**Learning:** When multiple related notification timers (e.g., specific reminder, general due date, and overdue alerts) are scheduled for a single entity, deleting or disabling that entity requires cancelling *all* associated timers. If an orchestrated cancel function fails to clear all related timeout IDs from the global namespace, users will receive "ghostly notifications" for events that no longer exist.
**Action:** When testing cancellation or cleanup logic for scheduled events, test that all specifically prefixed or related timeout IDs are correctly passed to `clearTimeout` to prevent orphaned executions.

## 2024-05-18 - Pessimistic UI State Desynchronization During Delete
**Learning:** In `useTasks.ts`, the `deleteTask` logic operates using a pessimistic update strategy—unlike `reorderTasks`, which updates optimistically and reverts on error. A failure during `deleteTask` simply bails out without mutating the local state. Testing this behavior is critical because deleting is a destructive action; if the UI removes the item optimistically but the DB fails, the user incorrectly thinks the task is deleted, only for it to reappear on the next reload, causing confusion.
**Action:** When testing UI state hooks for destructive actions, first identify if the function uses optimistic or pessimistic updates. For pessimistic updates, assert that the state change does *not* occur upon a mocked failure.

## 2026-04-21 - [Test toggleTask Happy Path]
**Learning:** Testing only error paths leaves a functional gap where a core action might silently fail on the client side even if it works in the backend, meaning UI won't reflect successful actions without refresh. The `useTasks.ts`'s `toggleTask` uses a pessimistic update strategy that immediately updates local state upon successful DB interaction without fetching.
**Action:** Always include a "happy path" test to verify local state mutation corresponding to a successful backend call when dealing with stateful UI hooks, particularly for fundamental actions like completion toggles.

## 2024-05-18 - Missing Component Tests for DesktopTaskInput
**Learning:** Core interactive components like `DesktopTaskInput` which handle the primary user flow (adding a task) lacked unit testing, leaving crucial user interactions (like disabling submission for empty text, responding to the Enter key, and linking UI with the underlying state updater) unverified.
**Action:** Ensure foundational interactive UI components have test coverage for basic event handling, accessibility states (e.g., button disabled state), and integration with their injected callback props. Add `DesktopTaskInput.test.tsx` to explicitly test empty/whitespace handling and keyboard event triggers.
