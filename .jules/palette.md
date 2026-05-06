## Palette's Journal
## 2026-03-22 - Filter Tabs Accessibility
**Learning:** Custom tab implementations using `<button>` elements (like those in `FilterTabs.tsx`) often lack semantic state (`aria-pressed` or `aria-selected`) and visual keyboard focus indicators (`focus-visible`). This makes them entirely inaccessible to screen reader and keyboard-only users who cannot perceive their selected state or current focus.
**Action:** When creating or modifying custom tab-like filter components, always ensure they include an `aria-pressed` (or `aria-selected` with `role="tab"`) attribute reflecting their active state, and apply clear `focus-visible` styles (e.g., `focus-visible:ring-2 focus-visible:outline-none`) to support keyboard navigation.

## 2026-03-22 - Navigation Bar Accessibility
**Learning:** Bottom navigation bars (like `BottomNav.tsx`) acting as view switchers function as tabs. Without `role="tablist"` on the container and `role="tab"` with `aria-selected` on the items, screen reader users do not receive context about the relationship and active state of the items. Additionally, a lack of `focus-visible` styles prevents keyboard users from seeing which item is focused.
**Action:** When implementing or modifying view-switching navigation bars, ensure the container has `role="tablist"`, each item has `role="tab"` and `aria-selected` based on the current active state, and apply clear `focus-visible` utility classes to show keyboard focus.

## 2026-04-04 - Task List Action Context
**Learning:** Icon-only action buttons within lists (like Delete or Complete toggles for tasks) often have generic `aria-label`s like 'Delete task' or 'Mark as complete'. When a screen reader user navigates through a list via tab key, hearing repetitive identical labels without context is confusing. Also, custom completion toggles act as checkboxes but lack the semantic `role="checkbox"` and `aria-checked` states.
**Action:** Always interpolate the item's name or title into the `aria-label` for list actions (e.g., `aria-label={\`Delete task "${task.text}"\`}`) to provide specific context, and apply `role="checkbox"` with `aria-checked` to custom completion toggles.

## 2026-04-05 - Empty State UX Pattern
**Learning:** The previous task list empty state was a plain text `<p>` tag, which was easily overlooked and felt unpolished. The introduction of an empty state component with a `lucide-react` icon (ClipboardList), structured layout (container with `bg-secondary/10` and dashed border), clear heading, and description significantly improves the perceived quality and user guidance. This approach uses existing Tailwind tokens perfectly.
**Action:** When encountering plain-text empty states in other components, apply this reusable card-based layout pattern (Icon in a rounded-full background, bold title, muted description) to maintain consistency and delight.

## 2026-04-08 - Dynamic ARIA labels for Toggle Buttons
**Learning:** For stateful toggle buttons like theme switchers, static labels (e.g., "Toggle theme") provide insufficient context for screen reader users and tooltips. Users need to know what action the button will perform when clicked, not just its general function.
**Action:** Always use dynamic `aria-label` and `title` attributes that reflect the *target* state (e.g., "Switch to dark theme") rather than the *current* state or a generic description.

## 2026-04-16 - Form Field Accessibility
**Learning:** Forms utilizing shadcn/ui `<Input>` components frequently rely only on placeholders for visual context, lacking explicit `<Label>` associations. This makes the inputs inaccessible to screen reader users who rely on programmatic label associations (`id` + `htmlFor`) for context. Additionally, dynamic error messages often lack `role="alert"`, meaning they are not announced when they appear.
**Action:** When implementing or fixing forms, always import `<Label>` from `@/components/ui/label` and associate it explicitly with the corresponding `<Input>` using `htmlFor` and `id`. Furthermore, wrap error messages in a container with `role="alert"` so they are immediately announced to assistive technologies upon render.

## 2026-04-17 - Added loading spinner to async submit button
**Learning:** Adding a visual loading spinner (`Loader2` with `animate-spin`) combined with `aria-busy={true}` on async submit buttons (like the Auth form) is an incredibly effective micro-UX improvement. It prevents duplicate submissions and provides screen readers with immediate context that the operation is processing.
**Action:** Always include a visual loading state with `aria-busy` for critical user flows like sign-in, sign-up, or payment forms to improve both accessibility and user confidence.

