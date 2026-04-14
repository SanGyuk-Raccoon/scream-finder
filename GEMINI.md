# ScrimFinder Development Guidelines (GEMINI.md)

This document defines the strict architectural boundaries and development processes for the ScrimFinder project. All AI agents and developers MUST adhere to these rules.

## 🚀 Strict Development Lifecycle (Mandatory)
Every feature implementation MUST follow this 4-step sequence. No implementation code should be written until Step 3 is completed and validated.

1. **Design & Requirements**: Clearly define the business logic, input/output, and all potential edge cases.
2. **Contract-First**: Define all necessary data structures and function interfaces in `src/shared/types`.
3. **Comprehensive Testing (TDD - Red Phase)**: Write unit and integration tests that cover 100% of the defined requirements and edge cases. **Run the tests to confirm they fail.**
4. **Implementation (Green Phase)**: Write the minimum code required to pass the tests, adhering to the architectural constraints below.

---

## 📁 Folder Responsibilities & Constraints

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

---

## 🛠 Core Principles
- **Physical Separation**: Use `server-only` to prevent leaks.
- **Data-Oriented Programming (DOP)**: Keep logic pure and data separate.
- **Contract-First**: Define types in `shared/` before implementation.
- **Edge Case First**: Testing must cover boundaries and invalid states before "Happy Path" implementation.
