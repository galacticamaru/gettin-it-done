## 2023-10-27 - [useTaskCreation testing]
**Learning:** The `@testing-library/react` package is actually available and handles `renderHook` testing cleanly. We can use `renderHook` and `act` instead of mocking react directly. Also, typecasting mocks using `(module as any)` triggers `@typescript-eslint/no-explicit-any` errors in this repo's ESLint config, which must be suppressed with inline disable comments.
**Action:** When testing hooks, use `renderHook` from `@testing-library/react`. Ensure any explicit any casting for mock overrides is accompanied by an eslint-disable comment.
