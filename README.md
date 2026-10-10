# Team Task Dashboard

A focused, high-performance team sprint task dashboard built with Next.js App Router, TypeScript, Tailwind CSS, TanStack Query v5, and Zustand.

The project prioritizes a dependable, responsive, and well-tested core workspace: optimistic status mutations with instant snapshot rollback on network failures, synchronized Kanban board and tabular views, debounced search, multi-criteria filtering, shareable URL query persistence, and chaos testing controls.

---

## 1. Architectural Overview

### Server State & Optimistic UI (TanStack Query v5)
- **Cache Strategy**: Queries are keyed deterministically by filter criteria (`['tasks', filters]`).
- **Optimistic Mutations**: Status changes (via drag-and-drop, quick action buttons, or inline table dropdowns) immediately update the client cache.
- **Rollback on Failure**: When mutations fail (or when the **Fault Sim** toggle is active), the prior cache snapshot is restored, and an alert notifies the user that the action was reverted.
- **Cache Parity**: Updates made on the Kanban board immediately synchronize with the Table view and top-level metric counters.

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

Visit **[http://localhost:3000](https://teamtaskassignment-henna.vercel.app/)** in your browser.

---

## 3. Honest Status: Completed Features vs Incomplete Features

Per project requirements to prioritize a working, tested core and honestly disclose incomplete items:

### Completed & Working Core Features
1. **Interactive Task Dashboard**: Full-width focused workspace featuring metric overview cards, view toggling, and 4 colored Kanban lanes.
2. **105 Seeded Synthetic Tasks**: Complete engineering dataset across realistic priorities and milestones.
3. **Optimistic Updates & Rollback**: Instant status progression with automatic rollback on network failure.
4. **Chaos Testing Controls**: Interactive **Fault Sim: Off/On** switch, delay selector (0ms, 300ms, 800ms), and **Reset 105 Tasks** button directly in the top header.
5. **Synchronized Board & Table Views**: Switching between **Board View** and **Table View** maintains identical task states and counts.
6. **Accessible Keyboard Controls**: Action buttons on every card (`Move to In Progress ->`, etc.) and dropdown selectors enable complete keyboard-driven navigation without a mouse.
7. **Filter & Search Synchronization**: Debounced search input, multi-faceted filtering (status, priority, assignee), and URL query parameter reflection.
8. **Validated Task Creation**: Modal dialog with Zod schema validation for title, description, priority, and due date.
9. **Automated Test Suite**: 9 passing tests in Vitest covering combined filters, optimistic mutation rollback, and cross-view cache parity.

### Incomplete Features (Current Scope Limitations)
The following interactive elements currently present on the dashboard are visual representations and are not yet fully wired to backend flows:
- **Card Attachments & Replies**: The paperclip (attachments: 1) and comment bubble (replies: 3) icons on task cards are static display indicators. Clicking them does not currently open a file attachment viewer or an interactive discussion thread modal.
- **Team Avatar Stack**: The member circles in the header (`AR`, `EC`, `MV`, `SJ`, `+5`) visually indicate project contributors, but clicking them does not currently trigger an assignee quick-filter or member profile dialog.
- **Metric Card Drill-Down Arrows**: The diagonal arrow icons (`↗`) on the four summary metric cards are visual accents and do not currently navigate to deep-dive analytics or apply automatic status filter presets.
- **Card Sub-Task Checklists**: Task cards render a computed progress bar and note, but granular inline checklist item ticking within individual cards is not yet supported.
- **Persistent Database Storage**: Task mutations persist in the in-memory server store for the life of the process, but reset to the 105 seeded tasks on a full server reboot.
- **Live WebSocket Collaboration**: Cross-tab synchronization relies on TanStack Query cache invalidation and window focus refetching rather than a live bi-directional WebSocket connection.

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
- Task dashboard layout implementation, metric banners, and view switcher.
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
