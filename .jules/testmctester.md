## 2024-05-18 - React DnD Test Context
**Learning:** Components utilizing `react-dnd` hooks (`useDrag`, `useDrop`) will crash with a context error if rendered in isolation without a `DndProvider` in tests.
**Action:** Always wrap such components in `<DndProvider backend={HTML5Backend}>` (from `react-dnd` and `react-dnd-html5-backend`) in test files to accurately simulate the drag-and-drop environment.