## 2026-04-21 - Form Field Accessibility
**Learning:** Forms utilizing shadcn/ui `<Input>` components frequently rely only on placeholders for visual context, lacking explicit `<Label>` associations. This makes the inputs inaccessible to screen reader users who rely on programmatic label associations (`id` + `htmlFor`) for context. Applying `sr-only` classes to the labels is an effective way to maintain the current visual design while improving accessibility.
**Action:** When implementing or fixing forms, always import `<Label>` from `@/components/ui/label` and associate it explicitly with the corresponding `<Input>` using `htmlFor` and `id`. If visual constraints prevent visible labels, apply the `sr-only` class to the `<Label>` element.

## 2026-04-20 - Disabled Button Tooltips and Testing
**Learning:** Adding Tooltips to disabled buttons requires wrapping the disabled button in a standard non-disabled container (like `<div className="inline-block">`) within the `<TooltipTrigger asChild>`. Native disabled buttons do not emit pointer events, meaning hover actions to trigger tooltips will fail to register (both for users and in Playwright E2E tests).
**Action:** Always wrap disabled buttons with a `<div>` or similar container element when attaching Tooltips to ensure hover and focus events are correctly captured and the tooltip is displayed.

## 2026-04-23 - Consistent Scalable Iconography
**Learning:** Raw Unicode characters (like ✓ and ×) are problematic for UI controls because they render inconsistently across operating systems and cannot be styled robustly (like applying `strokeWidth` or exact scaling). They can cause layout jumps or visual discrepancies between mobile and desktop views.
**Action:** Always use SVG icon libraries (like `lucide-react`) for standard UI controls (checkboxes, delete buttons, chevrons) instead of Unicode characters to ensure cross-platform visual consistency and styling flexibility.

## 2026-04-26 - Authentication Password Visibility Toggle
**Learning:** Password inputs without a visibility toggle cause significant user friction, especially on mobile devices where mistyping is common. An accessible toggle (using an absolute positioned button within a relative container) is a critical pattern for all authentication forms.
**Action:** Whenever implementing password fields, always include a 'show/hide' toggle button. Ensure the button uses `type='button'` to prevent form submission, has clear `aria-label`s ('Show password' / 'Hide password') based on current state, and maintains `focus-visible` styles for keyboard navigation.

## 2026-04-30 - [Tooltip Delay Verification]
**Learning:** When writing Playwright scripts to visually verify Radix UI/shadcn `Tooltip` components, the default transition/delay makes immediate screenshots after `.hover()` unreliable (they capture before the tooltip appears).
**Action:** Always include an explicit wait (e.g., `time.sleep(1)`) between the `.hover()` action and `page.screenshot()` when verifying tooltips or other delayed interactive elements.


## 2026-05-02 - Icon-Only Button Tooltips
**Learning:** Native `title` attributes on icon-only buttons (like those in task lists for completing, deleting, and reordering tasks) often feel unpolished and lack proper visual alignment with the design system. Furthermore, relying entirely on `title` doesn't provide the level of customizability required for a consistent, accessible experience, and they can sometimes conflict with or fail to appear alongside dynamic states. Using Radix `Tooltip` components significantly elevates the UX by rendering styled tooltips with consistent delays and animations.
**Action:** When working with icon-only interactive elements in lists or repetitive UI components, always prioritize wrapping them in `@radix-ui/react-tooltip` components instead of relying on the native HTML `title` attribute. Ensure the `TooltipProvider` is properly placed and `delayDuration` is adjusted if necessary.

## 2024-05-19 - Added Delete Confirmation Dialog
**Learning:** Destructive actions like deleting tasks should require confirmation to prevent accidental data loss, especially on touch interfaces where swipe gestures might misfire. Using `AlertDialog` provides a native-feeling, accessible confirmation step.
**Action:** Always wrap destructive actions (buttons or swipe gestures) with an accessible `AlertDialog` or equivalent confirmation mechanism.

## 2026-05-06 - Input Clear Buttons
**Learning:** Text inputs (like task creation fields) without a quick "clear" button force users to repeatedly press backspace or manually select all text to delete it, causing significant friction on both desktop and mobile. Adding a conditionally rendered, accessible clear button (using an `X` icon inside a relative input wrapper) greatly improves the speed of repetitive data entry.
**Action:** When implementing main text input fields, especially for creation flows, include an absolute-positioned clear button that appears when the input has content. Ensure clicking it clears the state and refocuses the input using a `ref`.
