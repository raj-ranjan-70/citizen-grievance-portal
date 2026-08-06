# Project Memory - Citizen Grievance Portal

## Tech Stack
- Backend: Spring Boot (v4.1.0 parent POM) | Java 21/25 | MySQL 8.0 | Maven
- Frontend: React | Tailwind CSS | Vite
- Auth: Custom Cookie Session Auth (with DB-backed `user_sessions` fallback)
- API Docs: Springdoc OpenAPI (Swagger UI) at `/swagger-ui/index.html`

## Active Modules & Data Models
- **Auth Module:** Handles user registration, login, logout, and active session status.
- **Key Entities:**
  - `User` (UUID PK): `users` table. Represents Citizens, Officers, and Admins.
  - `UserSession` (String PK): `user_sessions` table. Links session tokens to users for auth persistence and validation.

## Key Conventions
- Base Package: `com.raj.citizen_grievance_backend`
- DTO Requirement: Strict DTO conversion in the Service Layer (`AuthService`).
- Dependency Injection: Constructor injection only (strictly no field-level `@Autowired`).
- Response Envelope: Wrap all REST responses in `ApiResponse<T>`.