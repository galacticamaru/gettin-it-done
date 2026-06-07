1. **Identify the UX/accessibility issue:**
   The `Palette` memory indicates:
   > When using Radix UI / shadcn `TooltipProvider` components throughout the application, explicitly set the `delayDuration` prop (e.g., `delayDuration={500}`) to override the sluggish 700ms default and ensure a consistent, more responsive user experience.

   Looking at the codebase, `delayDuration={500}` is applied in `src/components/TaskItem.tsx` and `delayDuration={0}` is applied in `src/components/ui/sidebar.tsx`, but missing in:
   - `src/components/EmojiPicker.tsx`
   - `src/components/DesktopTaskInput.tsx` (multiple times)
   - `src/components/MobileTaskCreator.tsx`
   - `src/components/ThemeToggle.tsx`
   - `src/components/TaskOptionsModal.tsx`
   - `src/components/SettingsDrawer.tsx`
   - `src/pages/Auth.tsx`

   We will update these files to set `delayDuration={500}` on `<TooltipProvider>`.

2. **Implement changes:**
   - Modify the missing `<TooltipProvider>` components to `<TooltipProvider delayDuration={500}>`.

3. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.**
   - Run linter (`pnpm lint`) to ensure no new errors are introduced.
   - Run tests (`pnpm test`) to ensure nothing breaks.
   - Run `pnpm build` to verify the build passes.

4. **Submit PR:**
   - Commit message: "🎨 Palette: Add delayDuration to TooltipProvider for consistent UX"
