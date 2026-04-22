1. **Add `aria-busy` to the SettingsDrawer toggle**
    - Modify `src/components/SettingsDrawer.tsx` to set `aria-busy={isToggling}` on the push notifications `<Switch>` component to improve screen reader feedback.

2. **Add Tooltip to DesktopTaskInput Button**
    - Wrap the "Add" button in `DesktopTaskInput.tsx` with a `Tooltip` component.
    - The tooltip will show a message explaining that a task description is required when the input is empty and the button is disabled.

3. **Add Tooltip to MobileTaskCreator Button**
    - Similar to `DesktopTaskInput`, wrap the "Save" button in `MobileTaskCreator.tsx` with a `Tooltip` component to explain the disabled state.

4. **Complete pre-commit checks**
    - This will include verifying tests and formatting according to the repo standard.

5. **Submit the PR**
    - The branch name and commit message should follow the requirements (e.g. `🎨 Palette: ...`).
