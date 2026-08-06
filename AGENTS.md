# AGENTS.md — Citizen Grievance Portal

## Core Architecture & Stack
- Tech Stack: Spring Boot (MVC, Data JPA), React (Tailwind/Vite), MySQL, Maven[cite: 2, 6].
- Layered Pattern: Controller → Service → Repository → Database[cite: 2, 4].
  - Controllers (controller/): Thin[cite: 2, 3]. Expose REST endpoints, validate input DTOs, delegate to Services, return ResponseEntity[cite: 2, 3, 4]. No DB access or business logic[cite: 2, 3, 4].
  - Services (service/): Heart of business logic, multi-repo orchestration, transactions, and authorization[cite: 2, 3, 4]. HTTP-agnostic[cite: 2].
  - Repositories (repository/): Database queries/JPQL only[cite: 2, 4]. No business rules[cite: 2, 4].
- Authentication: Custom server-side session authentication using HTTP cookies[cite: 1, 2, 6]. DO NOT use JWT, Spring Security, or OAuth[cite: 3, 6, 7].
- Data Flow: Never expose JPA Entities directly via REST[cite: 2, 3, 4]. Always map Entities to DTOs (*Request, *Response) in the Service layer[cite: 1, 2, 3].

---

## Folder Structure

citizen-grievance-portal/
├── AGENTS.md                         # Single Source of Truth
├── backend/
│   └── src/main/java/com/project/citizengrievance/
│       ├── advice/                   # Global exception handling (@ControllerAdvice)[cite: 2, 4]
│       ├── config/                   # Web, CORS, Swagger configurations[cite: 2, 4]
│       ├── controller/               # REST Controllers[cite: 2, 4]
│       ├── dto/                      # Request & Response DTOs[cite: 2, 4]
│       ├── entity/                   # JPA Persistence Models[cite: 2, 4]
│       ├── exception/                # Custom Business Exceptions[cite: 2, 4]
│       ├── filter/                   # Session & Auth Filters[cite: 2, 4]
│       ├── repository/               # Spring Data JPA Repositories[cite: 2, 4]
│       ├── service/                  # Business Logic & Transactions[cite: 2, 4]
│       ├── strategy/                 # Strategy pattern implementations[cite: 2, 4]
│       └── util/                     # Stateless Utility Helpers[cite: 2, 4]
├── frontend/
│   └── src/
│       ├── components/               # Reusable UI elements[cite: 4]
│       ├── pages/                    # Route View Components[cite: 4]
│       ├── services/                 # Axios API calls[cite: 4]
│       └── contexts/                 # React Contexts[cite: 4]
└── docs/ai/                          # Dynamic State Files (Agent-Managed)
    ├── database-schema.md
    ├── decision-log.md
    ├── mistakes.md
    ├── project-memory.md
    └── session-handoff.md

---

## REST & Coding Rules
- Base URL: /api/v1/ with plural nouns (/complaints, /users)[cite: 1].
- HTTP Methods: GET (Read), POST (Create), PUT (Replace), PATCH (Update), DELETE (Remove)[cite: 1].
- Response Standard: { "success": boolean, "message": string, "data": object|array, "timestamp": string }[cite: 1, 2].
- Dependency Injection: Mandatory constructor injection (private final). NO @Autowired on fields[cite: 3].
- API Documentation Mandate: Immediately update Swagger/OpenAPI annotations whenever an endpoint is created, updated, or modified[cite: 1, 3, 7].

---

## Git Workflow Guidelines
- Branches: main (Production)[cite: 5], develop (Integration)[cite: 5], feature/<name> (New features)[cite: 5], bugfix/<name> (Fixes)[cite: 5].
- Conventional Commits: <type>(<scope>): <summary> (Types: feat, fix, refactor, docs, style, test, build)[cite: 5].
- Execution Safeguards: Never commit, push, create, merge, or delete branches automatically without explicit approval[cite: 5, 7]. Suggest conventional commit messages instead[cite: 5, 7].

---

## Agent Execution & Memory Maintenance
1. Context Load: Read docs/ai/session-handoff.md and docs/ai/project-memory.md before writing code[cite: 7].
2. Implementation: Keep code minimal and re-use existing utilities/services[cite: 3, 4, 7].
3. Mandatory API Documentation Sync: Update Swagger annotations after modifying any controller, request DTO, or response DTO[cite: 1, 3, 7].
4. Dynamic Memory Maintenance:
   - Update docs/ai/database-schema.md and docs/ai/decision-log.md if schema or core patterns change[cite: 7].
   - Log bug fixes or anti-patterns to docs/ai/mistakes.md (limit to last 10 entries)[cite: 7].
5. Session Wrap-Up: Overwrite docs/ai/session-handoff.md at the end of every task with completed progress and next steps.