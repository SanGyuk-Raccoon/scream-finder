# ScrimFinder Project Guide (CLAUDE.md)

This document defines the architectural boundaries and development processes for the ScrimFinder project. All AI agents MUST strictly adhere to these guidelines.

## 🚀 Core Commands
- **Dev Server**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Unit/Integration Tests**: `npm run test`
- **E2E Tests**: `npm run test:e2e`
- **Test UI**: `npm run test:ui`

## 🛠 Development Lifecycle (Mandatory)
Every feature implementation MUST follow this 4-step sequence. No implementation code should be written until Step 3 is completed and validated.

1. **Design & Requirements**: Define business logic, input/output, and all potential edge cases.
2. **Contract-First (Layer 0)**: Define all necessary data structures and function interfaces in `src/shared/types`.
3. **TDD - Red Phase**: Write unit and integration tests that cover 100% of requirements and edge cases. **Run the tests to confirm they fail.**
4. **Green Phase**: Write the minimum code required to pass the tests, adhering to the architectural constraints below.

## 📁 Folder Responsibilities & Constraints (Layer 0-4)

### 1. `src/shared` (Layer 0: The Contract)
- **Role**: Common language between Server and Client.
- **Responsibility**: Type definitions (`types/`) and constants (`constants/`).
- **Constraints**: 
    - **No Execution Logic**: Only definitions (`interface`, `type`, `enum`, `const`).
    - **Zero Internal Dependencies**: Must NOT import from `src/server`, `src/client`, or `src/app`.

### 2. `src/server` (Layer 1-3: The Fortress)
- **Role**: Secure backend operations and business intelligence.
- **Responsibility**: Database access, external APIs (Riot, Discord), core logic, and Server Actions.
- **Constraints**:
    - **Strict Isolation**: Must start with `import 'server-only'`.
    - **Logic Sub-layer (`logic/`)**: Pure functions only (DOP). No side effects (no DB/API calls).
    - **Services Sub-layer (`services/`)**: Infrastructure integration (DB, external APIs).
    - **Actions Sub-layer (`actions/`)**: Gateway for client requests. Orchestrates services and logic.
    - **No Client Imports**: Must NOT import from `src/client` or `src/app`.

### 3. `src/client` (Layer 4: The UI Library)
- **Role**: User interaction and visual representation.
- **Responsibility**: UI Components, State management, Browser-specific hooks.
- **Constraints**:
    - **Interaction Only**: Focused on UI/UX and browser events.
    - **No Direct Infrastructure**: MUST communicate with the server ONLY via `src/server/actions`.

### 4. `src/app` (The Orchestrator)
- **Role**: Next.js Routing and Page composition.
- **Responsibility**: URL mapping (`page.tsx`), Layouts, Global Styles.
- **Constraints**:
    - **Composition Focus**: Delegates to `client/` for UI and `server/` for business logic.

## 💎 Core Principles
- **Data-Oriented Programming (DOP)**: Keep logic pure and data separate.
- **Server-Only**: Strictly enforce physical separation to prevent leaks.
- **Edge Case First**: Testing must cover boundaries and invalid states before "Happy Path" implementation.
