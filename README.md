# Team Task Dashboard

A high-performance team task management dashboard built with Next.js App Router, TypeScript, Tailwind CSS, TanStack Query v5, and Zustand.

The project prioritizes a reliable, responsive, and thoroughly tested core workspace: optimistic status mutations with instant snapshot rollback on network failures, synchronized Kanban and tabular views, debounced search, multi-faceted filtering, shareable URL query persistence, and chaos testing controls.

---

## 1. Architecture Overview

### State Management Separation
- **Server State (TanStack Query v5)**:
  - Manages asynchronous task collections, individual task records, and team member directories.
  - Query keys follow structured tuples: `['tasks', filters]`.
  - Mutations (`useUpdateTask`, `useDeleteTask`) apply instant optimistic updates to the cache while creating rollback snapshots. If an API request fails, the cache immediately reverts to its previous state and notifies the user with a rollback banner.
  - On settled execution, cache invalidation refetches the current dataset to ensure absolute consistency with backend state.

- **Client State (Zustand with LocalStorage Persistence)**:
  - Handles UI layout preferences: active view mode (`kanban` vs `table`), theme preference (`dark` vs `light`), and active toast notifications.
  - Controls chaos engineering flags: `failMutations` (forces API routes to reject with 500 status codes) and `latencyMs` (simulates artificial network latency from 0ms to 1500ms).

### Data Layer & Mock API
- **In-Memory Store (`src/lib/mockData.ts`)**:
  - Pre-seeded with 105 realistic synthetic tasks distributed across 8 team members, 5 workflow statuses (`backlog`, `todo`, `in_progress`, `in_review`, `done`), and 4 priority tiers (`low`, `medium`, `high`, `urgent`).
  - Next.js Route Handlers:
    - `GET /api/tasks`: Supports search keywords, status, priority, assignee, sorting, and pagination. Computes dynamic facet counts for the current filtered slice.
    - `POST /api/tasks`: Validates schema via Zod and creates records with 201 response.
    - `GET /api/tasks/[id]`: Retrieves specific task records.
    - `PATCH /api/tasks/[id]`: Modifies properties (status, assignee, priority, description) and checks failure simulation headers.
    - `DELETE /api/tasks/[id]`: Removes tasks while supporting chaos rejection.
    - `POST /api/reset`: Restores the in-memory store back to the clean 105 seeded tasks.
    - `GET /api/assignees`: Provides team roster metadata and avatar endpoints.

### Dual Synchronized Views
- **Kanban Board (`src/components/KanbanBoard.tsx`)**:
  - Five distinct status lanes with active drop indicators.
  - HTML5 native drag-and-drop support.
  - Accessible keyboard control: each card provides a dedicated "Move to status" dropdown selector, allowing screen reader and keyboard-only users to transition tasks between columns using standard Tab and Enter keys without a mouse.
- **Data Table (`src/components/TaskTable.tsx`)**:
  - Sortable column headers (Title, Status, Priority, Due Date).
  - Inline status and priority dropdowns allowing direct optimistic editing.
  - Pagination controls with configurable items per page (10, 20, 50).
  - Synchronized cache: editing a task in the table instantly updates its location and column count on the Kanban board.

---

## 2. Getting Started

### Prerequisites
- Node.js 18.18 or higher (tested on Node.js v22.17.1)
- npm 9 or higher

### Installation
```bash
npm install
```

### Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Automated Tests
```bash
npm test
```
Runs the Vitest suite covering combined filters, optimistic mutation rollback, and view synchronization.

### Building for Production
```bash
npm run build
npm start
```

---

## 3. Completed Features & Intentional Limitations

### Completed Core Features
1. **Seeded Synthetic Dataset**: 105 realistic tasks with varied assignees, milestones, tags, and dates.
2. **REST API Handlers**: Full CRUD, pagination, multi-criteria filtering, and facet calculations.
3. **Optimistic UI with Rollback**: Instant status transitions that immediately snapshot and restore on simulated 500 errors.
4. **Chaos Controls**: Real-time toggle for mutation failure injection, latency tuning (0ms to 1500ms), and database reset button.
5. **Synchronized Kanban & Table**: Both views share the same query cache and stay in exact parity.
6. **Accessible Navigation**: Alternative keyboard dropdowns on all cards for users who cannot use drag-and-drop.
7. **URL Parameter Sync**: Debounced search and multi-select filters serialize directly to URL search parameters for link sharing.
8. **Zustand Persistence**: Saved preferences for view mode, theme, and simulation parameters survive page refreshes.
9. **Automated Test Coverage**: Test suites for filtering combinations, cache rollback on failure, and cross-view cache parity.

