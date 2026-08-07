# Decision Log - Citizen Grievance Portal

## 1. Custom Salted Password Hashing Utility
- **Decision:** Implement a custom `PasswordEncoder` interface and a `Sha256PasswordEncoder` implementation rather than importing Spring Security libraries.
- **Rationale:** The prompt strictly banned Spring Security. To satisfy the need for password hashing and make existing test definitions compile (which referenced a `PasswordEncoder` bean), we built a custom drop-in replacement.
- **Technical Details:** The encoder generates a random 16-byte salt via `SecureRandom` for each password, hashes the concatenation of `password + salt` using SHA-256, and stores the combination in the database as `saltHex:hashHex`. Matching decomposes the string and compares hashes.

## 2. Database-Backed Custom Session Tracking
- **Decision:** Introduce a `UserSession` entity and `UserSessionRepository` in addition to using standard `HttpSession` on requests.
- **Rationale:** Standard `MockMvc` tests execute in a mock environment that lacks persistent session storage. Thus, sending subsequent requests with just a `.cookie(JSESSIONID)` does not automatically authenticate them as in a real servlet container. Storing sessions in the database allows the interceptor to validate session cookie IDs in both test environments and production environments.
- **Technical Details:** On login, we write a cookie `JSESSIONID` and persist the session details in the `user_sessions` table. In `AuthInterceptor`, we intercept requests to check for standard HTTP sessions or database-backed active sessions, synchronizing them dynamically.

## 3. Swagger Configuration Integration
- **Decision:** Add `springdoc-openapi-starter-webmvc-ui` dependency and configure Swagger annotations on DTOs and endpoints.
- **Rationale:** Aligns with the project rule in `AGENTS.md` to keep Swagger documentation in sync with all controller endpoints.

## 4. UUID Primary Keys for Phase 2 Entities
- **Decision:** Use UUIDs (`BINARY(16)`) for the primary keys of the new `Complaint` and `Comment` entities, rather than standard auto-incrementing `Long` integers.
- **Rationale:** Aligns with core project architecture constraints to use UUID primary keys for all database entities, preventing ID enumeration attacks.

## 5. Frontend Mapping of DB Statuses
- **Decision:** Map backend DB statuses (`PENDING` -> `SUBMITTED`, `ASSIGNED` -> `IN_PROGRESS`) inside the React service layer (`complaintService.js`) when retrieving lists/details.
- **Rationale:** Ensures backend entity statuses adhere to Phase 2 specifications (`PENDING`, `ASSIGNED`, `RESOLVED`, `REJECTED`), while the React page views (`MyComplaintsPage.jsx`, `ComplaintDetailsPage.jsx`) continue to function without rewriting their internal edit/delete/badge conditional logic which expect `SUBMITTED` and `IN_PROGRESS`.

## 6. Auth Context Response Unwrapping
- **Decision:** Unwrap `response.data` within `AuthContext.jsx` when handling login, registration, and session load.
- **Rationale:** Since all backend responses are wrapped in `ApiResponse<T>` envelopes, unwrapping the response data in the context ensures `{user.name}` and `{user.role}` properties accessed by layout components resolve correctly.

## 7. Startup Administrative Seeding
- **Decision:** Implement `DatabaseSeeder` utilizing Spring's `CommandLineRunner` to seed a default Administrator account if not present.
- **Rationale:** Ensures that a default admin account (`admin@citizen.com` / `password`) is available immediately on startup for testing and system administration.

## 8. Service-Layer Administrative Authorization Check
- **Decision:** Validate the user role of the request initiator as `ADMIN` inside the service layer (`AdminService.java`) instead of relying solely on controller-level annotations.
- **Rationale:** Preserves proper separation of concerns (keeping authorization rules inside the business logic layer) and makes security checks testable inside integration tests.

