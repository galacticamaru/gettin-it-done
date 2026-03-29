## Palette's Journal
## 2024-03-22 - Filter Tabs Accessibility
**Learning:** Custom tab implementations using `<button>` elements (like those in `FilterTabs.tsx`) often lack semantic state (`aria-pressed` or `aria-selected`) and visual keyboard focus indicators (`focus-visible`). This makes them entirely inaccessible to screen reader and keyboard-only users who cannot perceive their selected state or current focus.
**Action:** When creating or modifying custom tab-like filter components, always ensure they include an `aria-pressed` (or `aria-selected` with `role="tab"`) attribute reflecting their active state, and apply clear `focus-visible` styles (e.g., `focus-visible:ring-2 focus-visible:outline-none`) to support keyboard navigation.
