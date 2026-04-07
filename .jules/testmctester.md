## 2024-05-18 - Swallowed Errors Causing UI Data Loss
**Learning:** In React hooks orchestrating asynchronous actions (like `useTaskCreation.ts` calling `useTasks.ts`'s `addTask`), if the underlying service swallows exceptions and returns a dummy/null value instead of throwing, the calling hook might inadvertently execute success paths (like clearing input state). This results in silent user data loss during network failures because the UI resets despite the data not being saved.
**Action:** When testing UI form state or actions that orchestrate multiple layers, explicitly test the failure cases (e.g., when API or underlying hook returns a failure token like `null`) to ensure side-effects like form clearing only occur on true success.

## 2023-10-27 - [useTaskCreation testing]
**Learning:** The `@testing-library/react` package is actually available and handles `renderHook` testing cleanly. We can use `renderHook` and `act` instead of mocking react directly. Also, typecasting mocks using `(module as any)` triggers `@typescript-eslint/no-explicit-any` errors in this repo's ESLint config, which must be suppressed with inline disable comments.
**Action:** When testing hooks, use `renderHook` from `@testing-library/react`. Ensure any explicit any casting for mock overrides is accompanied by an eslint-disable comment.
