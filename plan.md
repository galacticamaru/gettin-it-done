1. **DesktopTaskInput.tsx**: Update the tooltip for the Add task button to use a visual keyboard hint `kbd`.
   - Before: `<p>{!newTask.trim() ? 'Task description is required' : 'Add task (Enter)'}</p>`
   - After:
     ```tsx
     <p className="flex items-center gap-1">
       {!newTask.trim() ? 'Task description is required' : (
         <>
           Add task
           <kbd className="px-1.5 py-0.5 bg-muted rounded-md text-xs border font-mono ml-1">Enter</kbd>
         </>
       )}
     </p>
     ```

2. **Verify tests pass**: `pnpm test src/components/DesktopTaskInput.test.tsx` and `pnpm lint`.
3. **Pre-commit checks**.
4. **Submit change**.
