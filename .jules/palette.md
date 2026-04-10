## Palette's Journal
## 2024-03-22 - Filter Tabs Accessibility
**Learning:** Custom tab implementations using `<button>` elements (like those in `FilterTabs.tsx`) often lack semantic state (`aria-pressed` or `aria-selected`) and visual keyboard focus indicators (`focus-visible`). This makes them entirely inaccessible to screen reader and keyboard-only users who cannot perceive their selected state or current focus.
**Action:** When creating or modifying custom tab-like filter components, always ensure they include an `aria-pressed` (or `aria-selected` with `role="tab"`) attribute reflecting their active state, and apply clear `focus-visible` styles (e.g., `focus-visible:ring-2 focus-visible:outline-none`) to support keyboard navigation.

## 2024-03-22 - Navigation Bar Accessibility
**Learning:** Bottom navigation bars (like `BottomNav.tsx`) acting as view switchers function as tabs. Without `role="tablist"` on the container and `role="tab"` with `aria-selected` on the items, screen reader users do not receive context about the relationship and active state of the items. Additionally, a lack of `focus-visible` styles prevents keyboard users from seeing which item is focused.
**Action:** When implementing or modifying view-switching navigation bars, ensure the container has `role="tablist"`, each item has `role="tab"` and `aria-selected` based on the current active state, and apply clear `focus-visible` utility classes to show keyboard focus.

## 2026-04-04 - Task List Action Context
**Learning:** Icon-only action buttons within lists (like Delete or Complete toggles for tasks) often have generic `aria-label`s like 'Delete task' or 'Mark as complete'. When a screen reader user navigates through a list via tab key, hearing repetitive identical labels without context is confusing. Also, custom completion toggles act as checkboxes but lack the semantic `role="checkbox"` and `aria-checked` states.
**Action:** Always interpolate the item's name or title into the `aria-label` for list actions (e.g., `aria-label={\`Delete task "${task.text}"\`}`) to provide specific context, and apply `role="checkbox"` with `aria-checked` to custom completion toggles.
## 2026-04-05 - Empty State UX Pattern\n**Learning:** The previous task list empty state was a plain text `<p>` tag, which was easily overlooked and felt unpolished. The introduction of an empty state component with a `lucide-react` icon (ClipboardList), structured layout (container with `bg-secondary/10` and dashed border), clear heading, and description significantly improves the perceived quality and user guidance. This approach uses existing Tailwind tokens perfectly.\n**Action:** When encountering plain-text empty states in other components, apply this reusable card-based layout pattern (Icon in a rounded-full background, bold title, muted description) to maintain consistency and delight.

## 2024-04-08 - Dynamic ARIA labels for Toggle Buttons
**Learning:** For stateful toggle buttons like theme switchers, static labels (e.g., "Toggle theme") provide insufficient context for screen reader users and tooltips. Users need to know what action the button will perform when clicked, not just its general function.
**Action:** Always use dynamic `aria-label` and `title` attributes that reflect the *target* state (e.g., "Switch to dark theme") rather than the *current* state or a generic description.

## 2024-04-10 - Task Submission Loading State
**Learning:** In both the mobile (`MobileTaskCreator`) and desktop (`DesktopTaskInput`) task creation components, submitting a new task fires an asynchronous network request (`addTask`). Without an explicit loading state (`isSubmitting`) bound to the "Add" or "Save" buttons, users receive no immediate feedback that their action is processing, which can lead to double-submissions and a confusing user experience.
**Action:** When implementing asynchronous form submissions or actions, always maintain a local or hook-level loading state (e.g., `isSubmitting`). Bind this state to the relevant submit buttons to disable them and update their text (e.g., "Adding...") or show a spinner to communicate progress to the user.