### Intentional Limitations & Out-of-Scope Items
- **Persistent Database**: An in-memory store was selected for this assessment to ensure self-contained, zero-dependency setup without requiring external PostgreSQL/Redis credentials. Data resets to seeded state on cold server restarts (or via the UI Reset button).
- **Authentication**: User logins and permission-based role gates were omitted to prioritize core task management and optimistic UX.
- **WebSocket Live Collab**: Cross-tab synchronization relies on query cache invalidation and window focus refetching rather than real-time WebSockets.

---

## 4. Team Division Plan (3 Developers)

To deliver this system in a multi-developer environment, work would be segmented into three parallel streams:

### Developer 1: Backend Architecture & Data Contracts (Lead)
- **Scope**: Data models, synthetic dataset generation, REST API Route Handlers, error simulation middleware, and server-side validation schemas.
- **Deliverables**:
  - `src/types/task.ts` & Zod validation rules.
  - Route handlers: `/api/tasks`, `/api/tasks/[id]`, `/api/assignees`, `/api/simulate`.
  - Integration tests for filtering, sorting algorithms, and facet count aggregations.

### Developer 2: Server State & Optimistic Mutation Engine
- **Scope**: TanStack Query integration, optimistic UI cache management, rollback mechanics, and toast feedback systems.
- **Deliverables**:
  - `src/hooks/useTasks.ts` with custom mutations and rollback snapshots.
  - Error banner, toast alert, and retry components.
  - Chaos simulation bar and Zustand persistent preferences.
  - Unit tests verifying snapshot restoration on simulated failure.

### Developer 3: Interactive UI Views & Accessibility
- **Scope**: Responsive layouts, Kanban board drag-and-drop, accessible keyboard fallback controls, paginated data table, and URL query synchronization.
- **Deliverables**:
  - `src/components/KanbanBoard.tsx` (drag-and-drop + keyboard action menus).
  - `src/components/TaskTable.tsx` (sorting headers, inline edits, pagination).
  - `src/components/FilterBar.tsx` (debounced search, filter pills, URL param syncing).
  - WCAG 2.1 AA keyboard navigation and screen reader audits.

---

## 5. Code Review Checklist

Before approving any pull request in this repository, reviewers must verify:

### Correctness & Resilience
- [ ] Optimistic mutations correctly cancel outgoing refetches before mutating cache.
- [ ] Rollback snapshots are properly captured in `onMutate` and restored in `onError`.
- [ ] `onSettled` always invalidates the relevant query keys to avoid state drift.
- [ ] Filter changes reset the pagination offset to page 1.

### Performance & Hygiene
- [ ] Search inputs are debounced (at least 250ms) to avoid request storms.
- [ ] Query keys follow deterministic tuple structures (`['tasks', filters]`).
- [ ] No unmemoized expensive transformations inside render loops.
- [ ] Components cleanly unmount without dangling timeout or event listeners.

### Accessibility (a11y)
- [ ] Interactive elements are reachable via keyboard Tab order.
- [ ] An explicit non-drag alternative exists for every drag-and-drop interaction.
- [ ] Form inputs have associated `<label>` elements or descriptive `aria-label` attributes.
- [ ] Color contrast meets WCAG 2.1 AA standards in both light and dark modes.

### Types & Testing
- [ ] Strict TypeScript mode passes with zero `any` types.
- [ ] All new logic paths include unit or integration test assertions in Vitest.
- [ ] No hardcoded configuration values or credentials.

---

## 6. AI Assistance Disclosure

In accordance with transparent engineering practices:
- Large Language Model assistance was utilized for rapid boilerplate scaffolding, synthetic seed dataset generation, and test case structuring.
- Architectural design decisions, state partitioning between Zustand and TanStack Query, optimistic rollback error-boundary strategies, and accessibility patterns were directed and validated to ensure strict adherence to prompt criteria and production best practices.
