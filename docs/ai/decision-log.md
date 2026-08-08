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

## 9. Officer Role & Assignment Authorization checks
- **Decision:** Validate the user role as `OFFICER` and enforce complaint ownership matching (`complaint.assignedOfficer.id === officerId`) inside `OfficerService.java` before allowing status updates or viewing active lists.
- **Rationale:** Secures complaint life-cycle transactions so that municipal officers can only query and process complaints assigned to them, preventing unauthorized data tampering.

## 10. Database Separation for Development vs Testing
- **Decision:** Set `spring.jpa.hibernate.ddl-auto=update` in the development `application.properties` and introduce a dedicated test configuration file in `src/test/resources/application.properties` pointing to a separate `citizen_grievance_test_db` database using `ddl-auto=create-drop`.
- **Rationale:** Prevents server restarts from dropping development database tables, and ensures integration test runs (which call database purging/deletions) do not wipe out development user accounts and filed complaints.

## 11. Image Upload Pipeline & Cloudflare R2 Integration
- **Decision:** Setup an AWS SDK v2 `S3Client` bean to connect to Cloudflare R2, implement a `StorageService` to validate, resize, and convert images to WebP, and add a `ComplaintImage` table mapping.
- **Rationale:** Supports attaching multiple visual records to citizen grievances to facilitate investigations and mandates proof of resolution images from officers. Converting to WebP and compressing images reduces bandwidth overhead and optimizes storage.
- **Technical Details:** The `StorageService` enforces a <5MB size limit and content-type checks, resizes to a max of 1200x1200px using `Thumbnailator`, converts to WebP via `ImageIO` (utilizing `webp-imageio` plugin), and uploads to R2 using path-style addressing. The React client integrates `react-dropzone` for drag-and-drop citizen uploads and uses native inputs for officer proof uploads.

## 12. UI/UX Improvements & Feedback Remarks (Phase 6)
- **Decision:** Introduce a dedicated `remarks` field in the database complaints table, create reject and updated resolve endpoints, restrict global navigation links for logged-in sessions, show success toasts on upload, and provide dedicated action modals.
- **Rationale:** Aligns with requirements to ensure officers provide descriptive rejection reasons and resolution details to citizens, keeps navigation focused during active sessions, and simplifies status updates.
- **Technical Details:** The `remarks` text field is updated on status changes. The React Navbar hides public links when the user is logged in. Upload alerts show transient toast overlays. Officer actions are split into distinct View, Resolve, and Reject modals. Admin detail inspect screens render all metadata, attached images, comments, and resolution proof.

## 13. Real-Time Notifications using Server-Sent Events (SSE) (Phase 7)
- **Decision:** Establish an SSE broadcast hub inside Spring Boot and consume it with a React context provider to support real-time user notifications.
- **Rationale:** Ensures citizens, officers, and administrators receive immediate notifications when complaints are created, comments posted, images attached, or assignments updated, improving overall response times.
- **Technical Details:** The `NotificationService` maintains active connection streams in a `ConcurrentHashMap` with multi-tab support. A scheduled heartbeat runs every 15s to keep connections open. Trigger points are injected into existing Services. The React app opens the SSE stream using native `EventSource` with `withCredentials: true` to forward session cookies, prepending incoming messages to states and rendering them in a customized Navbar dropdown.




