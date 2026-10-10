# NovaBoard Mobile & Core Engine - Sprint Task Dashboard

A high-performance team sprint task dashboard built with Next.js App Router, TypeScript, Tailwind CSS, TanStack Query v5, and Zustand.

The user interface is modeled directly after the **NovaBoard / Donezo Sprint Engine** reference layout, focusing on a dependable, responsive, and thoroughly tested core.

---

## 1. Architectural Overview

### Server State & Optimistic UI (TanStack Query v5)
- **Cache Strategy**: Queries are keyed deterministically by filter criteria (`['tasks', filters]`).
- **Optimistic Mutations**: Status moves (via drag-and-drop, quick action buttons, or inline dropdowns) immediately update the client cache.
- **Rollback on Failure**: When mutations fail (or when the **Fault Sim** toggle is active), the prior cache snapshot is restored, and an alert notifies the user that the action was reverted.
- **Cache Parity**: Updates made on the Kanban board immediately synchronize with the List/Table view and top-level metric counters.

### Local Client State (Zustand)
- Manages active view preferences (`kanban` vs `table`), chaos engineering toggles (`failMutations`), and network delay parameters (`latencyMs`) with local storage persistence.

### Mock API & Data Layer
- **Seeded Dataset**: 105 realistic synthetic tasks distributed across 8 team members, 4 workflow lanes (`todo`, `in_progress`, `in_review`, `done`), and 4 priority tiers (`low`, `medium`, `high`, `urgent`).
- **Route Handlers**:
  - `GET /api/tasks`: Supports search keywords, status, priority, assignee, sorting, and pagination.
  - `POST /api/tasks`: Validates payloads via Zod and creates new tasks.
  - `PATCH /api/tasks/[id]`: Updates task status, assignee, and fields with chaos failure simulation.
  - `DELETE /api/tasks/[id]`: Removes tasks from the workspace.
  - `POST /api/reset`: Restores the in-memory store to the original 105 seeded tasks.
  - `GET /api/assignees`: Provides team member metadata and role assignments.

---

## 2. Getting Started

### Prerequisites
- Node.js 18.18 or higher (tested on Node.js v22.17.1)
- npm 9 or higher

### Installation & Run
```bash
# Install dependencies
npm install

# Run automated test suite
npm test

# Start development server
npm run dev
```

Visit **http://localhost:3000** in your browser.

---

## 3. Honest Status: Completed vs Intentionally Omitted Scope

Per user instruction to prioritize a rock-solid working core and be transparent about incomplete or excluded items:

### Completed & Working Features
1. **NovaBoard Reference Design**: Sidebar, top navigation, metrics cards, view tabs, and 4 colored Kanban lanes matching the reference layout.
2. **105 Seeded Synthetic Tasks**: Complete dataset spanning real engineering scenarios.
3. **Optimistic Updates & Rollback**: Instant status progression with rollback if the API fails.
4. **Chaos Testing Controls**: Interactive **Fault Sim: Off/On** switch, delay selector (0ms, 300ms, 800ms), and **Seed 105** reset button in the top bar.
5. **Synchronized Board & List Views**: Switching between **Board** and **List** tabs maintains identical task states and counts.
6. **Accessible Keyboard Controls**: Action buttons on every card (`Move to In Progress ->`, etc.) and dropdown selectors enable complete keyboard-driven navigation without a mouse.
7. **Filter & Search Synchronization**: Debounced search input, multi-faceted filtering, and URL query parameter reflection.
8. **Validated Task Creation**: Dialog with schema validation for title, description, priority, and due date.
9. **Automated Test Suite**: 9 passing tests in Vitest covering combined filters, optimistic mutation rollback, and cross-view cache parity.

### Intentionally Omitted / Incomplete Scope
As agreed, the following secondary widgets and sub-pages were omitted to maintain a clean, stable core:
- **Standalone Settings & Profile Pages**: Settings and profile buttons are visual indicators in the navigation bar and do not navigate to separate sub-routes.
- **Standalone Notifications Component**: In-app notifications use toast alert banners for rollback/success rather than a full inbox screen.
- **Active Sprint Focus Timer**: The standalone live countdown clock widget was not implemented.
- **Upcoming Sync Meeting Widget**: The Google Meet quick-action card was omitted.
- **Circular Sprint Progression Chart**: Progress is tracked via linear percentage indicators rather than an SVG radial donut chart.
- **External Database & Authentication**: The mock layer runs in-memory with zero external database dependencies.
- **WebSockets**: State updates rely on TanStack Query cache synchronization rather than a WebSocket server.

---

## 4. Plan for 3-Developer Sprint

### Developer 1: Backend Architecture & Validation (Lead)
- Data schemas, synthetic task generator (105 items), and Next.js route handlers.
- Search, filter algorithms, pagination logic, and sorting engines.
- Chaos headers and unit tests for filter combinations.

### Developer 2: TanStack Query & Optimistic State
- React Query client configuration, mutation hooks, and snapshot rollback handlers.
- Zustand persistence store, chaos engineering toggle controls, and toast notifications.
- Vitest suites verifying optimistic updates and cache reversal upon network error.

### Developer 3: UI, Accessibility & Views
- NovaBoard layout implementation, responsive sidebar, metric banners, and view switcher.
- Drag-and-drop Kanban board with keyboard-friendly action buttons.
- Data table component with sortable headers and pagination controls.
- Keyboard focus management and WCAG accessibility standards.

---

## 5. Code Review Checklist

- [ ] **Optimistic Mutation Safety**: Cancels queries before mutating, takes cache snapshot, reverts on error, invalidates on settled.
- [ ] **Filter Reset**: Changing filters resets pagination to page 1.
- [ ] **Search Debounce**: Search input is debounced by 300ms before sending network requests or modifying URLs.
- [ ] **Drag Alternative**: Every drag-and-drop card provides a keyboard-accessible button or select control.
- [ ] **Color Contrast**: Form controls and badges meet WCAG AA contrast criteria.
- [ ] **Zero Compilation Warnings**: TypeScript builds without errors under strict mode.
- [ ] **Automated Test Verification**: All Vitest test suites execute and pass.

---

## 6. AI Assistance Disclosure

In accordance with transparent engineering practices:
- AI assistance was used for initial code scaffolding, synthetic seed dataset creation, and test case structuring.
- Architectural design, optimistic state management, accessibility patterns, and UI alignment with the reference mockup were directed and validated to ensure strict compliance with project specifications.
