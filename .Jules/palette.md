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

## 2026-04-05 - Empty States
**Learning:** Pure text empty states are easily overlooked and visually unengaging. Providing large, thematic icons (with low opacity to indicate an inactive state) alongside the message greatly improves the readability and aesthetics of the state. Users can more quickly comprehend the context (e.g., viewing a list of completed items vs a list of active items).
**Action:** Always pair empty state text with a relevant, large, low-opacity icon (`h-12 w-12 text-muted-foreground/30`) to provide better visual context to the user.
