### Feature: [Feature Name]

- **Spec Document:** `../docs/00x_[feature-name]-spec.md`
- **Status:** To Do | In Progress | Done
- **Assignee:** [Your Name]

---

### Implementation Plan (Micro-Tasks)

#### Phase 1: Backend / Data Layer

- [ ] **Schema:** Modify a table in `@repo/db/schema`.
- [ ] **Migration:** Generate and apply the database migration (`pnpm run db:generate`, `pnpm run db:migrate`).
- [ ] **API Endpoint:** Create a new API route in `apps/pixel-panic-worker/src/routes/`.

#### Phase 2: Frontend / UI Layer

- [ ] **Component:** Create a new React component in `/components`.
- [ ] **State Management:** Set up state to handle form inputs (using Zustand).
- [ ] **Data Fetching:** Implement the function to call the API endpoint.

#### Phase 3: Testing & Polish

- [ ] **Unit Tests:** Write unit tests for critical logic.
- [ ] **E2E Testing Checklist:**
  - [ ] Verify the happy path.
  - [ ] Verify the error path.
