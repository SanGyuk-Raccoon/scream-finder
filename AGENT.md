# ScrimFinder Agent Guide

This document defines the architectural boundaries and development process for the ScrimFinder project. All agents and developers should follow these rules.

## Next.js Note

This repository uses a Next.js version that may differ from common defaults. Before changing framework-specific code, check the relevant guide in `node_modules/next/dist/docs/` when available, and pay attention to deprecations and version-specific behavior.

## Development Lifecycle

Every feature should follow this sequence:

1. Design and requirements
   Define business logic, input and output, and edge cases.
2. Contract first
   Define types and interfaces in `src/shared/types`.
3. Testing first
   Write unit and integration tests for the defined requirements and edge cases, then confirm they fail.
4. Implementation
   Write the minimum code needed to satisfy the tests while following the folder rules below.

## Folder Rules

### `src/shared`

- Role: shared contract layer between server and client
- Allowed contents: `types/`, `constants/`
- Constraints:
  - Definitions only: `type`, `interface`, `enum`, `const`
  - No execution logic
  - No imports from `src/server`, `src/client`, or `src/app`

### `src/server`

- Role: secure backend operations and business logic
- Allowed contents: logic, services, actions, repository and infrastructure code
- Constraints:
  - Files must start with `import "server-only";`
  - `logic/`: pure functions only, no side effects
  - `services/`: infrastructure integration such as Discord, Riot, Supabase
  - `actions/`: entry points that orchestrate services and logic
  - No imports from `src/client` or `src/app`

### `src/client`

- Role: UI interaction layer
- Allowed contents: components, hooks, state, browser-only behavior
- Constraints:
  - No direct infrastructure access
  - Communicate with the server only through `src/server/actions`

### `src/app`

- Role: Next.js routing and composition
- Allowed contents: routes, layouts, pages, global styles
- Constraints:
  - Focus on composition and routing
  - Delegate business logic to `src/server/actions`
  - Delegate reusable UI to `src/client`

## Core Principles

- Use `server-only` to enforce physical separation.
- Keep logic data-oriented and side-effect free where possible.
- Define contracts in `src/shared` before implementation.
- Cover invalid states and boundary cases before the happy path.
