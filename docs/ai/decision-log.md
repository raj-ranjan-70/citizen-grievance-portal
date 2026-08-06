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
